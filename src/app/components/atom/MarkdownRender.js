// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Quicksand } from "next/font/google";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneDark, prism, materialDark, atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';


const quicksand = Quicksand({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-content',
  });

// Custom remark plugin to properly mark inline code
const remarkInlineCode = () => {
  return (tree) => {
    const visit = (node, parent) => {
      if (node.type === 'inlineCode') {
        // This is inline code - mark it as such
        node.inline = true;
      }
      
      if (node.children) {
        node.children.forEach(child => visit(child, node));
      }
    };
    visit(tree);
  };
};
  
   const CodeBlock = ({ className, children, ...props }) => {
     const match = /language-(\w+)/.exec(className || '');
     const language = match ? match[1] : 'text';
     const codeString = String(children).replace(/\n$/, '');

     const handleCopy = () => {
       navigator.clipboard.writeText(codeString);
     };

     return (
        <div className="relative overflow-x-auto max-w-full">
         <button
           onClick={handleCopy}
           className="absolute top-2 right-2 z-10 bg-neutral-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded transition-colors duration-200"
           title="Copy code"
         >
           Copy
         </button>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="pre"
          customStyle={{
            margin: '0rem 0',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.0',
            maxWidth: '100%',
            overflowX: 'auto',
          }}
          showLineNumbers={true}
          wrapLines={true}
          {...props}
        >
           {codeString}
         </SyntaxHighlighter>
       </div>
     );
   };

const components = {
    // Headings
    h1: ({ node, ...props }) => (
        <h1 className="text-3xl font-extrabold mt-4 mb-2 text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700" {...props} />
    ),
    h2: ({ node, ...props }) => (
        <h2 className="text-2xl font-bold mt-3 mb-1 text-gray-800 dark:text-gray-200" {...props} />
    ),
    h3: ({ node, ...props }) => (
        <h3 className="text-xl font-semibold mt-2 mb-0.5 text-gray-700 dark:text-gray-300" {...props} />
    ),
    h4: ({ node, ...props }) => (
        <h4 className="text-lg font-semibold mt-1 text-gray-600 dark:text-gray-400" {...props} />
    ),
    h5: ({ node, ...props }) => (
        <h5 className="text-base font-medium mt-1 text-gray-600 dark:text-gray-400" {...props} />
    ),
    h6: ({ node, ...props }) => (
        <h6 className="text-sm font-medium mt-0.5 text-gray-500 dark:text-gray-500" {...props} />
    ),

    // Paragraph
    p: ({ node, ...props }) => (
        <p className="mb-4 leading-tight text-gray-700 dark:text-gray-300" {...props} />
    ),

    // Links
    a: ({ node, ...props }) => (
        <a
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline transition-colors duration-200"
            target="_blank" // Often good practice for external links
            rel="noopener noreferrer" // Security best practice
            {...props}
        />
    ),

    // Lists
    ul: ({ node, ...props }) => (
        <ul className="list-disc pl-6 mb-1 text-gray-700 dark:text-gray-300" {...props} />
    ),
    ol: ({ node, ...props }) => (
        <ol className="list-decimal pl-6 mb-1 text-gray-700 dark:text-gray-300" {...props} />
    ),
    li: ({ node, ...props }) => (
        <li className="mb-0.5 leading-tight" {...props} />
    ),

    // Blockquote
    blockquote: ({ node, ...props }) => (
        <blockquote className="border-l-4 border-gray-400 pl-4 py-2 my-3 italic text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800" {...props} />
    ),

    // Code
    code({ node, inline, className, children, ...props }) {
        // Check if this is inline code - react-markdown should pass inline prop
        // Also check if there's no className (which indicates inline code)
        const isInline = inline === true || !className;
        
        if (!isInline) {
            return <CodeBlock className={className} {...props}>
                {children}
            </CodeBlock>
        }
        return <code 
            className={`font-mono text-sm bg-gray-200 dark:bg-neutral-700 text-gray-800
                 dark:text-gray-200 px-1 py-0.5 rounded ${className || ''}`}
            {...props}
        >
            {children}
        </code>
    },
    // For preformatted blocks (like code blocks)
    pre: ({ node, ...props }) => (
        <pre className="rounded-md overflow-x-auto my-2" {...props} />
    ),


    // Tables
    table: ({ node, ...props }) => (
        <table className="w-full border-collapse my-4 text-gray-700 dark:text-gray-300" {...props} />
    ),
    thead: ({ node, ...props }) => (
        <thead className="bg-gray-100 dark:bg-neutral-700 border-b border-gray-200 dark:border-gray-600" {...props} />
    ),
    th: ({ node, ...props }) => (
        <th className="px-4 py-2 text-left font-semibold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600" {...props} />
    ),
    tbody: ({ node, ...props }) => (
        <tbody {...props} />
    ),
    tr: ({ node, ...props }) => (
        <tr className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 even:bg-gray-50 dark:even:bg-gray-800" {...props} />
    ),
    td: ({ node, ...props }) => (
        <td className="px-4 py-2 border border-gray-200 dark:border-gray-600" {...props} />
    ),

    // Images
    img: ({ node, ...props }) => (
        <img 
            className="max-w-full h-auto mx-auto my-4 rounded-lg cursor-pointer transition-shadow" 
            onClick={(e) => {
                const fullscreenDiv = document.createElement('div');
                fullscreenDiv.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
                fullscreenDiv.innerHTML = `
                    <div class="relative w-screen h-screen">
                        <img src="${e.target.src}" alt="${e.target.alt || ''}" class="w-screen h-screen object-contain" />
                        <button class="absolute top-4 right-4 text-white text-5xl bg-neutral-700 bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors" onclick="this.parentElement.parentElement.remove()">
                            ×
                        </button>
                    </div>
                `;
                document.body.appendChild(fullscreenDiv);
                
                // Close on click outside image
                fullscreenDiv.addEventListener('click', (event) => {
                    if (event.target === fullscreenDiv) {
                        fullscreenDiv.remove();
                    }
                });
                
                // Close on escape key
                const handleEscape = (event) => {
                    if (event.key === 'Escape') {
                        fullscreenDiv.remove();
                        document.removeEventListener('keydown', handleEscape);
                    }
                };
                document.addEventListener('keydown', handleEscape);
            }}
            {...props} 
        />
    ),

    // Horizontal Rule
    hr: ({ node, ...props }) => (
        <hr className="my-8 border-t-2 border-gray-200 dark:border-gray-700" {...props} />
    ),

    // Strong and Emphasis
    strong: ({ node, ...props }) => (
        <strong className="font-bold text-gray-700 dark:text-gray-100" {...props} />
    ),
    em: ({ node, ...props }) => (
        <em className="font-semibold" {...props} />
    ),

    // Other less common but useful elements
    del: ({ node, ...props }) => (
        <del className="line-through text-gray-500 dark:text-gray-400" {...props} />
    ),
    // Keyboard input
    kbd: ({ node, ...props }) => (
        <kbd className="inline-block px-1.5 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-neutral-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" {...props} />
    ),
    details: ({ node, ...props }) => (
        <details className="my-4 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md" {...props} />
    ),
    summary: ({ node, ...props }) => (
        <summary className="font-semibold text-gray-800 dark:text-gray-200 cursor-pointer py-1" {...props} />
    ),
    // video: ({node, ...props}) => (
    //     <video controls style={{width: '100%', maxWidth: '1024px'}}>
    //       <source src={props.src} type="video/mp4" />
    //       Your browser does not support the video tag.
    //     </video>
    //   )
};


const MarkdownRender = ({ children }) => {
    // Preprocess content to wrap single words in backticks
    // const preprocessContent = (content) => {
    //     if (typeof content !== 'string') return content;
        
    //     // This regex matches single words and wraps them in backticks
    //     return content.replace(/\b([a-zA-Z_][a-zA-Z0-9_-]*)\b/g, (match, word) => {
    //         return `\`${word}\``;
    //     });
    // };

    // const processedContent = preprocessContent(children);

    return (
        <div className={`markdown-render font-content overflow-x-auto max-w-full`}>
            <Markdown
                components={components}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
            >
                {children}
            </Markdown>
        </div>
    );
};


export default MarkdownRender;
