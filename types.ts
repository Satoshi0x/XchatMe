export interface CodeSnippet {
  language: string;
  filename?: string;
  code: string;
}

export interface Step {
  title: string;
  description?: string;
  code?: CodeSnippet;
  actionItems?: string[];
  note?: string;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  steps: Step[];
}

export interface TableOfContentsItem {
  id: string;
  label: string;
}