import React from 'react';
import { Section } from '../types';
import { Book, Code, Database, Layout } from 'lucide-react';

interface SidebarProps {
  sections: Section[];
  activeId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ sections, activeId }) => {
  const getIcon = (id: string) => {
    if (id.includes('database')) return <Database size={18} />;
    if (id.includes('backend')) return <Code size={18} />;
    if (id.includes('frontend')) return <Layout size={18} />;
    return <Book size={18} />;
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="hidden lg:block w-72 fixed h-screen top-0 left-0 border-r border-gray-800 bg-[#0d1117]/50 backdrop-blur-xl pt-20 pb-10 px-6">
      <nav className="space-y-1">
        <div className="mb-8 px-3">
            <h1 className="text-xl font-bold text-white tracking-tight">Xchat Me</h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Master Guide</p>
        </div>

        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => handleClick(e, section.id)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${activeId === section.id 
                ? 'bg-indigo-500/10 text-indigo-400 translate-x-1' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }
            `}
          >
            {getIcon(section.id)}
            {section.title.replace('Phase ', '').split(':')[0]}
          </a>
        ))}
      </nav>

      <div className="absolute bottom-8 left-6 right-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30">
          <p className="text-xs text-indigo-200 mb-2 font-medium">Ready to build?</p>
          <div className="h-1 w-full bg-indigo-900/50 rounded-full overflow-hidden">
             <div className="h-full w-3/4 bg-indigo-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;