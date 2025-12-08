import React, { useState, useEffect } from "react";
import { MessageSquare, Globe, X, Send } from "lucide-react";

interface SimulatedExtensionProps {
  isOpen: boolean;
  site: string;
  onNavigate: (url: string) => void;
}

export default function SimulatedExtension({ isOpen, site, onNavigate }: SimulatedExtensionProps) {
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [tab, setTab] = useState<"current" | "global">("current");
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Mock Data for the demo
  const topSites = [
    { site: "xchatter.me", count: 1542 },
    { site: "google.com", count: 1243 },
    { site: "youtube.com", count: 856 },
    { site: "x.com", count: 542 },
    { site: "github.com", count: 321 },
  ];

  // Restore session from localStorage (Simulating chrome.storage.local)
  useEffect(() => {
    const storedUser = localStorage.getItem('xchatter_username');
    if (storedUser) {
        setToken("mock-token-stored");
        setCurrentUser(storedUser);
    }
  }, []);

  // Simulate receiving a message when opened
  useEffect(() => {
    if (isOpen && tab === "current" && messages.length === 0 && token) {
      const timer = setTimeout(() => {
        setMessages(p => [...p, `User_88: Anyone else seeing this on ${site}?`]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen, tab, site, token, messages.length]);

  const login = () => {
    // Simulate login flow
    setTimeout(() => {
        const mockUser = "DevBuilder";
        setToken("mock-token-123");
        setCurrentUser(mockUser);
        localStorage.setItem('xchatter_username', mockUser); // Store in local storage
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    // Use stored username for sent messages
    const sender = currentUser || "Me";
    setMessages(prev => [...prev, `${sender}: ${inputValue}`]);
    setInputValue("");
  };

  return (
    <div className={`
      absolute top-0 right-0 h-full w-[350px] z-50
      bg-black/95 backdrop-blur-md text-white border-l border-gray-800 
      flex flex-col font-sans shadow-2xl 
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b border-gray-900 text-sm">
        <div className="flex gap-4">
          <button 
            onClick={() => setTab("current")} 
            className={`${tab === "current" ? "text-green-500 border-b-2 border-green-500" : "text-gray-500"} pb-1 font-bold transition-colors`}>
            Current
          </button>
          <button 
            onClick={() => setTab("global")} 
            className={`${tab === "global" ? "text-green-500 border-b-2 border-green-500" : "text-gray-500"} pb-1 font-bold transition-colors`}>
            Global
          </button>
        </div>
      </div>

      {/* LOGIN SCREEN */}
      {!token ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <MessageSquare className="text-green-500 w-12 h-12 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold mb-2">XchatterME</h2>
          <p className="text-gray-400 text-sm mb-6">Chat with people on the same website as you, right now.</p>
          <button onClick={login} className="bg-white text-black font-bold py-3 px-8 rounded-full flex items-center gap-2 hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" /> Sign in with X
          </button>
          <p className="text-xs text-gray-600 mt-4">(Simulated Login for Demo)</p>
        </div>
      ) : (
        /* MAIN CONTENT */
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* TAB: CURRENT ROOM */}
          {tab === "current" && (
            <div className="flex-1 flex flex-col h-full">
               <div className="p-3 bg-gray-900/50 border-b border-gray-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-500 uppercase block">Connected to</span>
                    <div className="text-green-400 font-bold truncate text-sm">{site}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    14 Online
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && <div className="text-center mt-10 text-gray-600 text-sm">No messages yet... be the first!</div>}
                  {messages.map((msg, i) => {
                    const [user, text] = msg.includes(':') ? msg.split(': ') : ['System', msg];
                    const isSystem = user === 'System';
                    
                    if (isSystem) return <div key={i} className="text-xs text-gray-500 text-center py-2">{msg}</div>;

                    const isMe = user === 'Me' || (currentUser && user === currentUser);

                    return (
                      <div key={i} className="animate-[slideIn_0.3s_ease-out] p-3 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-4 h-4 rounded-full ${isMe ? 'bg-green-500' : 'bg-indigo-500'} flex items-center justify-center text-[8px] font-bold`}>
                            {user.charAt(0)}
                          </div>
                          {isMe ? (
                            <button 
                              onClick={() => onNavigate(`https://x.com/${currentUser || 'Me'}`)}
                              className="text-xs text-gray-300 hover:text-white font-medium hover:underline transition-colors focus:outline-none"
                            >
                              {currentUser || 'Me'}
                            </button>
                          ) : (
                            <button 
                              onClick={() => onNavigate(`https://x.com/${user}`)}
                              className="text-xs text-gray-400 hover:text-white font-medium hover:underline transition-colors focus:outline-none"
                            >
                              {user}
                            </button>
                          )}
                          <span className="text-[10px] text-gray-600 ml-auto">Just now</span>
                        </div>
                        <p className="text-sm text-gray-200">{text}</p>
                      </div>
                    );
                  })}
               </div>

               <div className="p-4 border-t border-gray-800 bg-gray-900/30">
                  <div className="relative">
                    <input 
                        className="w-full bg-black border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm focus:border-green-500 focus:outline-none transition-colors text-white" 
                        placeholder="Type a message..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter') handleSendMessage();
                        }}
                    />
                    <Send 
                      className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 cursor-pointer hover:text-green-400 transition-colors" 
                      onClick={handleSendMessage}
                    />
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
                  onClick={() => onNavigate(`https://${room.site}`)}
                  className="flex justify-between items-center p-3 bg-gray-900 rounded hover:bg-gray-800 cursor-pointer border border-gray-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-mono text-xs">#{i+1}</span>
                    <span className="font-bold text-sm truncate w-40 text-gray-300 group-hover:text-white">{room.site}</span>
                  </div>
                  <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full border border-green-900/50">
                    {room.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}