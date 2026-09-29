// MathLive can emit legacy TeX spacing commands (for example when content is
// pasted). KaTeX does not support `\tmspace`, so discard only that visual
// spacing metadata while preserving the mathematical operands around it.
export default function normalizeMathLatex(latex) {
  return String(latex || '')
    // MathLive may serialize a TeX spacing node with ASCII or Unicode minus,
    // optional braces, or an expanded `mu.1667em` value. None are needed for
    // the mathematical meaning, and KaTeX rejects the command itself.
    .replace(/\\tmspace[^\\]*?em/g, '');
}
