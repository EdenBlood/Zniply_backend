import sanitizeHtml from 'sanitize-html';


export function sanitizeCodeInput(htmlString: string): string {
  return sanitizeHtml(htmlString, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'u',
      'p', 'br', 'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4',
      'a', 'img', 'span'
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt'],
      '*': ['class'],
    },
    // permite esquemas seguros como https o mailto
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    // evita la eliminación de contenido de <code>
    nonTextTags: ['style', 'script', 'textarea', 'noscript'] // <code> y <pre> no van aquí
  });
}

export function sanitizeInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    allowedSchemes: [],
  }).trim();
}