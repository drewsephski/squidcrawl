'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useCustomer } from '@/hooks/useAutumnCustomer';
import { Button } from '@/components/ui/button';
import { Send, Menu, X, MessageSquare, Plus, Trash2, Terminal, Zap } from 'lucide-react';
import { useConversations, useConversation, useDeleteConversation } from '@/hooks/useConversations';
import { useSendMessage } from '@/hooks/useMessages';
import { format } from 'date-fns';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

// Separate component that uses Autumn hooks
function ChatContent({ session }: { session: any }) {
  const router = useRouter();
  const { allowed, customer, refetch } = useCustomer();
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Queries and mutations
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: currentConversation } = useConversation(selectedConversationId);
  const sendMessage = useSendMessage();
  const deleteConversation = useDeleteConversation();
  
  // Get message usage data
  const messageUsage = customer?.features?.messages;
  const remainingMessages = messageUsage ? (messageUsage.balance || 0) : 0;
  const hasMessages = remainingMessages > 0;
  const isCustomerLoading = !customer && !session;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, sendMessage.isPending]);

  const handleSendMessage = async () => {
    if (!input.trim() || sendMessage.isPending) return;

    if (!allowed({ featureId: 'messages' })) {
      return;
    }

    try {
      const response = await sendMessage.mutateAsync({
        conversationId: selectedConversationId || undefined,
        message: input,
      });
      
      setInput('');
      
      if (!selectedConversationId && response.conversationId) {
        setSelectedConversationId(response.conversationId);
      }
      
      await refetch();
    } catch (error: any) {
      console.error('Failed to send message:', error);
    }
  };
  
  const handleNewConversation = () => {
    setSelectedConversationId(null);
  };
  
  const handleDeleteConversation = async (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (conversationToDelete) {
      await deleteConversation.mutateAsync(conversationToDelete);
      if (selectedConversationId === conversationToDelete) {
        setSelectedConversationId(null);
      }
      setConversationToDelete(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0a0a0f] relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-20 bg-[#12121a] border-r border-[#2a2a3a] flex flex-col transition-all duration-300 ease-out transform ${
          sidebarOpen
            ? 'translate-x-0 w-64 sm:w-72 lg:w-72'
            : '-translate-x-full lg:translate-x-0 w-0 border-r-0 overflow-hidden'
        }`}
      >
        <div className="p-3 sm:p-4 border-b border-[#2a2a3a]">
          <Button
            onClick={handleNewConversation}
            className="w-full btn-primary h-9 sm:h-11 text-xs sm:text-sm"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            New Chat
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 py-1.5 sm:py-2">
          {conversationsLoading ? (
            <div className="p-3 sm:p-4 text-center text-[#71717a]">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs sm:text-sm">Loading conversations...</span>
            </div>
          ) : conversations?.length === 0 ? (
            <div className="p-4 sm:p-6 text-center">
              <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-[#3f3f46] mx-auto mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-[#71717a]">No conversations yet</p>
              <p className="text-[10px] sm:text-xs text-[#52525b] mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-1 px-1.5 sm:px-2">
              {conversations?.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedConversationId === conversation.id
                      ? 'bg-[#6366f1]/10 border border-[#6366f1]/30'
                      : 'hover:bg-[#1a1a25] border border-transparent'
                  }`}
                  onClick={() => {
                    setSelectedConversationId(conversation.id);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate text-xs sm:text-sm ${
                        selectedConversationId === conversation.id ? 'text-[#6366f1]' : 'text-[#a1a1aa]'
                      }`}>
                        {conversation.title || 'Untitled Conversation'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-[#52525b] mt-0.5 sm:mt-1">
                        {conversation.lastMessageAt ? format(new Date(conversation.lastMessageAt), 'MMM d, h:mm a') : ''}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 sm:p-1.5 rounded-lg hover:bg-[#ef4444]/10 hover:text-[#ef4444] text-[#52525b] transition-all duration-200 flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Credits indicator */}
        <div className="p-3 sm:p-4 border-t border-[#2a2a3a] bg-[#0a0a0f]">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-2.5 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-[#71717a] uppercase tracking-wider font-mono">Credits</p>
                <p className="text-xl sm:text-2xl font-bold text-[#fafafa] font-mono">{remainingMessages}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#6366f1]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-[#12121a]/80 backdrop-blur-xl border-b border-[#2a2a3a] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-[#1a1a25] text-[#a1a1aa] hover:text-[#fafafa] transition-all duration-200 flex-shrink-0"
            >
              {sidebarOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <div className="h-5 sm:h-6 w-px bg-[#2a2a3a] hidden sm:block" />
            <div className="min-w-0">
              <h1 className="font-semibold text-sm sm:text-base text-[#fafafa] truncate">
                {currentConversation?.title || 'New Conversation'}
              </h1>
              {currentConversation && (
                <p className="text-[10px] sm:text-xs text-[#71717a]">
                  {currentConversation.messages?.length || 0} messages
                </p>
              )}
            </div>
          </div>

          {!sidebarOpen && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#12121a] border border-[#2a2a3a] flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
              <span className="text-xs sm:text-sm font-mono text-[#a1a1aa]">{remainingMessages}</span>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#0a0a0f]">
          {isCustomerLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4" />
                <p className="text-sm text-[#a1a1aa]">Loading your account data...</p>
              </div>
            </div>
          ) : !hasMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-xs sm:max-w-md px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#12121a] border border-[#2a2a3a] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Terminal className="w-6 h-6 sm:w-8 sm:h-8 text-[#6366f1]" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-[#fafafa] mb-2 sm:mb-3">
                  Credits Required
                </h2>
                <p className="text-xs sm:text-sm text-[#a1a1aa] mb-4 sm:mb-6 leading-relaxed">
                  Each message consumes credits from your account balance. Purchase more credits to continue chatting.
                </p>
                <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs sm:text-sm text-[#71717a] font-mono">Available Credits</p>
                      <p className="text-2xl sm:text-3xl font-bold text-[#f59e0b] font-mono">{remainingMessages}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#f59e0b]" />
                    </div>
                  </div>
                </div>
                <Button variant="indigo" size="sm" className="w-full sm:w-auto" onClick={() => router.push('/plans')}>
                  Get More Credits
                </Button>
              </div>
            </div>
          ) : currentConversation?.messages && currentConversation.messages.length > 0 ? (
            <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-16 sm:pb-20">
              {currentConversation.messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] md:max-w-[75%] rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white shadow-lg shadow-[#6366f1]/20'
                        : 'bg-[#12121a] border border-[#2a2a3a] text-[#fafafa]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-xs sm:text-sm md:text-base leading-relaxed">{message.content}</p>
                    <p className={`text-[10px] sm:text-xs mt-2 sm:mt-3 ${
                      message.role === 'user' ? 'text-white/60' : 'text-[#52525b]'
                    }`}>
                      {message.createdAt ? format(new Date(message.createdAt), 'h:mm a') : ''}
                    </p>
                  </div>
                </div>
              ))}
              {sendMessage.isPending && (
                <div className="flex justify-start">
                  <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-4">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-xs sm:max-w-md px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#12121a] border border-[#2a2a3a] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-[#6366f1]" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-[#fafafa] mb-2 sm:mb-3">
                  New Conversation
                </h2>
                <p className="text-xs sm:text-sm text-[#a1a1aa] mb-4 sm:mb-6">
                  Send a message to begin chatting with our AI assistant
                </p>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#71717a]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  <span className="font-mono">{remainingMessages} credits available</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-xl p-2.5 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2 sm:gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={hasMessages ? "Type your message..." : "No credits available"}
                disabled={!hasMessages || sendMessage.isPending}
                className="flex-1 input-intelligence h-10 sm:h-12 px-3 sm:px-4 text-sm"
              />
              <Button
                type="submit"
                variant="indigo"
                size="icon"
                className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
                disabled={!hasMessages || !input.trim() || sendMessage.isPending}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </form>
            <p className="text-[10px] sm:text-xs text-[#52525b] text-center mt-2 sm:mt-3">
              Each message uses 1 credit • {remainingMessages} credits remaining
            </p>
          </div>
        </div>
      </div>
      
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        isLoading={deleteConversation.isPending}
      />
    </div>
  );
}

export default function ChatPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading...</p>
        </div>
      </div>
    );
  }

  return <ChatContent session={session} />;
}