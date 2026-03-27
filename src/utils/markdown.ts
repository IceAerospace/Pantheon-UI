/**
 * Markdown rendering helpers.
 * Provides sanitized react-markdown configuration reusable across components.
 */

export const MARKDOWN_PLUGINS = {
  /** remark plugins to pass to ReactMarkdown */
  remarkPlugins: [] as unknown[],
  /** rehype plugins to pass to ReactMarkdown */
  rehypePlugins: [] as unknown[],
};

/**
 * Extract plain text from a markdown string (for previews / titles).
 */
export function markdownToPlainText(md: string): string {
  return md
    .replace(/#+\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/!\[.+?\]\(.+?\)/g, "")
    .replace(/^[-*_]{3,}$/gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/**
 * Determine if a string contains substantial markdown syntax.
 */
export function hasMarkdown(text: string): boolean {
  return /(\*\*|__|`|#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s|\[.+?\]\(.+?\))/m.test(
    text
  );
}
