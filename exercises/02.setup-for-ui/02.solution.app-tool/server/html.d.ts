// Wrangler imports .html files as text (see the "rules" in wrangler.jsonc).
declare module '*.html' {
  const html: string;
  export default html;
}
