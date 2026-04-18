import { AUTUMN_PRODUCTS, AUTUMN_FEATURES, AutumnProduct, AutumnFeature } from '../config/autumn-products';
import * as dotenv from 'dotenv';

// Suppress dotenv console output
const originalLog = console.log;
console.log = (...args: any[]) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('[dotenv@')) {
    return;
  }
  originalLog(...args);
};

// Load environment variables
dotenv.config({ path: '.env.local' });

// Restore console.log
console.log = originalLog;

const AUTUMN_API_URL = 'https://api.useautumn.com/v1';
const AUTUMN_SECRET_KEY = process.env.AUTUMN_SECRET_KEY;

if (!AUTUMN_SECRET_KEY || AUTUMN_SECRET_KEY.includes('your-autumn') || AUTUMN_SECRET_KEY.includes('xxxxxxxx')) {
  console.log('⚪ Autumn billing integration not configured.');
  console.log('   To enable Autumn:');
  console.log('   1. Sign up at https://useautumn.com');
  console.log('   2. Add your AUTUMN_SECRET_KEY to .env.local');
  console.log('   3. Run: npm run setup:autumn\n');
  process.exit(0);
}

async function createFeature(feature: AutumnFeature) {
  try {
    // Check if feature exists
    const checkResponse = await fetch(`${AUTUMN_API_URL}/features/${feature.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTUMN_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (checkResponse.ok) {
      console.log(`   ✓ Feature "${feature.id}" already exists`);
      return { skipped: true };
    }

    // Create the feature
    const response = await fetch(`${AUTUMN_API_URL}/features`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTUMN_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: feature.id,
        name: feature.name,
        type: feature.type,
        consumable: feature.consumable,
        event_names: feature.event_names || [],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    console.log(`   ✓ Created feature "${feature.id}"`);
    return await response.json();
  } catch (error) {
    console.error(`   ✗ Failed to create feature "${feature.id}":`, error);
    throw error;
  }
}

async function createProduct(product: AutumnProduct) {
  try {
    // Check if product exists
    const checkResponse = await fetch(`${AUTUMN_API_URL}/plans/${product.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTUMN_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (checkResponse.ok) {
      // Product exists - try to update it
      const existingProduct = await checkResponse.json();
      const existingCredits = existingProduct.items?.[0]?.included || 0;
      const newCredits = product.items[0]?.included || 0;
      
      console.log(`   ℹ️ Product "${product.id}" exists with ${existingCredits} credits, updating to ${newCredits} credits...`);
      
      const items = product.items.map(item => ({
        feature_id: item.feature_id,
        included: item.included,
        unlimited: item.unlimited || false,
        reset: item.reset,
        price: item.price,
      }));

      const updateResponse = await fetch(`${AUTUMN_API_URL}/plans/${product.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${AUTUMN_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          description: product.description || '',
          group: product.group || 'default',
          add_on: product.add_on,
          auto_enable: product.auto_enable,
          price: product.price,
          items,
        }),
      });

      if (updateResponse.ok) {
        console.log(`   ✓ Updated product "${product.id}" with ${items[0]?.included || 0} credits`);
      } else {
        const errorText = await updateResponse.text();
        console.log(`   ⚠️ Failed to update "${product.id}": ${errorText}`);
        // Try delete and recreate
        console.log(`   🔄 Attempting to delete and recreate...`);
        await fetch(`${AUTUMN_API_URL}/plans/${product.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${AUTUMN_SECRET_KEY}` },
        });
        // Continue to create new product below
      }
      if (updateResponse.ok) {
        return { skipped: true };
      }
    }

    // Build items array for Autumn API
    const items = product.items.map(item => ({
      feature_id: item.feature_id,
      included: item.included,
      unlimited: item.unlimited || false,
      reset: item.reset,
      price: item.price,
    }));

    // Create the product (plan in Autumn v1.2.9)
    const response = await fetch(`${AUTUMN_API_URL}/plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTUMN_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: product.id,
        name: product.name,
        description: product.description || '',
        group: product.group || 'default',
        add_on: product.add_on,
        auto_enable: product.auto_enable,
        price: product.price,
        items,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    console.log(`   ✓ Created product "${product.id}"`);
    return await response.json();
  } catch (error) {
    console.error(`   ✗ Failed to create product "${product.id}":`, error);
    throw error;
  }
}

async function setupAutumn() {
  console.log('\n🔧 Setting up Autumn billing...\n');

  let featureSuccess = 0;
  let featureSkip = 0;
  let productSuccess = 0;
  let productSkip = 0;
  let errors = 0;

  // Step 1: Create features
  console.log('Creating features...');
  for (const feature of AUTUMN_FEATURES) {
    try {
      const result = await createFeature(feature);
      if (result?.skipped) {
        featureSkip++;
      } else {
        featureSuccess++;
      }
    } catch (error) {
      errors++;
    }
  }

  // Step 2: Create products
  console.log('\nCreating products...');
  for (const product of AUTUMN_PRODUCTS) {
    try {
      const result = await createProduct(product);
      if (result?.skipped) {
        productSkip++;
      } else {
        productSuccess++;
      }
    } catch (error) {
      errors++;
    }
  }

  // Summary
  console.log('\n✅ Autumn setup complete!');
  if (featureSuccess > 0) console.log(`   Created ${featureSuccess} features`);
  if (featureSkip > 0) console.log(`   ${featureSkip} features already existed`);
  if (productSuccess > 0) console.log(`   Created ${productSuccess} products`);
  if (productSkip > 0) console.log(`   ${productSkip} products already existed`);
  if (errors > 0) console.log(`   ${errors} errors occurred`);
  
  console.log('\n   Next steps:');
  console.log('   1. Go to https://useautumn.com dashboard');
  console.log('   2. Connect your Stripe account (Integrations → Stripe)');
  console.log('   3. Test the billing flow at /plans\n');
}

// Run the setup
setupAutumn().catch(error => {
  console.error('\n[ERROR] Autumn setup failed:', error);
  console.log('\nTip: You can configure Autumn manually at https://useautumn.com');
  process.exit(0);
});
