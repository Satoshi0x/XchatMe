import { Section } from '../types';

export const guideData: Section[] = [
  {
    id: "prerequisites",
    title: "Prerequisites",
    description: "Before you begin, ensure you have the following ready.",
    steps: [
      {
        title: "1. Domain & DNS",
        actionItems: [
          "Buy One Domain (e.g., xchat.me).",
          "Go to Cloudflare Dashboard -> DNS Records.",
          "Add A Record (@) pointing to 76.76.21.21 (Vercel/Netlify for Landing Page).",
          "Add CNAME Record (api) pointing to xchat-me-backend.yourname.workers.dev (Proxy Status: Orange Cloud ON)."
        ]
      },
      {
        title: "2. X (Twitter) Developer Keys",
        actionItems: [
          "Create App in X Developer Portal.",
          "Set Callback URI to: https://api.xchat.me/auth/callback",
          "Set Website URL to: https://xchat.me",
          "Copy Client ID & Client Secret."
        ]
      }
    ]
  },
  {
    id: "phase-1",
    title: "Phase 1: The Database",
    description: "Where we store chat logs. We use the DynamoDB API because it runs natively on the Edge.",
    steps: [
      {
        title: "Create DynamoDB Table",
        description: "Go to AWS Console -> DynamoDB -> Create Table",
        actionItems: [
          "Table Name: XchatMe_Messages",
          "Partition Key: roomUrl (String)",
          "Sort Key: createdAt (Number)"
        ],
        note: "You don't need code for this step, just the AWS Access Keys which we will add to the backend secrets later."
      }
    ]
  },
  {
    id: "phase-2",
    title: "Phase 2: The Backend",
    description: "Handles QUIC WebSockets, Global Stats, and OAuth using Cloudflare Workers.",
    steps: [
      {
        title: "1. Create Project",
        code: {
          language: "bash",
          code: `npm create cloudflare@latest xchat-me-backend
# Select: "Hello World" -> "TypeScript" -> "No Git"
cd xchat-me-backend`
        }
      },
      {
        title: "2. wrangler.toml (Configuration)",
        description: "Location: Root folder of xchat-me-backend",
        code: {
          language: "toml",
          filename: "wrangler.toml",
          code: `name = "xchat-me-backend"
main = "src/index.ts"
compatibility_date = "2025-01-01"

# Route "api.xchat.me" to this worker
routes = [
	{ pattern = "api.xchat.me", custom_domain = true }
]

# 1. ChatRoom: Handles specific URL chats (e.g., google.com)
[[durable_objects.bindings]]
name = "CHAT_ROOM"
class_name = "ChatRoom"

# 2. Registry: Handles the "Top 10" Global list
[[durable_objects.bindings]]
name = "REGISTRY"
class_name = "Registry"

[vars]
ALLOWED_ORIGIN = "https://xchat.me"
REDIRECT_URI = "https://api.xchat.me/auth/callback"
# Placeholders (We will set these via command line for security)
# X_CLIENT_ID, X_CLIENT_SECRET`
        }
      },
      {
        title: "3. src/Registry.ts (Global Stats)",
        description: "Location: Create new file inside src/",
        code: {
          language: "typescript",
          filename: "src/Registry.ts",
          code: `import { DurableObject } from "cloudflare:workers";

export class Registry extends DurableObject {
  roomCounts: Map<string, number>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.roomCounts = new Map();
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    // INTERNAL: ChatRooms report their user count here
    if (url.pathname === "/report") {
      const { site, count } = await request.json();
      if (count <= 0) this.roomCounts.delete(site);
      else this.roomCounts.set(site, count);
      return new Response("OK");
    }

    // PUBLIC: Get Top 10 List
    if (url.pathname === "/top") {
      const sorted = Array.from(this.roomCounts.entries())
        .sort((a, b) => b[1] - a[1]) // Sort Highest to Lowest
        .slice(0, 10) // Take top 10
        .map(([site, count]) => ({ site, count }));
      
      return new Response(JSON.stringify(sorted));
    }
    return new Response("Registry Ready");
  }
}`
        }
      },
      {
        title: "4. src/ChatRoom.ts (Chat Engine)",
        description: "Location: Create new file inside src/",
        code: {
          language: "typescript",
          filename: "src/ChatRoom.ts",
          code: `import { DurableObject } from "cloudflare:workers";

export class ChatRoom extends DurableObject {
  sessions: Set<WebSocket>;
  siteUrl: string;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sessions = new Set();
    this.siteUrl = "";
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    this.siteUrl = url.searchParams.get("site") || "unknown";

    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      
      server.accept();
      this.sessions.add(server);
      this.updateRegistry(); // User Joined

      server.addEventListener("message", (event) => {
        // Broadcast message to everyone in room
        this.broadcast(JSON.parse(event.data as string));
        // TODO: Insert "saveToDynamoDB(data)" here
      });

      server.addEventListener("close", () => {
        this.sessions.delete(server);
        this.updateRegistry(); // User Left
      });

      return new Response(null, { status: 101, webSocket: client });
    }
    return new Response("Expected WebSocket", { status: 426 });
  }

  broadcast(data: any) {
    const msg = JSON.stringify(data);
    for (const session of this.sessions) session.send(msg);
  }

  // Fire-and-forget stat update
  updateRegistry() {
    const id = this.env.REGISTRY.idFromName("global_registry");
    const stub = this.env.REGISTRY.get(id);
    stub.fetch("http://internal/report", {
      method: "POST",
      body: JSON.stringify({ site: this.siteUrl, count: this.sessions.size })
    });
  }
}`
        }
      },
      {
        title: "5. src/index.ts (Router & OAuth)",
        description: "Location: Overwrite existing src/index.ts",
        code: {
          language: "typescript",
          filename: "src/index.ts",
          code: `import { ChatRoom } from "./ChatRoom";
import { Registry } from "./Registry";
export { ChatRoom, Registry };

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // 1. WebSocket Chat Route
    if (url.pathname === "/ws") {
      const site = url.searchParams.get("site");
      const id = env.CHAT_ROOM.idFromName(site);
      return env.CHAT_ROOM.get(id).fetch(request);
    }

    // 2. Global Top 10 Route
    if (url.pathname === "/stats/top") {
      const id = env.REGISTRY.idFromName("global_registry");
      return env.REGISTRY.get(id).fetch("http://internal/top");
    }

    // 3. OAuth Login Route
    if (url.pathname === "/auth/login") {
      const xUrl = \`https://twitter.com/i/oauth2/authorize?response_type=code&client_id=\${env.X_CLIENT_ID}&redirect_uri=\${env.REDIRECT_URI}&scope=tweet.read%20users.read&state=state&code_challenge=challenge&code_challenge_method=plain\`;
      return Response.redirect(xUrl, 302);
    }

    // 4. OAuth Callback Route
    if (url.pathname === "/auth/callback") {
      const code = url.searchParams.get("code");
      const tokenResp = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + btoa(\`\${env.X_CLIENT_ID}:\${env.X_CLIENT_SECRET}\`)
        },
        body: new URLSearchParams({
          code: code || "",
          grant_type: "authorization_code",
          client_id: env.X_CLIENT_ID,
          redirect_uri: env.REDIRECT_URI,
          code_verifier: "challenge"
        })
      });

      const data = await tokenResp.json();
      
      // Return HTML that passes token to extension
      return new Response(\`
        <html><body><script>
          chrome.runtime.sendMessage("\${env.EXTENSION_ID}", { 
            type: "AUTH_SUCCESS", 
            token: "\${data.access_token}" 
          });
          window.close();
        </script></body></html>
      \`, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("Not Found", { status: 404 });
  }
};`
        }
      },
      {
        title: "6. Deploy Backend",
        code: {
          language: "bash",
          code: `# Set your secrets
npx wrangler secret put X_CLIENT_ID
npx wrangler secret put X_CLIENT_SECRET
# Get the Extension ID AFTER building frontend (Phase 3) and put it here:
npx wrangler secret put EXTENSION_ID 

# Deploy
npx wrangler deploy`
        }
      }
    ]
  },
  {
    id: "phase-3",
    title: "Phase 3: The Frontend",
    description: "Chrome Extension handling Slide-out UI, Shadow DOM, and Logic.",
    steps: [
      {
        title: "1. Create Project",
        code: {
          language: "bash",
          code: `npm create vite@latest xchat-me-frontend -- --template react-ts
cd xchat-me-frontend
npm install lucide-react`
        }
      },
      {
        title: "2. public/manifest.json",
        description: "Location: public/ folder",
        code: {
          language: "json",
          filename: "public/manifest.json",
          code: `{
  "manifest_version": 3,
  "name": "Xchat Me Slide",
  "version": "1.0",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["https://api.xchat.me/*"],
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
        title: "3. public/background.js",
        description: "Location: public/ folder",
        code: {
          language: "javascript",
          filename: "public/background.js",
          code: `// 1. Listen for Icon Click -> Toggle Sidebar
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SIDEBAR" });
  }
});

// 2. Listen for Auth Success from Backend
chrome.runtime.onMessageExternal.addListener((msg) => {
  if (msg.type === "AUTH_SUCCESS") {
    chrome.storage.local.set({ x_auth_token: msg.token });
  }
});`
        }
      },
      {
        title: "4. src/content.tsx (Shadow DOM Host)",
        description: "Location: Overwrite src/main.tsx or create src/content.tsx",
        code: {
          language: "tsx",
          filename: "src/content.tsx",
          code: `import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Create Host Element
const host = document.createElement('div');
host.id = 'xchat-me-host';
host.style.position = 'fixed';
host.style.zIndex = '2147483647'; // Max Z-Index
host.style.top = '0';
host.style.right = '0';
host.style.height = '100vh';
host.style.pointerEvents = 'none'; // Allow clicks to pass through when closed
document.body.appendChild(host);

// Create Shadow DOM
const shadow = host.attachShadow({ mode: 'open' });

// Inject Tailwind (CDN for simplicity in shadow DOM)
const style = document.createElement('style');
style.textContent = \`@import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');\`;
shadow.appendChild(style);

// Root Component wrapper to handle visibility
function Root() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "TOGGLE_SIDEBAR") setIsOpen(prev => !prev);
    });
  }, []);

  // Update pointer-events based on open state to block/allow clicks
  useEffect(() => {
    host.style.pointerEvents = isOpen ? 'auto' : 'none';
  }, [isOpen]);

  // Pass current hostname to App
  return <App isOpen={isOpen} site={window.location.hostname} />;
}

ReactDOM.createRoot(shadow).render(<Root />);`
        }
      },
      {
        title: "5. src/App.tsx (Main UI)",
        description: "Location: Overwrite src/App.tsx",
        code: {
          language: "tsx",
          filename: "src/App.tsx",
          code: `import React, { useState, useEffect } from "react";
import { MessageSquare, Globe, X, Send } from "lucide-react";

export default function App({ isOpen, site }: { isOpen: boolean, site: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<"current" | "global">("current");
  const [topSites, setTopSites] = useState<{site: string, count: number}[]>([]);
  // Mock messages for animation demo
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Check for login token
    chrome.storage.local.get("x_auth_token", (r) => {
      if (r.x_auth_token) setToken(r.x_auth_token);
    });
  }, [isOpen]);

  useEffect(() => {
    // Fetch Top 10 when switching to Global tab
    if (tab === "global") {
      fetch("https://api.xchat.me/stats/top")
        .then(res => res.json())
        .then(data => setTopSites(data));
    }
  }, [tab]);

  // Simulate messages for demo
  useEffect(() => {
    if (isOpen && tab === "current" && messages.length === 0) {
      setTimeout(() => setMessages(p => [...p, "Welcome to " + site]), 500);
    }
  }, [isOpen, tab, site]);

  const login = () => {
    window.open("https://api.xchat.me/auth/login", "XAuth", "width=500,height=600");
  };

  return (
    <>
      <style>{\`
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .msg-anim { animation: slideIn 0.3s ease-out forwards; }
      \`}</style>

      {/* Main Container with Slide Animation */}
      <div className={\`
        fixed top-0 right-0 h-screen w-[350px] 
        bg-black/95 backdrop-blur-md text-white border-l border-gray-800 
        flex flex-col font-sans shadow-2xl 
        transform transition-transform duration-300 ease-in-out
        \${isOpen ? 'translate-x-0' : 'translate-x-full'}
      \`}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-900 text-sm">
          <div className="flex gap-4">
            <button 
              onClick={() => setTab("current")} 
              className={\`\${tab === "current" ? "text-green-500 border-b-2 border-green-500" : "text-gray-500"} pb-1 font-bold transition-colors\`}>
              Current
            </button>
            <button 
              onClick={() => setTab("global")} 
              className={\`\${tab === "global" ? "text-green-500 border-b-2 border-green-500" : "text-gray-500"} pb-1 font-bold transition-colors\`}>
              Global
            </button>
          </div>
        </div>

        {/* LOGIN SCREEN */}
        {!token ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <MessageSquare className="text-green-500 w-12 h-12 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold mb-2">Xchat Me</h2>
            <button onClick={login} className="bg-white text-black font-bold py-3 px-8 rounded-full flex items-center gap-2 mt-4 hover:bg-gray-200 transition-colors">
              <X className="w-5 h-5" /> Sign in with X
            </button>
          </div>
        ) : (
          /* MAIN CONTENT */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* TAB: CURRENT ROOM */}
            {tab === "current" && (
              <div className="flex-1 flex flex-col">
                 <div className="p-3 bg-gray-900/50 border-b border-gray-800">
                    <span className="text-xs text-gray-500 uppercase">Connected to:</span>
                    <div className="text-green-400 font-bold truncate">{site}</div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && <div className="text-center mt-20 text-gray-600">No messages yet...</div>}
                    {messages.map((msg, i) => (
                      <div key={i} className="msg-anim p-3 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
                        <p className="text-sm text-gray-200">{msg}</p>
                      </div>
                    ))}
                 </div>

                 <div className="p-4 border-t border-gray-800 bg-gray-900/30">
                    <div className="relative">
                      <input className="w-full bg-black border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm focus:border-green-500 focus:outline-none transition-colors" placeholder="Type a message..." />
                      <Send className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 cursor-pointer hover:text-green-400 transition-colors" />
                    </div>
                 </div>
              </div>
            )}

            {/* TAB: GLOBAL TOP 10 */}
            {tab === "global" && (
              <div className="p-4 space-y-2 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Trending Now
                </h3>
                {topSites.map((room, i) => (
                  <div 
                    key={room.site}
                    onClick={() => window.open(\`https://\${room.site}\`, '_blank')}
                    className="flex justify-between items-center p-3 bg-gray-900 rounded hover:bg-gray-800 cursor-pointer border border-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-mono text-xs">#{i+1}</span>
                      <span className="font-bold text-sm truncate w-40">{room.site}</span>
                    </div>
                    <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded-full">
                      {room.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
`
        }
      },
      {
        title: "6. Build & Install",
        actionItems: [
          "Run npm run build in xchat-me-frontend.",
          "Open Chrome -> chrome://extensions -> Load Unpacked -> Select dist folder.",
          "Copy the ID (e.g., jamhfw...) and run npx wrangler secret put EXTENSION_ID in your backend folder.",
          "Redeploy backend: npx wrangler deploy."
        ]
      }
    ]
  }
];