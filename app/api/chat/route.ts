import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Autumn } from 'autumn-js';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { 
  AuthenticationError, 
  InsufficientCreditsError, 
  ValidationError, 
  DatabaseError,
  ExternalServiceError,
  handleApiError 
} from '@/lib/api-errors';
import { 
  FEATURE_ID_MESSAGES, 
  CREDITS_PER_MESSAGE,
  ERROR_MESSAGES,
  ROLE_USER,
  ROLE_ASSISTANT,
  UI_LIMITS
} from '@/config/constants';
import { getOpenRouterClient } from '@/lib/openrouter-provider';
import * as errors from '@openrouter/sdk/models/errors';

const autumn = new Autumn({
  secretKey: process.env.AUTUMN_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Get the session
    const sessionResponse = await auth.api.getSession({
      headers: request.headers,
    });

    if (!sessionResponse?.user) {
      console.error('No session found in chat API');
      throw new AuthenticationError('Please log in to use the chat');
    }

    console.log('Chat API - User:', sessionResponse.user.id);

    const { message, conversationId } = await request.json();

    if (!message || typeof message !== 'string') {
      throw new ValidationError('Invalid message format', {
        message: 'Message must be a non-empty string'
      });
    }

    // Check if user has access to use the chat
    try {
      console.log('Checking access for:', {
        userId: sessionResponse.user.id,
        featureId: 'messages',
      });
      
      const access = await autumn.check({
        customer_id: sessionResponse.user.id,
        feature_id: FEATURE_ID_MESSAGES,
      });
      
      console.log('Access check result:', access);

      if (!access.data?.allowed) {
        console.log('Access denied - no credits remaining');
        throw new InsufficientCreditsError(
          ERROR_MESSAGES.NO_CREDITS_REMAINING,
          CREDITS_PER_MESSAGE,
          access.data?.balance || 0 
        );
      }
    } catch (err) {
      console.error('Failed to check access:', err);
      if (err instanceof InsufficientCreditsError) {
        throw err; // Re-throw our custom errors
      }
      throw new ExternalServiceError('Unable to verify credits. Please try again', 'autumn');
    }

    // Track API usage with Autumn
    try {
      await autumn.track({
        customer_id: sessionResponse.user.id,
        feature_id: FEATURE_ID_MESSAGES,
        value: CREDITS_PER_MESSAGE,
      });
    } catch (err) {
      console.error('Failed to track usage:', err);
      throw new ExternalServiceError('Unable to process credit usage. Please try again', 'autumn');
    }

    // Get or create conversation
    let currentConversation;
    
    if (conversationId) {
      // Find existing conversation
      const existingConversation = await db.query.conversations.findFirst({
        where: and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, sessionResponse.user.id)
        ),
      });
      
      if (existingConversation) {
        currentConversation = existingConversation;
        // Update last message timestamp
        await db
          .update(conversations)
          .set({ lastMessageAt: new Date() })
          .where(eq(conversations.id, conversationId));
      }
    }
    
    if (!currentConversation) {
      // Create new conversation
      const [newConversation] = await db
        .insert(conversations)
        .values({
          userId: sessionResponse.user.id,
          title: message.substring(0, UI_LIMITS.TITLE_MAX_LENGTH) + (message.length > UI_LIMITS.TITLE_MAX_LENGTH ? '...' : ''),
          lastMessageAt: new Date(),
        })
        .returning();
      
      currentConversation = newConversation;
    }

    // Store user message
    const [userMessage] = await db
      .insert(messages)
      .values({
        conversationId: currentConversation.id,
        userId: sessionResponse.user.id,
        role: ROLE_USER,
        content: message,
      })
      .returning();

    // Generate AI response using OpenRouter
    let aiResponse: string;
    
    try {
      const client = getOpenRouterClient();
      
      if (!client) {
        throw new ExternalServiceError('AI service not configured. Please contact support.', 'openrouter');
      }
      
      // Get conversation history for context (last 10 messages)
      const conversationHistory = await db.query.messages.findMany({
        where: eq(messages.conversationId, currentConversation.id),
        orderBy: [messages.createdAt],
        limit: 10,
      });
      
      // Build messages array with history
      const chatMessages = [
        { 
          role: 'system', 
          content: 'You are a helpful AI assistant for FireGeo, a brand monitoring and competitive analysis platform. Be concise, professional, and helpful.' 
        },
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];
      
      // Call OpenRouter API
      const response = await client.chat.send({
        chatRequest: {
          model: 'openrouter/elephant-alpha',
          messages: chatMessages as any,
          temperature: 0.7,
          maxTokens: 1000,
        }
      });
      
      aiResponse = response.choices?.[0]?.message?.content || 
        'I apologize, but I was unable to generate a response. Please try again.';
      
    } catch (err) {
      console.error('OpenRouter API error:', err);
      
      // Handle specific OpenRouter errors
      if (err instanceof errors.BadRequestResponseError) {
        throw new ExternalServiceError('Invalid request to AI service', 'openrouter');
      } else if (err instanceof errors.UnauthorizedResponseError) {
        throw new ExternalServiceError('AI service authentication failed', 'openrouter');
      } else if (err instanceof errors.TooManyRequestsResponseError) {
        throw new ExternalServiceError('AI service is currently busy. Please try again shortly.', 'openrouter');
      } else if (err instanceof errors.InternalServerResponseError) {
        throw new ExternalServiceError('AI service is experiencing issues. Please try again.', 'openrouter');
      } else if (err instanceof ExternalServiceError) {
        throw err;
      }
      
      throw new ExternalServiceError('Failed to generate AI response. Please try again.', 'openrouter');
    }

    // Store AI response
    const [aiMessage] = await db
      .insert(messages)
      .values({
        conversationId: currentConversation.id,
        userId: sessionResponse.user.id,
        role: ROLE_ASSISTANT,
        content: aiResponse,
        tokenCount: aiResponse.length, // Simple token count estimate
      })
      .returning();

    // Get remaining credits from Autumn
    let remainingCredits = 0;
    try {
      const usage = await autumn.check({
        customer_id: sessionResponse.user.id,
        feature_id: FEATURE_ID_MESSAGES,
      });
      remainingCredits = usage.data?.balance || 0;
    } catch (err) {
      console.error('Failed to get remaining credits:', err);
    }

    return NextResponse.json({
      response: aiResponse,
      remainingCredits,
      creditsUsed: CREDITS_PER_MESSAGE,
      conversationId: currentConversation.id,
      messageId: aiMessage.id,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return handleApiError(error);
  }
}

// GET endpoint to fetch conversation history
export async function GET(request: NextRequest) {
  try {
    const sessionResponse = await auth.api.getSession({
      headers: request.headers,
    });

    if (!sessionResponse?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Get specific conversation with messages
      const conversation = await db.query.conversations.findFirst({
        where: and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, sessionResponse.user.id)
        ),
        with: {
          messages: {
            orderBy: [messages.createdAt],
          },
        },
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      return NextResponse.json(conversation);
    } else {
      // Get all conversations for the user
      const userConversations = await db.query.conversations.findMany({
        where: eq(conversations.userId, sessionResponse.user.id),
        orderBy: [desc(conversations.lastMessageAt)],
        with: {
          messages: {
            limit: 1,
            orderBy: [desc(messages.createdAt)],
          },
        },
      });

      return NextResponse.json(userConversations);
    }
  } catch (error: any) {
    console.error('Chat GET error:', error);
    return handleApiError(error);
  }
}
