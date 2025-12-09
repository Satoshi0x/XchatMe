import { Section } from '../types';

export const guideData: Section[] = [
  {
    id: "prerequisites",
    title: "Prerequisites",
    description: "The complete setup checklist for the serverless Cloudflare + DynamoDB architecture.",
    steps: [
      {
        title: "1. Cloud & Database",
        actionItems: [
          "AWS Account (for DynamoDB NoSQL Database).",
          "Cloudflare Account (for Edge Workers).",
          "Node.js & NPM installed locally."
        ]
      },
      {
        title: "2. X (Twitter) Developer Portal",
        actionItems: [
          "Create a Project & App in the X Developer Portal.",
          "Enable OAuth 2.0 (User Authentication Settings).",
          "App Type: Confidential Client.",
          "Callback URI: https://api.xchatter.me/auth/callback",
          "Website URL: https://xchatter.me",
          "Save Client ID & Client Secret."
        ]
      }
    ]
  },
  {
    id: "phase-1",
    title: "Phase 1: The Database",
    description: "We use AWS DynamoDB for ultra-fast, serverless message storage.",
    steps: [
      {
        title: "Create Table in DynamoDB",
        description: "Go to AWS Console -> DynamoDB -> Create Table",
        actionItems: [
            "Table Name: XChatMessages",
            "Partition Key: room (String)",
            "Sort Key: created_at (Number)",
            "Settings: On-Demand Capacity (Free Tier friendly)",
            "Create an IAM User with 'AmazonDynamoDBFullAccess' and save the Access Key ID & Secret."
        ]
      }
    ]
  },
  {
    id: "phase-2",
    title: "Phase 2: The Backend",
    description: "Deploy a Cloudflare Worker to handle API requests and talk to DynamoDB.",
    steps: [
      {
        title: "1. Create Worker Project",
        code: {
          language: "bash",
          code: `npm create cloudflare@latest xchatter-backend
# Select "Hello World" Worker
cd xchatter-backend
npm install aws4fetch`
        }
      },
      {
        title: "2. src/index.js",
        description: "The Edge Worker code handling Auth and Database calls.",
        code: {
          language: "javascript",
          filename: "src/index.js",
          code: `import { AwsClient } from 'aws4fetch';

export default {
  async fetch(request, env) {
    const aws = new AwsClient({
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: 'us-east-1',
      service: 'dynamodb'
    });

    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // 1. GET Messages (Polling)
    if (url.pathname === '/messages' && request.method === 'GET') {
      const room = url.searchParams.get('room');
      
      const body = JSON.stringify({
        TableName: "XChatMessages",
        KeyConditionExpression: "room = :r",
        ExpressionAttributeValues: { ":r": { "S": room } },
        ScanIndexForward: false,
        Limit: 50
      });

      const dbRes = await aws.fetch(\`https://dynamodb.us-east-1.amazonaws.com\`, {
        method: 'POST',
        headers: { 'X-Amz-Target': 'DynamoDB_20120810.Query', 'Content-Type': 'application/x-amz-json-1.0' },
        body
      });
      
      const data = await dbRes.json();
      const messages = data.Items ? data.Items.map(item => ({
        username: item.username.S,
        text: item.text.S,
        created_at: item.created_at.N
      })).reverse() : [];

      return new Response(JSON.stringify(messages), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. POST Message
    if (url.pathname === '/messages' && request.method === 'POST') {
      const { room, text, username } = await request.json();
      
      const body = JSON.stringify({
        TableName: "XChatMessages",
        Item: {
          "room": { "S": room },
          "created_at": { "N": Date.now().toString() },
          "username": { "S": username },
          "text": { "S": text }
        }
      });

      await aws.fetch(\`https://dynamodb.us-east-1.amazonaws.com\`, {
        method: 'POST',
        headers: { 'X-Amz-Target': 'DynamoDB_20120810.PutItem', 'Content-Type': 'application/x-amz-json-1.0' },
        body
      });

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // 3. Auth Endpoints
    if (url.pathname === '/auth/login') {
      const xUrl = \`https://twitter.com/i/oauth2/authorize?response_type=code&client_id=\${env.X_CLIENT_ID}&redirect_uri=\${env.REDIRECT_URI}&scope=tweet.read%20users.read&state=state&code_challenge=challenge&code_challenge_method=plain\`;
      return Response.redirect(xUrl, 302);
    }

    if (url.pathname === '/auth/callback') {
      const { code } = Object.fromEntries(url.searchParams);
      const tokenParams = new URLSearchParams({
        code, grant_type: "authorization_code", client_id: env.X_CLIENT_ID, redirect_uri: env.REDIRECT_URI, code_verifier: "challenge"
      });

      const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + btoa(env.X_CLIENT_ID + ":" + env.X_CLIENT_SECRET)
        },
        body: tokenParams
      });
      const tokens = await tokenRes.json();
      
      return new Response(\`<html><body><script>
        chrome.runtime.sendMessage("\${env.EXTENSION_ID}", { type: "AUTH_SUCCESS", token: "\${tokens.access_token}" });
        window.close();
      </script></body></html>\`, { headers: { "Content-Type": "text/html" }});
    }

    return new Response("Not Found", { status: 404 });
  }
}`
        }
      },
      {
        title: "3. Deploy & Domain",
        actionItems: [
          "Add secrets via Wrangler: `npx wrangler secret put AWS_ACCESS_KEY_ID` (and others).",
          "Deploy: `npx wrangler deploy`.",
          "Cloudflare Dashboard -> Workers -> Triggers -> Custom Domains.",
          "Add 'api.xchatter.me' (this handles SSL automatically)."
        ]
      }
    ]
  },
  {
    id: "phase-3",
    title: "Phase 3: The Frontend",
    description: "Chrome Extension (Vite + React) using polling to fetch messages from Cloudflare.",
    steps: [
      {
        title: "1. Create Project",
        code: {
          language: "bash",
          code: `npm create vite@latest xchatter-frontend -- --template react-ts
cd xchatter-frontend
npm install lucide-react tailwindcss postcss autoprefixer`
        }
      },
      {
        title: "2. public/manifest.json",
        code: {
          language: "json",
          filename: "public/manifest.json",
          code: `{
  "manifest_version": 3,
  "name": "XchatterME",
  "version": "1.0",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["https://api.xchatter.me/*"], 
  "background": { "service_worker": "background.js" },
  "action": {}, 
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content.tsx"],
      "run_at": "document_idle"
    }
  ]
}`
        }
      },
      {
        title: "3. Connect to Backend (src/App.tsx)",
        description: "Point the extension to your custom Cloudflare domain.",
        code: {
          language: "typescript",
          filename: "src/App.tsx (Snippet)",
          code: `// YOUR WORKER URL (Custom Domain)
const API_URL = "https://api.xchatter.me";

// Login
function login() {
  window.open(\`\${API_URL}/auth/login\`, "XAuth", "width=500,height=600");
}

// Fetch Messages (Polling)
useEffect(() => {
  const interval = setInterval(() => {
    fetch(\`\${API_URL}/messages?room=\${encodeURIComponent(currentSite)}\`)
      .then(res => res.json())
      .then(data => setMessages(data));
  }, 2000); // Poll every 2 seconds
  return () => clearInterval(interval);
}, [currentSite]);

// Send Message
const sendMessage = async () => {
   await fetch(\`\${API_URL}/messages\`, {
      method: 'POST',
      body: JSON.stringify({ 
         room: currentSite, 
         text: inputValue, 
         username: storedUsername 
      })
   });
   setInputValue("");
};

// Handle Auth Success
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "AUTH_SUCCESS") {
     fetch("https://api.twitter.com/2/users/me", { headers: { Authorization: \`Bearer \${msg.token}\` } })
     .then(r => r.json())
     .then(data => {
        const username = data.data.username;
        chrome.storage.local.set({ username: username });
     });
  }
});`
        }
      }
    ]
  }
];