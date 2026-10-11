"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/n-gram";
exports.ids = ["vendor-chunks/n-gram"];
exports.modules = {

/***/ "(ssr)/./node_modules/n-gram/index.js":
/*!**************************************!*\
  !*** ./node_modules/n-gram/index.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   bigram: () => (/* binding */ bigram),\n/* harmony export */   nGram: () => (/* binding */ nGram),\n/* harmony export */   trigram: () => (/* binding */ trigram)\n/* harmony export */ });\nconst bigram = nGram(2)\nconst trigram = nGram(3)\n\n/**\n * Factory returning a function that converts a value string to n-grams.\n *\n * @param {number} n\n */\nfunction nGram(n) {\n  if (\n    typeof n !== 'number' ||\n    Number.isNaN(n) ||\n    n < 1 ||\n    n === Number.POSITIVE_INFINITY\n  ) {\n    throw new Error('`' + n + '` is not a valid argument for `n-gram`')\n  }\n\n  return grams\n\n  /**\n   * Create n-grams from a given value.\n   *\n   * @template {string|Array<unknown>} T\n   * @param {T} [value]\n   * @returns {T extends any[] ? T : Array<string>}\n   */\n  function grams(value) {\n    /** @type {T extends any[] ? T : Array<string>} */\n    // @ts-expect-error: pretty sure this is fine.\n    const nGrams = []\n\n    if (value === null || value === undefined) {\n      return nGrams\n    }\n\n    const source = typeof value.slice === 'function' ? value : String(value)\n    let index = source.length - n + 1\n\n    if (index < 1) {\n      return nGrams\n    }\n\n    while (index--) {\n      nGrams[index] = source.slice(index, index + n)\n    }\n\n    return nGrams\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbi1ncmFtL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFPO0FBQ0E7O0FBRVA7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQix1QkFBdUI7QUFDdkMsYUFBYSxHQUFHO0FBQ2hCLGVBQWU7QUFDZjtBQUNBO0FBQ0EsZUFBZSxxQ0FBcUM7QUFDcEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3JlYWRlYXN5LWFpLy4vbm9kZV9tb2R1bGVzL24tZ3JhbS9pbmRleC5qcz8yMmMyIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBiaWdyYW0gPSBuR3JhbSgyKVxuZXhwb3J0IGNvbnN0IHRyaWdyYW0gPSBuR3JhbSgzKVxuXG4vKipcbiAqIEZhY3RvcnkgcmV0dXJuaW5nIGEgZnVuY3Rpb24gdGhhdCBjb252ZXJ0cyBhIHZhbHVlIHN0cmluZyB0byBuLWdyYW1zLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuR3JhbShuKSB7XG4gIGlmIChcbiAgICB0eXBlb2YgbiAhPT0gJ251bWJlcicgfHxcbiAgICBOdW1iZXIuaXNOYU4obikgfHxcbiAgICBuIDwgMSB8fFxuICAgIG4gPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2AnICsgbiArICdgIGlzIG5vdCBhIHZhbGlkIGFyZ3VtZW50IGZvciBgbi1ncmFtYCcpXG4gIH1cblxuICByZXR1cm4gZ3JhbXNcblxuICAvKipcbiAgICogQ3JlYXRlIG4tZ3JhbXMgZnJvbSBhIGdpdmVuIHZhbHVlLlxuICAgKlxuICAgKiBAdGVtcGxhdGUge3N0cmluZ3xBcnJheTx1bmtub3duPn0gVFxuICAgKiBAcGFyYW0ge1R9IFt2YWx1ZV1cbiAgICogQHJldHVybnMge1QgZXh0ZW5kcyBhbnlbXSA/IFQgOiBBcnJheTxzdHJpbmc+fVxuICAgKi9cbiAgZnVuY3Rpb24gZ3JhbXModmFsdWUpIHtcbiAgICAvKiogQHR5cGUge1QgZXh0ZW5kcyBhbnlbXSA/IFQgOiBBcnJheTxzdHJpbmc+fSAqL1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3I6IHByZXR0eSBzdXJlIHRoaXMgaXMgZmluZS5cbiAgICBjb25zdCBuR3JhbXMgPSBbXVxuXG4gICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuR3JhbXNcbiAgICB9XG5cbiAgICBjb25zdCBzb3VyY2UgPSB0eXBlb2YgdmFsdWUuc2xpY2UgPT09ICdmdW5jdGlvbicgPyB2YWx1ZSA6IFN0cmluZyh2YWx1ZSlcbiAgICBsZXQgaW5kZXggPSBzb3VyY2UubGVuZ3RoIC0gbiArIDFcblxuICAgIGlmIChpbmRleCA8IDEpIHtcbiAgICAgIHJldHVybiBuR3JhbXNcbiAgICB9XG5cbiAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgbkdyYW1zW2luZGV4XSA9IHNvdXJjZS5zbGljZShpbmRleCwgaW5kZXggKyBuKVxuICAgIH1cblxuICAgIHJldHVybiBuR3JhbXNcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/n-gram/index.js\n");

/***/ })

};
;