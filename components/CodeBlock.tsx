import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode } from 'lucide-react';
import { CodeSnippet } from '../types';

interface CodeBlockProps {
  data: CodeSnippet;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTerminal = data.language === 'bash';

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-700 bg-[#0d1117] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-700">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
          {isTerminal ? <Terminal size={14} className="text-green-500" /> : <FileCode size={14} className="text-blue-400" />}
          <span>{data.filename || data.language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-700 transition-colors text-xs text-gray-400 hover:text-white"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      {/* Code Area */}
      <div className="overflow-x-auto p-4">
        <pre className="font-mono text-sm leading-relaxed text-gray-300">
          <code>{data.code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;