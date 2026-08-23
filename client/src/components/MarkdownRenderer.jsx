import { useState } from 'react';

/**
 * Enhanced lightweight Markdown & Code Renderer for Teach Devta AI
 */
export default function MarkdownRenderer({ content = '' }) {
  if (!content) return null;

  // Split content into code blocks vs text blocks
  const parts = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      code: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return (
    <div className="markdown-content">
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return <CodeBlock key={idx} language={part.language} code={part.code} />;
        }
        return <FormattedText key={idx} text={part.content} />;
      })}
    </div>
  );
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="md-code-container">
      <div className="md-code-header">
        <span className="md-code-lang">{language || 'code'}</span>
        <button className="md-copy-btn" onClick={handleCopy} type="button">
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
      <pre className="md-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FormattedText({ text }) {
  // Check for markdown tables
  const lines = text.split('\n');
  const renderedElements = [];
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      renderedElements.push(renderTable(tableRows, renderedElements.length));
      tableRows = [];
    }
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if table row (starts and ends with | or contains |)
    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true;
      // Skip delimiter row like |---|---|
      if (!line.match(/^\|(\s*:?-+:?\s*\|)+$/)) {
        tableRows.push(line);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!line) {
      renderedElements.push(<div key={`spacer-${i}`} className="md-spacer" />);
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h4 key={i} className="md-h3" dangerouslySetInnerHTML={{ __html: formatInline(line.slice(4)) }} />
      );
    } else if (line.startsWith('## ')) {
      renderedElements.push(
        <h3 key={i} className="md-h2" dangerouslySetInnerHTML={{ __html: formatInline(line.slice(3)) }} />
      );
    } else if (line.startsWith('# ')) {
      renderedElements.push(
        <h2 key={i} className="md-h1" dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
      );
    } 
    // Bullet lists
    else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      renderedElements.push(
        <li key={i} className="md-list-item" dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(line)) {
      const itemText = line.replace(/^\d+\.\s/, '');
      renderedElements.push(
        <li key={i} className="md-list-item-num" dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
      );
    }
    // Blockquotes
    else if (line.startsWith('> ')) {
      renderedElements.push(
        <blockquote key={i} className="md-quote" dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
      );
    }
    // Regular paragraphs
    else {
      renderedElements.push(
        <p key={i} className="md-p" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    }
  }

  if (inTable) flushTable();

  return <>{renderedElements}</>;
}

function renderTable(rows, key) {
  if (rows.length === 0) return null;
  const headerCells = rows[0]
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());
  const bodyRows = rows.slice(1).map((r) =>
    r
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim())
  );

  return (
    <div key={`table-${key}`} className="md-table-wrap">
      <table className="md-table">
        <thead>
          <tr>
            {headerCells.map((h, idx) => (
              <th key={idx} dangerouslySetInnerHTML={{ __html: formatInline(h) }} />
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatInline(str) {
  return str
    // Escape standard HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
    // Bold: **text**
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');
}
