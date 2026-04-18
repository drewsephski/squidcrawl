import { Company } from './types';

export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    
    // Basic domain validation - must have at least one dot and valid TLD
    const hostname = urlObj.hostname;
    const parts = hostname.split('.');
    
    // Must have at least domain.tld format
    if (parts.length < 2) return false;
    
    // Last part (TLD) must be at least 2 characters and contain only letters
    const tld = parts[parts.length - 1];
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
    
    // Domain parts should contain valid characters (allow numbers and hyphens)
    for (const part of parts) {
      if (!/^[a-zA-Z0-9-]+$/.test(part) || part.startsWith('-') || part.endsWith('-')) {
        return false;
      }
    }
    
    return true;
  } catch (e) {
    console.error('URL validation error:', e);
    return false;
  }
}

export function validateCompetitorUrl(url: string): string | undefined {
  if (!url) return undefined;
  
  // Remove trailing slashes
  let cleanUrl = url.trim().replace(/\/$/, '');
  
  // Ensure the URL has a protocol
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  
  try {
    const urlObj = new URL(cleanUrl);
    const hostname = urlObj.hostname;
    
    // Return clean URL without protocol for display
    return hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
  } catch {
    return undefined;
  }
}

export function normalizeCompetitorName(name: string): string {
  const normalized = name.toLowerCase().trim();
  
  // Normalize common variations to canonical names
  const nameNormalizations: { [key: string]: string } = {
    'amazon web services': 'aws',
    'amazon web services (aws)': 'aws',
    'amazon aws': 'aws',
    'microsoft azure': 'azure',
    'google cloud platform': 'google cloud',
    'google cloud platform (gcp)': 'google cloud',
    'gcp': 'google cloud',
    'digital ocean': 'digitalocean',
    'beautiful soup': 'beautifulsoup',
    'bright data': 'brightdata',
  };
  
  return nameNormalizations[normalized] || normalized;
}

export function assignUrlToCompetitor(competitorName: string): string | undefined {
  // Comprehensive URL mapping for common competitors
  const urlMappings: { [key: string]: string } = {
    // Web scraping tools
    'apify': 'apify.com',
    'scrapy': 'scrapy.org',
    'octoparse': 'octoparse.com',
    'parsehub': 'parsehub.com',
    'diffbot': 'diffbot.com',
    'import.io': 'import.io',
    'bright data': 'brightdata.com',
    'zyte': 'zyte.com',
    'puppeteer': 'pptr.dev',
    'playwright': 'playwright.dev',
    'selenium': 'selenium.dev',
    'beautiful soup': 'pypi.org/project/beautifulsoup4',
    'scrapfly': 'scrapfly.io',
    'crawlbase': 'crawlbase.com',
    'webharvy': 'webharvy.com',

    // AI companies
    'openai': 'openai.com',
    'anthropic': 'anthropic.com',
    'google ai': 'ai.google',
    'microsoft azure': 'azure.microsoft.com',
    'ibm watson': 'ibm.com/watson',
    'amazon aws': 'aws.amazon.com',
    'perplexity': 'perplexity.ai',
    'claude': 'anthropic.com',
    'chatgpt': 'openai.com',
    'gemini': 'gemini.google.com',

    // SaaS platforms
    'salesforce': 'salesforce.com',
    'hubspot': 'hubspot.com',
    'zendesk': 'zendesk.com',
    'slack': 'slack.com',
    'atlassian': 'atlassian.com',
    'monday.com': 'monday.com',
    'notion': 'notion.so',
    'airtable': 'airtable.com',

    // E-commerce
    'shopify': 'shopify.com',
    'woocommerce': 'woocommerce.com',
    'magento': 'magento.com',
    'bigcommerce': 'bigcommerce.com',
    'squarespace': 'squarespace.com',
    'wix': 'wix.com',

    // Cloud/hosting
    'vercel': 'vercel.com',
    'netlify': 'netlify.com',
    'aws': 'aws.amazon.com',
    'google cloud': 'cloud.google.com',
    'azure': 'azure.microsoft.com',
    'heroku': 'heroku.com',
    'digitalocean': 'digitalocean.com',
    'cloudflare': 'cloudflare.com',
    'railway': 'railway.app',
    'render': 'render.com',
    'fly.io': 'fly.io',
    'linode': 'linode.com',
    'vultr': 'vultr.com',

    // Developer tools
    'github': 'github.com',
    'gitlab': 'gitlab.com',
    'bitbucket': 'bitbucket.org',

    // Analytics
    'google analytics': 'analytics.google.com',
    'mixpanel': 'mixpanel.com',
    'amplitude': 'amplitude.com',
    'segment': 'segment.com',
    'heap': 'heap.io',
    'plausible': 'plausible.io',

    // Marketing
    'mailchimp': 'mailchimp.com',
    'klaviyo': 'klaviyo.com',
    'activecampaign': 'activecampaign.com',
    'marketo': 'adobe.com/marketo',
    'pardot': 'salesforce.com/pardot',

    // CRM
    'pipedrive': 'pipedrive.com',
    'zoho crm': 'zoho.com/crm',
    'freshsales': 'freshworks.com/crm',
    'copper': 'copper.com',

    // Communication
    'microsoft teams': 'microsoft.com/teams',
    'discord': 'discord.com',
    'zoom': 'zoom.us',
    'twilio': 'twilio.com',
    'sendbird': 'sendbird.com',

    // Database
    'mongodb': 'mongodb.com',
    'postgresql': 'postgresql.org',
    'mysql': 'mysql.com',
    'redis': 'redis.io',
    'firebase': 'firebase.google.com',
    'supabase': 'supabase.com',

    // Security
    'auth0': 'auth0.com',
    'okta': 'okta.com',
    '1password': '1password.com',
    'lastpass': 'lastpass.com',
    'bitwarden': 'bitwarden.com',

    // Payment
    'stripe': 'stripe.com',
    'paypal': 'paypal.com',
    'square': 'squareup.com',
    'adyen': 'adyen.com',
    'braintree': 'braintreepayments.com',
    'chargebee': 'chargebee.com',

    // Search
    'google': 'google.com',
    'bing': 'bing.com',
    'duckduckgo': 'duckduckgo.com',
    'algolia': 'algolia.com',
    'elasticsearch': 'elastic.co',
    'typesense': 'typesense.org',

    // Social media
    'facebook': 'facebook.com',
    'twitter': 'twitter.com',
    'instagram': 'instagram.com',
    'linkedin': 'linkedin.com',
    'tiktok': 'tiktok.com',
    'snapchat': 'snapchat.com',

    // Video
    'youtube': 'youtube.com',
    'vimeo': 'vimeo.com',
    'twitch': 'twitch.tv',
    'wistia': 'wistia.com',
    'loom': 'loom.com',
    'vidyard': 'vidyard.com',

    // Design
    'figma': 'figma.com',
    'sketch': 'sketch.com',
    'adobe xd': 'adobe.com/products/xd',
    'canva': 'canva.com',
    'invision': 'invisionapp.com',
    'framer': 'framer.com',

    // Project management
    'asana': 'asana.com',
    'clickup': 'clickup.com',
    'trello': 'trello.com',
    'jira': 'atlassian.com/jira',

    // Outdoor gear
    'yeti': 'yeti.com',
    'rtic': 'rtic.com',
    'igloo': 'igloocoolers.com',
    'coleman': 'coleman.com',
    'hydro flask': 'hydroflask.com',
    'stanley': 'stanley1913.com',

    // Apparel
    'nike': 'nike.com',
    'adidas': 'adidas.com',
    'lululemon': 'lululemon.com',
    'under armour': 'underarmour.com',
    'patagonia': 'patagonia.com',
    'uniqlo': 'uniqlo.com',

    // Direct-to-consumer
    'warby parker': 'warbyparker.com',
    'casper': 'casper.com',
    'dollar shave club': 'dollarshaveclub.com',
    'away': 'awaytravel.com',
    'glossier': 'glossier.com',
    'allbirds': 'allbirds.com',

    // Productivity
    'evernote': 'evernote.com',
    'roam research': 'roamresearch.com',
    'obsidian': 'obsidian.md',
    'bear': 'bear.app',
    'todoist': 'todoist.com',

    // Finance
    'quickbooks': 'quickbooks.intuit.com',
    'xero': 'xero.com',
    'freshbooks': 'freshbooks.com',
    'wave': 'waveapps.com',
    'bench': 'bench.co',
    'sage': 'sage.com',

    // HR
    'gusto': 'gusto.com',
    'bamboohr': 'bamboohr.com',
    'workday': 'workday.com',
    'adp': 'adp.com',
    'rippling': 'rippling.com',
    'justworks': 'justworks.com',

    // Support
    'intercom': 'intercom.com',
    'freshdesk': 'freshworks.com/freshdesk',
    'help scout': 'helpscout.com',
    'crisp': 'crisp.chat',
    'tidio': 'tidio.com',

    // Automation
    'zapier': 'zapier.com',
    'make': 'make.com',
    'n8n': 'n8n.io',
    'workato': 'workato.com',
    'tray.io': 'tray.io',
    'automate.io': 'automate.io',

    // E-signature
    'docusign': 'docusign.com',
    'adobe sign': 'adobe.com/sign',
    'hellosign': 'hellosign.com',
    'pandadoc': 'pandadoc.com',
    'signnow': 'signnow.com',
    'signrequest': 'signrequest.com',

    // Collaboration
    'coda': 'coda.io',
    'confluence': 'atlassian.com/confluence',
    'miro': 'miro.com',
    'mural': 'mural.co',
    'lucidchart': 'lucidchart.com',

    // Monitoring
    'datadog': 'datadoghq.com',
    'new relic': 'newrelic.com',
    'sentry': 'sentry.io',
    'logrocket': 'logrocket.com',
    'honeycomb': 'honeycomb.io',
    'pagerduty': 'pagerduty.com'
  };

  const normalized = competitorName.toLowerCase().trim();
  return urlMappings[normalized];
}

export function detectServiceType(company: Company): string {
  const desc = (company.description || '').toLowerCase();
  const content = (company.scrapedData?.mainContent || '').toLowerCase();
  const companyName = (company.name || '').toLowerCase();
  
  // Check for specific industries first
  if (desc.includes('beverage') || desc.includes('drink') || desc.includes('cola') || desc.includes('soda') ||
      content.includes('beverage') || content.includes('refreshment') || companyName.includes('coca') || companyName.includes('pepsi')) {
    return 'beverage brand';
  } else if (desc.includes('restaurant') || desc.includes('food') || desc.includes('dining') ||
      content.includes('menu') || content.includes('restaurant')) {
    return 'restaurant';
  } else if (desc.includes('retail') || desc.includes('store') || desc.includes('shopping') ||
      content.includes('retail') || content.includes('shopping')) {
    return 'retailer';
  } else if (desc.includes('bank') || desc.includes('financial') || desc.includes('finance') ||
      content.includes('banking') || content.includes('financial services')) {
    return 'financial service';
  } else if (desc.includes('scraping') || desc.includes('crawl') || desc.includes('extract') ||
      content.includes('web scraping') || content.includes('data extraction')) {
    return 'web scraper';
  } else if (desc.includes('ai') || desc.includes('artificial intelligence') || desc.includes('llm') ||
      content.includes('machine learning') || content.includes('ai-powered')) {
    return 'AI tool';
  } else if (desc.includes('hosting') || desc.includes('deploy') || desc.includes('cloud') ||
      content.includes('deployment') || content.includes('infrastructure')) {
    return 'hosting platform';
  } else if (desc.includes('e-commerce') || desc.includes('online store') || desc.includes('marketplace')) {
    return 'e-commerce platform';
  } else if (desc.includes('software') || desc.includes('saas') || desc.includes('platform')) {
    return 'software';
  }
  // More generic default
  return 'brand';
}

export function getIndustryCompetitors(industry: string): { name: string; url?: string }[] {
  // Default competitors based on industry with URLs
  const industryDefaults: { [key: string]: { name: string; url?: string }[] } = {
    'web scraping': [
      { name: 'Apify', url: 'apify.com' },
      { name: 'Scrapy', url: 'scrapy.org' },
      { name: 'Octoparse', url: 'octoparse.com' },
      { name: 'ParseHub', url: 'parsehub.com' },
      { name: 'Diffbot', url: 'diffbot.com' },
      { name: 'Import.io', url: 'import.io' },
      { name: 'Bright Data', url: 'brightdata.com' },
      { name: 'Zyte', url: 'zyte.com' }
    ],
    'AI': [
      { name: 'OpenAI', url: 'openai.com' },
      { name: 'Anthropic', url: 'anthropic.com' },
      { name: 'Google AI', url: 'ai.google' },
      { name: 'Microsoft Azure', url: 'azure.microsoft.com' },
      { name: 'IBM Watson', url: 'ibm.com/watson' },
      { name: 'Amazon AWS', url: 'aws.amazon.com' }
    ],
    'SaaS': [
      { name: 'Salesforce', url: 'salesforce.com' },
      { name: 'HubSpot', url: 'hubspot.com' },
      { name: 'Zendesk', url: 'zendesk.com' },
      { name: 'Slack', url: 'slack.com' },
      { name: 'Monday.com', url: 'monday.com' },
      { name: 'Asana', url: 'asana.com' }
    ],
    'E-commerce': [
      { name: 'Shopify', url: 'shopify.com' },
      { name: 'WooCommerce', url: 'woocommerce.com' },
      { name: 'BigCommerce', url: 'bigcommerce.com' },
      { name: 'Magento', url: 'magento.com' },
      { name: 'Squarespace', url: 'squarespace.com' },
      { name: 'Wix', url: 'wix.com' }
    ],
    'Cloud': [
      { name: 'AWS', url: 'aws.amazon.com' },
      { name: 'Google Cloud', url: 'cloud.google.com' },
      { name: 'Microsoft Azure', url: 'azure.microsoft.com' },
      { name: 'DigitalOcean', url: 'digitalocean.com' },
      { name: 'Linode', url: 'linode.com' },
      { name: 'Vultr', url: 'vultr.com' }
    ],
    'developer tools': [
      { name: 'GitHub', url: 'github.com' },
      { name: 'GitLab', url: 'gitlab.com' },
      { name: 'Bitbucket', url: 'bitbucket.org' },
      { name: 'Vercel', url: 'vercel.com' },
      { name: 'Netlify', url: 'netlify.com' },
      { name: 'Heroku', url: 'heroku.com' }
    ],
    'deployment': [
      { name: 'Vercel', url: 'vercel.com' },
      { name: 'Netlify', url: 'netlify.com' },
      { name: 'Heroku', url: 'heroku.com' },
      { name: 'Railway', url: 'railway.app' },
      { name: 'Render', url: 'render.com' },
      { name: 'Fly.io', url: 'fly.io' }
    ],
    'analytics': [
      { name: 'Google Analytics', url: 'analytics.google.com' },
      { name: 'Mixpanel', url: 'mixpanel.com' },
      { name: 'Amplitude', url: 'amplitude.com' },
      { name: 'Segment', url: 'segment.com' },
      { name: 'Heap', url: 'heap.io' },
      { name: 'Plausible', url: 'plausible.io' }
    ],
    'marketing': [
      { name: 'HubSpot', url: 'hubspot.com' },
      { name: 'Mailchimp', url: 'mailchimp.com' },
      { name: 'Klaviyo', url: 'klaviyo.com' },
      { name: 'ActiveCampaign', url: 'activecampaign.com' },
      { name: 'Marketo', url: 'marketo.com' },
      { name: 'Pardot', url: 'pardot.com' }
    ],
    'crm': [
      { name: 'Salesforce', url: 'salesforce.com' },
      { name: 'HubSpot', url: 'hubspot.com' },
      { name: 'Pipedrive', url: 'pipedrive.com' },
      { name: 'Zoho CRM', url: 'zoho.com/crm' },
      { name: 'Freshsales', url: 'freshworks.com/crm' },
      { name: 'Copper', url: 'copper.com' }
    ],
    'communication': [
      { name: 'Slack', url: 'slack.com' },
      { name: 'Microsoft Teams', url: 'microsoft.com/teams' },
      { name: 'Discord', url: 'discord.com' },
      { name: 'Zoom', url: 'zoom.us' },
      { name: 'Twilio', url: 'twilio.com' },
      { name: 'Sendbird', url: 'sendbird.com' }
    ],
    'database': [
      { name: 'MongoDB', url: 'mongodb.com' },
      { name: 'PostgreSQL', url: 'postgresql.org' },
      { name: 'MySQL', url: 'mysql.com' },
      { name: 'Redis', url: 'redis.io' },
      { name: 'Firebase', url: 'firebase.google.com' },
      { name: 'Supabase', url: 'supabase.com' }
    ],
    'security': [
      { name: 'Cloudflare', url: 'cloudflare.com' },
      { name: 'Auth0', url: 'auth0.com' },
      { name: 'Okta', url: 'okta.com' },
      { name: '1Password', url: '1password.com' },
      { name: 'LastPass', url: 'lastpass.com' },
      { name: 'Bitwarden', url: 'bitwarden.com' }
    ],
    'payment': [
      { name: 'Stripe', url: 'stripe.com' },
      { name: 'PayPal', url: 'paypal.com' },
      { name: 'Square', url: 'squareup.com' },
      { name: 'Adyen', url: 'adyen.com' },
      { name: 'Braintree', url: 'braintreepayments.com' },
      { name: 'Chargebee', url: 'chargebee.com' }
    ],
    'search': [
      { name: 'Google', url: 'google.com' },
      { name: 'Bing', url: 'bing.com' },
      { name: 'DuckDuckGo', url: 'duckduckgo.com' },
      { name: 'Algolia', url: 'algolia.com' },
      { name: 'Elasticsearch', url: 'elastic.co' },
      { name: 'Typesense', url: 'typesense.org' }
    ],
    'social media': [
      { name: 'Facebook', url: 'facebook.com' },
      { name: 'Twitter', url: 'twitter.com' },
      { name: 'Instagram', url: 'instagram.com' },
      { name: 'LinkedIn', url: 'linkedin.com' },
      { name: 'TikTok', url: 'tiktok.com' },
      { name: 'Snapchat', url: 'snapchat.com' }
    ],
    'video': [
      { name: 'YouTube', url: 'youtube.com' },
      { name: 'Vimeo', url: 'vimeo.com' },
      { name: 'Twitch', url: 'twitch.tv' },
      { name: 'Wistia', url: 'wistia.com' },
      { name: 'Loom', url: 'loom.com' },
      { name: 'Vidyard', url: 'vidyard.com' }
    ],
    'design': [
      { name: 'Figma', url: 'figma.com' },
      { name: 'Sketch', url: 'sketch.com' },
      { name: 'Adobe XD', url: 'adobe.com/products/xd' },
      { name: 'Canva', url: 'canva.com' },
      { name: 'InVision', url: 'invisionapp.com' },
      { name: 'Framer', url: 'framer.com' }
    ],
    'project management': [
      { name: 'Asana', url: 'asana.com' },
      { name: 'Monday.com', url: 'monday.com' },
      { name: 'ClickUp', url: 'clickup.com' },
      { name: 'Notion', url: 'notion.so' },
      { name: 'Trello', url: 'trello.com' },
      { name: 'Jira', url: 'atlassian.com/jira' }
    ],
    'outdoor gear': [
      { name: 'YETI', url: 'yeti.com' },
      { name: 'RTIC', url: 'rtic.com' },
      { name: 'Igloo', url: 'igloocoolers.com' },
      { name: 'Coleman', url: 'coleman.com' },
      { name: 'Hydro Flask', url: 'hydroflask.com' },
      { name: 'Stanley', url: 'stanley1913.com' }
    ],
    'apparel': [
      { name: 'Nike', url: 'nike.com' },
      { name: 'Adidas', url: 'adidas.com' },
      { name: 'Lululemon', url: 'lululemon.com' },
      { name: 'Under Armour', url: 'underarmour.com' },
      { name: 'Patagonia', url: 'patagonia.com' },
      { name: 'Uniqlo', url: 'uniqlo.com' }
    ],
    'direct-to-consumer': [
      { name: 'Warby Parker', url: 'warbyparker.com' },
      { name: 'Casper', url: 'casper.com' },
      { name: 'Dollar Shave Club', url: 'dollarshaveclub.com' },
      { name: 'Away', url: 'awaytravel.com' },
      { name: 'Glossier', url: 'glossier.com' },
      { name: 'Allbirds', url: 'allbirds.com' }
    ],
    'productivity': [
      { name: 'Notion', url: 'notion.so' },
      { name: 'Evernote', url: 'evernote.com' },
      { name: 'Roam Research', url: 'roamresearch.com' },
      { name: 'Obsidian', url: 'obsidian.md' },
      { name: 'Bear', url: 'bear.app' },
      { name: 'Todoist', url: 'todoist.com' }
    ],
    'finance': [
      { name: 'QuickBooks', url: 'quickbooks.intuit.com' },
      { name: 'Xero', url: 'xero.com' },
      { name: 'FreshBooks', url: 'freshbooks.com' },
      { name: 'Wave', url: 'waveapps.com' },
      { name: 'Bench', url: 'bench.co' },
      { name: 'Sage', url: 'sage.com' }
    ],
    'hr': [
      { name: 'Gusto', url: 'gusto.com' },
      { name: 'BambooHR', url: 'bamboohr.com' },
      { name: 'Workday', url: 'workday.com' },
      { name: 'ADP', url: 'adp.com' },
      { name: 'Rippling', url: 'rippling.com' },
      { name: 'Justworks', url: 'justworks.com' }
    ],
    'support': [
      { name: 'Zendesk', url: 'zendesk.com' },
      { name: 'Intercom', url: 'intercom.com' },
      { name: 'Freshdesk', url: 'freshworks.com/freshdesk' },
      { name: 'Help Scout', url: 'helpscout.com' },
      { name: 'Crisp', url: 'crisp.chat' },
      { name: 'Tidio', url: 'tidio.com' }
    ],
    'automation': [
      { name: 'Zapier', url: 'zapier.com' },
      { name: 'Make', url: 'make.com' },
      { name: 'n8n', url: 'n8n.io' },
      { name: 'Workato', url: 'workato.com' },
      { name: 'Tray.io', url: 'tray.io' },
      { name: 'Automate.io', url: 'automate.io' }
    ],
    'e-signature': [
      { name: 'DocuSign', url: 'docusign.com' },
      { name: 'Adobe Sign', url: 'adobe.com/sign' },
      { name: 'HelloSign', url: 'hellosign.com' },
      { name: 'PandaDoc', url: 'pandadoc.com' },
      { name: 'SignNow', url: 'signnow.com' },
      { name: 'SignRequest', url: 'signrequest.com' }
    ],
    'collaboration': [
      { name: 'Notion', url: 'notion.so' },
      { name: 'Coda', url: 'coda.io' },
      { name: 'Confluence', url: 'atlassian.com/confluence' },
      { name: 'Miro', url: 'miro.com' },
      { name: 'Mural', url: 'mural.co' },
      { name: 'Lucidchart', url: 'lucidchart.com' }
    ],
    'monitoring': [
      { name: 'Datadog', url: 'datadoghq.com' },
      { name: 'New Relic', url: 'newrelic.com' },
      { name: 'Sentry', url: 'sentry.io' },
      { name: 'LogRocket', url: 'logrocket.com' },
      { name: 'Honeycomb', url: 'honeycomb.io' },
      { name: 'PagerDuty', url: 'pagerduty.com' }
    ]
  };

  const lowerIndustry = industry.toLowerCase();

  // Check for partial matches
  for (const [key, competitors] of Object.entries(industryDefaults)) {
    if (lowerIndustry.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerIndustry)) {
      return competitors;
    }
  }

  // Generic fallback - return empty array instead of placeholder names
  // This allows the AI competitor identification to kick in
  return [];
}