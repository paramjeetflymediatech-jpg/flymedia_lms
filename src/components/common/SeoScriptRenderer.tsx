import React from 'react';

interface SeoScriptRendererProps {
  code?: string | null;
  location?: 'head' | 'body';
}

function parseAttributes(rawAttrs: string): Record<string, any> {
  const attrRegex = /([a-zA-Z0-9_-]+)(?:=([\"'])(.*?)\2|=([^\s>]+))?/g;
  const attrs: Record<string, any> = {};
  let match;
  while ((match = attrRegex.exec(rawAttrs)) !== null) {
    const name = match[1];
    const val = match[3] !== undefined ? match[3] : (match[4] !== undefined ? match[4] : true);
    const lowerName = name.toLowerCase();

    if (lowerName === 'crossorigin') attrs.crossOrigin = val;
    else if (lowerName === 'class') attrs.className = val;
    else if (lowerName === 'http-equiv') attrs.httpEquiv = val;
    else if (lowerName === 'charset') attrs.charSet = val;
    else if (lowerName === 'async') attrs.async = true;
    else if (lowerName === 'defer') attrs.defer = true;
    else attrs[name] = val;
  }
  return attrs;
}

/**
 * Robustly renders SEO script snippets entered by admins.
 * Handles:
 * 1. Pure JavaScript (no HTML tags) -> <script dangerouslySetInnerHTML={{ __html: code }} />
 * 2. Full HTML tags (<script src="...">, <meta ...>, <link ...>, <noscript ...>, <style ...>)
 * Prevents double-wrapping `<script><script>...</script></script>` which causes syntax errors in browsers.
 */
export default function SeoScriptRenderer({
  code,
  location = 'head',
}: SeoScriptRendererProps) {
  if (!code || typeof code !== 'string') return null;

  const trimmed = code.trim();
  if (!trimmed) return null;

  // Strip HTML comments
  const clean = trimmed.replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!clean) return null;

  // If raw JSON-LD is provided without script tags, wrap properly
  if ((clean.startsWith('{') || clean.startsWith('[')) && clean.includes('@context')) {
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: clean }} />;
  }

  // If no HTML tags are found, assume it is raw JavaScript code
  const hasHtmlTag = /<[a-zA-Z0-9]+[^>]*>/i.test(clean);
  if (!hasHtmlTag) {
    return <script dangerouslySetInnerHTML={{ __html: clean }} />;
  }

  // Parse HTML tags
  const tagRegex = /<([a-zA-Z0-9]+)([^>]*)(?:>(?:([\s\S]*?)<\/\1>)?|\/>)/gi;
  const elements: React.ReactNode[] = [];
  let match;
  let index = 0;

  while ((match = tagRegex.exec(clean)) !== null) {
    const tagName = match[1].toLowerCase();
    const rawAttrs = match[2] || '';
    const innerHtml = (match[3] || '').trim();
    const attrs = parseAttributes(rawAttrs);
    const key = `seo-${location}-${index++}`;

    switch (tagName) {
      case 'script':
        elements.push(
          <script
            key={key}
            {...attrs}
            dangerouslySetInnerHTML={innerHtml ? { __html: innerHtml } : undefined}
          />
        );
        break;
      case 'meta':
        elements.push(<meta key={key} {...attrs} />);
        break;
      case 'link':
        elements.push(<link key={key} {...attrs} />);
        break;
      case 'noscript':
        elements.push(
          <noscript
            key={key}
            dangerouslySetInnerHTML={innerHtml ? { __html: innerHtml } : undefined}
          />
        );
        break;
      case 'style':
        elements.push(
          <style
            key={key}
            {...attrs}
            dangerouslySetInnerHTML={innerHtml ? { __html: innerHtml } : undefined}
          />
        );
        break;
      default:
        if (location === 'body') {
          elements.push(
            <div
              key={key}
              style={{ display: 'contents' }}
              dangerouslySetInnerHTML={{ __html: match[0] }}
            />
          );
        }
        break;
    }
  }

  if (elements.length === 0) {
    if (location === 'body') {
      return (
        <div
          style={{ display: 'contents' }}
          dangerouslySetInnerHTML={{ __html: clean }}
        />
      );
    }
    return <script dangerouslySetInnerHTML={{ __html: clean }} />;
  }

  return <>{elements}</>;
}
