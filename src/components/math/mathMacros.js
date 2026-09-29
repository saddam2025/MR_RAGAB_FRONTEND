// Shared by MathLive input and KaTeX output. Arabic glyphs stay inside
// \text{} while the surrounding math container remains LTR.
const MATH_MACROS = {
  '\\arabicvar': '\\mathord{\\text{#1}}',
  // Convention (a): upper index above, lower index below the symbol.
  '\\combq': '\\mathop{\\text{ق}}\\limits_{#2}^{#1}',
};

export default MATH_MACROS;
