import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Props {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<Props> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-aing-text mt-8 mb-4 pb-2 border-b border-aing-border">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-aing-text mt-7 mb-3 pb-1 border-b border-aing-border">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-aing-text mt-5 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-aing-text mt-4 mb-2">{children}</h4>
          ),
          // Paragraph
          p: ({ children }) => (
            <p className="text-aing-text text-sm leading-relaxed mb-4">{children}</p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-4 text-sm text-aing-text pl-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-4 text-sm text-aing-text pl-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          // Code
          code: ({ inline, className: cls, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="bg-gray-100 text-aing-blue font-mono text-xs px-1.5 py-0.5 rounded" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`block font-mono text-xs leading-relaxed ${cls || ''}`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-950 text-gray-100 rounded-xl p-5 overflow-x-auto text-xs font-mono mb-5 leading-relaxed border border-gray-800">
              {children}
            </pre>
          ),
          // Table (GFM)
          table: ({ children }) => (
            <div className="overflow-x-auto mb-5">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 border-b border-aing-border">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-aing-border">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-aing-muted uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-aing-text text-sm">{children}</td>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-aing-blue hover:underline"
            >
              {children}
            </a>
          ),
          // Images (배지 포함)
          img: ({ src, alt }) => (
            <img src={src} alt={alt || ''} className="inline-block max-w-full" />
          ),
          // Blockquote (callout)
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-aing-blue bg-blue-50 pl-4 pr-4 py-3 rounded-r-lg mb-4 text-sm text-aing-muted">
              {children}
            </blockquote>
          ),
          // HR
          hr: () => (
            <hr className="border-aing-border my-6" />
          ),
          // Strong / Em
          strong: ({ children }) => (
            <strong className="font-semibold text-aing-text">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-aing-muted">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
