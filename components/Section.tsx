import React from 'react';
import { Section as SectionType } from '../types';
import CodeBlock from './CodeBlock';
import { ChevronRight, Info } from 'lucide-react';

interface SectionProps {
  data: SectionType;
}

const Section: React.FC<SectionProps> = ({ data }) => {
  return (
    <section id={data.id} className="mb-20 scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">{data.title}</h2>
      </div>
      
      <p className="text-gray-400 text-lg mb-10 leading-relaxed border-l-2 border-indigo-500 pl-4">
        {data.description}
      </p>

      <div className="space-y-12">
        {data.steps.map((step, idx) => (
          <div key={idx} className="relative pl-6 border-l border-gray-800">
            {/* Step Dot */}
            <div className="absolute -left-1.5 top-2 w-3 h-3 rounded-full bg-gray-700 border-2 border-[#0d1117]"></div>
            
            <h3 className="text-xl font-semibold text-gray-200 mb-2">{step.title}</h3>
            
            {step.description && (
              <p className="text-gray-400 mb-4">{step.description}</p>
            )}

            {step.actionItems && (
              <ul className="space-y-2 mb-6 bg-[#161b22]/50 p-4 rounded-lg border border-gray-800">
                {step.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <ChevronRight size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {step.code && <CodeBlock data={step.code} />}

            {step.note && (
              <div className="flex gap-3 items-start bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-blue-200 text-sm mt-4">
                <Info size={18} className="shrink-0 mt-0.5" />
                <p>{step.note}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Section;