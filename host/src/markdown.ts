/**
 * Workshop addition: a small Markdown renderer for the guide pane.
 *
 * It covers what the step READMEs use: headings, paragraphs, lists, code fences, inline code, bold,
 * italics, links, tables, blockquotes and rules. Everything is escaped first, so a README can't inject
 * HTML into the host. Not CommonMark: anything fancier renders as plain text.
 */

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Only these link targets become links. A `javascript:` URL stays text. */
const safeUrl = (url: string) => /^(https?:|mailto:|#)/i.test(url);

/** The emoji a heading or paragraph starts with, so CSS can pick out the 🔨 task and the 📡 section. */
const MARKERS = ["🔨", "💡", "🧠", "📡", "📖", "🧪", "🔥", "✅"];
const markerOf = (text: string) => MARKERS.find((m) => text.startsWith(m));
const markerAttr = (text: string) => {
  const m = markerOf(text);
  return m ? ` data-marker="${m}"` : "";
};

/**
 * Inline spans. Code spans are swapped for placeholders first, so `**` or `[` inside backticks stays
 * literal while "**`App`**" still turns bold.
 */
export function renderInline(text: string): string {
  const codes: string[] = [];
  const held = text.replace(/(`+)([\s\S]*?)\1/g, (_, _ticks: string, code: string) => {
    codes.push(`<code>${escape(code.trim() || code)}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  return escape(held)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, label: string, url: string) =>
      safeUrl(url) ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>` : whole,
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?![*\w])/g, "$1<em>$2</em>")
    .replace(/\u0000(\d+)\u0000/g, (_, n: string) => codes[Number(n)]!);
}

const FENCE = /^\s*```(\S*)/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const TABLE_DIVIDER = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

/** Splits a table row on `|`, except inside backticks or escaped as `\|`. */
function cells(row: string): string[] {
  const out: string[] = [];
  let cell = "";
  let inCode = false;
  const chars = [...row.trim().replace(/^\||\|$/g, "")];
  for (let n = 0; n < chars.length; n++) {
    const ch = chars[n]!;
    if (ch === "\\" && chars[n + 1] === "|") {
      cell += "|";
      n++;
      continue;
    }
    if (ch === "`") inCode = !inCode;
    if (ch === "|" && !inCode) {
      out.push(cell.trim());
      cell = "";
    } else {
      cell += ch;
    }
  }
  out.push(cell.trim());
  return out;
}

const slug = (text: string) =>
  text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

/** Does this line start a block other than a paragraph? */
const startsBlock = (line: string, next = "") =>
  FENCE.test(line) || HEADING.test(line) || RULE.test(line) || LIST_ITEM.test(line) || /^\s*>/.test(line) ||
  (line.trim().startsWith("|") && TABLE_DIVIDER.test(next));

export function renderMarkdown(source: string): string {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (!line.trim()) {
      i++;
      continue;
    }

    // ```lang … ``` → a code block with a copy button (the guide pane handles the click).
    const fence = FENCE.exec(line);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i]!)) code.push(lines[i++]!);
      i++;
      const lang = fence[1] ? ` data-lang="${escape(fence[1])}"` : "";
      html.push(
        `<div class="code-block"${lang}><button type="button" data-copy>Copy</button><pre><code>${escape(code.join("\n"))}</code></pre></div>`,
      );
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1]!.length;
      const text = heading[2]!;
      html.push(`<h${level} id="${slug(text)}"${markerAttr(text)}>${renderInline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (RULE.test(line)) {
      html.push("<hr>");
      i++;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i]!)) quoted.push(lines[i++]!.replace(/^\s*>\s?/, ""));
      html.push(`<blockquote>${renderMarkdown(quoted.join("\n"))}</blockquote>`);
      continue;
    }

    if (line.trim().startsWith("|") && TABLE_DIVIDER.test(lines[i + 1] ?? "")) {
      const head = cells(line);
      const align = cells(lines[i + 1]!).map((c) =>
        c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : "",
      );
      const style = (n: number) => (align[n] ? ` style="text-align:${align[n]}"` : "");
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i]!.trim().startsWith("|")) rows.push(cells(lines[i++]!));
      html.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((c, n) => `<th${style(n)}>${renderInline(c)}</th>`).join("")}</tr></thead>` +
          `<tbody>${rows.map((r) => `<tr>${head.map((_, n) => `<td${style(n)}>${renderInline(r[n] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
      );
      continue;
    }

    const first = LIST_ITEM.exec(line);
    if (first) {
      const indent = first[1]!.length;
      const ordered = /\d/.test(first[2]!);
      const items: string[][] = [];
      while (i < lines.length) {
        const current = lines[i]!;
        const item = LIST_ITEM.exec(current);
        if (item && item[1]!.length <= indent && /\d/.test(item[2]!) === ordered) {
          items.push([item[3]!]);
          i++;
          continue;
        }
        // Blank lines end the list, unless the next line is indented under the item.
        if (!current.trim()) {
          if (/^\s{2,}\S/.test(lines[i + 1] ?? "")) {
            items.at(-1)!.push("");
            i++;
            continue;
          }
          break;
        }
        // Indented lines (a nested list, a code block) and lazy continuation lines belong to the item.
        if (/^\s{2,}/.test(current) || !startsBlock(current, lines[i + 1])) {
          items.at(-1)!.push(current.replace(new RegExp(`^\\s{0,${indent + 4}}`), ""));
          i++;
          continue;
        }
        break;
      }
      const start = ordered && parseInt(first[2]!, 10) !== 1 ? ` start="${parseInt(first[2]!, 10)}"` : "";
      const tag = ordered ? "ol" : "ul";
      const body = items
        .map((item) => {
          const inner = renderMarkdown(item.join("\n"));
          // A one-paragraph item renders without the <p>, so lists stay tight.
          const tight = /^<p[^>]*>([\s\S]*)<\/p>$/.exec(inner);
          return `<li>${tight && !tight[1]!.includes("<p") ? tight[1] : inner}</li>`;
        })
        .join("");
      html.push(`<${tag}${start}>${body}</${tag}>`);
      continue;
    }

    // A paragraph runs until a blank line or the start of another block.
    const para: string[] = [line.trim()];
    i++;
    while (i < lines.length && lines[i]!.trim() && !startsBlock(lines[i]!, lines[i + 1])) para.push(lines[i++]!.trim());
    const text = para.join(" ");
    html.push(`<p${markerAttr(text)}>${renderInline(text)}</p>`);
  }

  return html.join("\n");
}
