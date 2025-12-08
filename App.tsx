import React, { useState, useEffect } from 'react';
import Section from './components/Section';
import Sidebar from './components/Sidebar';
import BrowserDemo from './components/BrowserDemo';
import { guideData } from './data/guideContent';
import { Menu, Github, ExternalLink, Play } from 'lucide-react';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('prerequisites');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [view, setView] = useState<'guide' | 'demo'>('guide');

  // Intersection Observer to update active section on scroll
  useEffect(() => {
    if (view !== 'guide') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    guideData.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [view]);

  // If in Demo Mode, render only the demo component
  if (view === 'demo') {
    return <BrowserDemo onExit={() => setView('guide')} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-indigo-900 selection:text-indigo-100">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between p-4 bg-[#0d1117]/90 backdrop-blur border-b border-gray-800">
        <span className="font-bold text-white">Xchat Me Guide</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-400">
          <Menu />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 lg:hidden pt-20 px-6">
          <nav className="space-y-4">
            {guideData.map((s) => (
              <a 
                key={s.id} 
                href={`#${s.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-lg font-medium text-gray-300 py-2 border-b border-gray-800"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar sections={guideData} activeId={activeSection} />

      {/* Main Content */}
      <main className="lg:pl-80 relative">
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
          
          {/* Hero Header */}
          <header className="mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono mb-6 border border-indigo-500/20">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              2025 Architecture Edition
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tight mb-6">
              Xchat Me <br/> Master Guide
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
              The complete "Copy-Paste" blueprint for building a distributed chat architecture using Cloudflare Workers, DynamoDB, and Chrome Extensions.
            </p>

            <div className="flex gap-4 mt-8 flex-wrap">
              <a href="#" className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                <Github size={18} />
                View Source
              </a>
              <button 
                onClick={() => setView('demo')}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors border border-indigo-500/50 shadow-lg shadow-indigo-900/20"
              >
                <Play size={18} fill="currentColor" />
                Launch Live Demo
              </button>
            </div>
          </header>

          <hr className="border-gray-800 mb-20" />

          {/* Sections Render */}
          {guideData.map((section) => (
            <Section key={section.id} data={section} />
          ))}

          {/* Footer */}
          <footer className="mt-32 pt-12 border-t border-gray-800 text-center text-gray-500 text-sm pb-12">
            <p>© 2025 Xchat Me Architecture. Open Source Guide.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;