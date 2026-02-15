const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

function escapeHtml(input: string) {
  return input.replace(/[&<>"']/g, (char) => htmlEscapes[char] ?? char)
}

export function sanitizeMarkdown(input: string) {
  const escaped = escapeHtml(input)
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  const withItalic = withBold.replace(/\*(.+?)\*/g, '<em>$1</em>')
  const withBreaks = withItalic.replace(/\n/g, '<br />')
  return withBreaks
}
