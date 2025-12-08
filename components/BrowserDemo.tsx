import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Lock, MessageSquare, Puzzle, Search, Mic, Camera, MapPin, Calendar, Link as LinkIcon, X } from 'lucide-react';
import SimulatedExtension from './SimulatedExtension';
import Section from './Section';
import { guideData } from '../data/guideContent';

interface BrowserDemoProps {
  onExit: () => void;
}

const BrowserDemo: React.FC<BrowserDemoProps> = ({ onExit }) => {
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);
  const [url, setUrl] = useState('https://google.com');

  const handleNavigate = (newUrl: string) => {
    setUrl(newUrl);
  };

  const getDomain = (fullUrl: string) => {
    try {
      return new URL(fullUrl).hostname;
    } catch {
      return fullUrl;
    }
  };

  const GuidePage = () => (
    <div className="w-full h-full bg-[#050505] overflow-y-auto text-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-12">
          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono mb-6 border border-indigo-500/20">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              2025 Architecture Edition
            </div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tight mb-6">
              Xchat Me <br/> Master Guide
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
              The complete "Copy-Paste" blueprint for building a distributed chat architecture.
            </p>
          </header>
          <hr className="border-gray-800 mb-12" />
          {guideData.map((section) => (
            <Section key={section.id} data={section} />
          ))}
          <footer className="mt-20 pt-12 border-t border-gray-800 text-center text-gray-500 text-sm pb-12">
            <p>© 2025 Xchat Me Architecture.</p>
          </footer>
      </div>
    </div>
  );

  const GooglePage = () => (
    <div className="flex flex-col items-center w-full max-w-2xl px-4 pt-[10vh]">
      <h1 className="text-[5rem] font-bold text-gray-800 tracking-tight mb-8" style={{fontFamily: 'sans-serif'}}>
        <span className="text-blue-500">G</span>
        <span className="text-red-500">o</span>
        <span className="text-yellow-500">o</span>
        <span className="text-blue-500">g</span>
        <span className="text-green-500">l</span>
        <span className="text-red-500">e</span>
      </h1>
      
      <div className="w-full max-w-lg relative mb-8">
        <Search className="absolute left-4 top-3 text-gray-400" size={20} />
        <input 
          className="w-full border border-gray-200 rounded-full py-3 pl-12 pr-12 shadow-sm hover:shadow-md transition-shadow outline-none text-gray-700" 
          defaultValue="Xchat Me Architecture Guide"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleNavigate('https://xchat.me');
          }}
        />
        <div className="absolute right-4 top-2.5 flex gap-3 text-gray-500">
          <Mic size={20} className="cursor-pointer hover:text-blue-500" />
          <Camera size={20} className="cursor-pointer hover:text-blue-500" />
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => handleNavigate('https://xchat.me')}
          className="bg-[#f8f9fa] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow-sm px-4 py-2 text-sm text-[#3c4043] rounded font-medium"
        >
          Google Search
        </button>
        <button className="bg-[#f8f9fa] border border-[#f8f9fa] hover:border-[#dadce0] hover:shadow-sm px-4 py-2 text-sm text-[#3c4043] rounded font-medium">
          I'm Feeling Lucky
        </button>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Google offered in: <span className="text-blue-700 cursor-pointer hover:underline">Français</span> <span className="text-blue-700 cursor-pointer hover:underline">Español</span> <span className="text-blue-700 cursor-pointer hover:underline">Deutsch</span>
      </div>
    </div>
  );

  const XProfilePage = () => {
    const username = url.split('x.com/')[1] || 'User';
    return (
      <div className="w-full h-full bg-black text-white overflow-y-auto">
        {/* Navbar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-4 py-2 border-b border-gray-800 flex items-center gap-6">
          <div className="hover:bg-gray-800 p-2 rounded-full cursor-pointer transition-colors" onClick={() => handleNavigate('https://google.com')}>
            <ArrowLeft size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-5">{username}</h2>
            <p className="text-xs text-gray-500">1,243 posts</p>
          </div>
        </div>

        {/* Hero Image */}
        <div className="h-48 bg-gray-800 w-full relative group">
            {/* Cover Image Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700"></div>
        </div>

        {/* Profile Details */}
        <div className="px-4 relative mb-4">
            <div className="flex justify-between items-start">
                <div className="-mt-16 relative">
                    <div className="w-32 h-32 rounded-full bg-black p-1">
                        <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-5xl font-bold border-4 border-black">
                            {username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
                <button className="mt-4 px-5 py-2 rounded-full border border-gray-500 font-bold hover:bg-gray-900 transition-colors text-sm">
                    Edit profile
                </button>
            </div>
            
            <div className="mt-4">
                <h1 className="font-bold text-xl leading-5">{username}</h1>
                <p className="text-gray-500 text-sm">@{username}</p>
            </div>

            <p className="mt-4 text-sm leading-5">
                Building cool things with Cloudflare Workers & React. 🚀 <br/>
                Contributor to Xchat Me Architecture.
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>Internet</span>
                </div>
                <div className="flex items-center gap-1">
                    <LinkIcon size={16} />
                    <span className="text-blue-400">github.com/{username}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Joined January 2025</span>
                </div>
            </div>

            <div className="flex gap-4 mt-4 text-sm">
                <span className="hover:underline cursor-pointer"><strong className="text-white">143</strong> <span className="text-gray-500">Following</span></span>
                <span className="hover:underline cursor-pointer"><strong className="text-white">8,492</strong> <span className="text-gray-500">Followers</span></span>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mt-4">
            {['Posts', 'Replies', 'Highlights', 'Media', 'Likes'].map((tab, i) => (
                <div key={tab} className={`flex-1 text-center py-4 text-sm font-medium hover:bg-white/5 cursor-pointer relative ${i === 0 ? 'text-white' : 'text-gray-500'}`}>
                    {tab}
                    {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 w-12 mx-auto rounded-full"></div>}
                </div>
            ))}
        </div>

        {/* Pinned Tweet */}
        <div className="p-4 border-b border-gray-800 hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex gap-1 text-xs text-gray-500 font-medium mb-1 ml-10">
                <Puzzle size={14} fill="currentColor" /> Pinned
            </div>
            <div className="flex gap-3">
                 <div className="w-10 h-10 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center font-bold">
                    {username.charAt(0).toUpperCase()}
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">{username}</span>
                        <span className="text-gray-500 text-sm">@{username} · 2h</span>
                    </div>
                    <p className="text-sm mt-1">
                        Just dropped the new Xchat Me Architecture Guide! 
                        Check it out to learn how to build distributed chat apps on the Edge. 👇
                    </p>
                    <div 
                      className="mt-3 rounded-2xl border border-gray-700 overflow-hidden bg-black cursor-pointer hover:border-gray-600 transition-colors"
                      onClick={() => handleNavigate('https://xchat.me')}
                    >
                        <div className="h-32 bg-gray-800 flex items-center justify-center">
                            <span className="text-gray-500 font-mono text-xs">xchat-architecture-preview.png</span>
                        </div>
                        <div className="p-3 bg-[#0d1117]">
                            <div className="text-sm text-gray-400">xchat.me</div>
                            <div className="text-sm text-white">Xchat Me Master Guide</div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    if (url.includes('x.com')) return <XProfilePage />;
    if (url.includes('xchat.me')) return <GuidePage />;
    return <GooglePage />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1117] flex flex-col p-4 md:p-8">
      {/* Header / Instructions */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-white">
          <h2 className="text-xl font-bold">Live Architecture Demo</h2>
          <p className="text-sm text-gray-400">Click the Xchat icon in the browser toolbar to test the extension.</p>
        </div>
        <button 
          onClick={onExit}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
        >
          Exit Demo
        </button>
      </div>

      {/* Browser Container */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-700 relative">
        
        {/* Browser Chrome (Top Bar) */}
        <div className="bg-[#2d333b] p-3 flex items-center gap-4 border-b border-[#1b1f24]">
          {/* Window Controls */}
          <div className="flex gap-2 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>

          {/* Nav Controls */}
          <div className="flex gap-4 text-gray-400">
            <ArrowLeft size={18} className="cursor-pointer hover:text-white" onClick={() => handleNavigate('https://google.com')} />
            <ArrowRight size={18} className="cursor-pointer hover:text-white" />
            <RotateCw size={18} className="cursor-pointer hover:text-white" />
          </div>

          {/* Address Bar */}
          <div className="flex-1 bg-[#1c2128] rounded-full px-4 py-1.5 flex items-center gap-2 text-sm text-gray-300 border border-[#444c56]">
            <Lock size={14} className="text-gray-500" />
            <input 
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                 if(e.key === 'Enter') handleNavigate(url);
              }}
              className="bg-transparent border-none outline-none w-full text-gray-300" 
            />
          </div>

          {/* Toolbar Icons */}
          <div className="flex gap-4 items-center pl-2 border-l border-gray-600 ml-2">
             <div 
                className={`cursor-pointer transition-all duration-200 p-1.5 rounded-lg hover:bg-gray-700 relative group ${isExtensionOpen ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400'}`}
                onClick={() => setIsExtensionOpen(!isExtensionOpen)}
             >
                <MessageSquare size={20} />
                {!isExtensionOpen && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-[#2d333b]"></span>
                )}
             </div>
             <Puzzle size={20} className="text-gray-400" />
             <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white border-2 border-[#1b1f24]">
               M
             </div>
          </div>
        </div>

        {/* Browser Viewport (The "Webpage") */}
        <div className="flex-1 relative overflow-hidden flex flex-col items-center bg-white">
            {/* Page Content */}
            {renderPage()}

            {/* The Extension Overlay */}
            <SimulatedExtension 
              isOpen={isExtensionOpen} 
              site={getDomain(url)} 
              onNavigate={handleNavigate}
            />
        </div>
      </div>
    </div>
  );
};

export default BrowserDemo;