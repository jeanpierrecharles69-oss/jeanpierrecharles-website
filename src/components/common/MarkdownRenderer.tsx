import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

// Configure marked pour securite + style
marked.setOptions({
    breaks: true,    // retours a la ligne simples
    gfm: true,       // GitHub Flavored Markdown
});

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
    const html = useMemo(() => {
        if (!content) return '';
        const rawHtml = marked.parse(content) as string;
        return DOMPurify.sanitize(rawHtml);
    }, [content]);

    return (
        <div
            className={className}
            style={{ fontSize: 12, lineHeight: 1.6, wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export default MarkdownRenderer;
