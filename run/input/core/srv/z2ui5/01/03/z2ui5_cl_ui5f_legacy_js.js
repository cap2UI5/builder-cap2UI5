
class z2ui5_cl_ui5f_legacy_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(["z2ui5/core/Lib"], (Lib) => {` + `
` + `  "use strict";` + `
` + `` + `
` + `  const CH_SQUOTE = "'";` + `
` + `  const CH_DQUOTE = '"';` + `
` + `` + `
` + `  const EF_UNESCAPE = { n: "\\n", r: "\\r" };` + `
` + `  function unescapeEfString(body) {` + `
` + `    return body.replace(/\\\\(.)/g, (match, ch) => EF_UNESCAPE[ch] ?? ch);` + `
` + `  }` + `
` + `` + `
` + `  function parseEfValue(token) {` + `
` + `    if (token === "") return undefined;` + `
` + `    const first = token[0];` + `
` + `    if (first === CH_SQUOTE) {` + `
` + `      return unescapeEfString(token.slice(1, -1));` + `
` + `    }` + `
` + `    if (first === CH_DQUOTE || first === "{" || first === "[") {` + `
` + `      try {` + `
` + `        return JSON.parse(token);` + `
` + `      } catch {` + `
` + `        return token;` + `
` + `      }` + `
` + `    }` + `
` + `    if (token === "true") return true;` + `
` + `    if (token === "false") return false;` + `
` + `    if (token === "null") return null;` + `
` + `    if (token === "undefined") return undefined;` + `
` + `    const num = Number(token);` + `
` + `    return Number.isNaN(num) ? token : num;` + `
` + `  }` + `
` + `` + `
` + `  function parseEfArgs(str) {` + `
` + `    const args = [];` + `
` + `    let depth = 0;` + `
` + `    let quote = null;` + `
` + `    let token = "";` + `
` + `    for (let i = 0; i < str.length; i++) {` + `
` + `      const ch = str[i];` + `
` + `      if (quote) {` + `
` + `        token += ch;` + `
` + `        if (ch === "\\\\" && i + 1 < str.length) token += str[++i];` + `
` + `        else if (ch === quote) quote = null;` + `
` + `        continue;` + `
` + `      }` + `
` + `      if (ch === CH_SQUOTE || ch === CH_DQUOTE) {` + `
` + `        quote = ch;` + `
` + `        token += ch;` + `
` + `      } else if (ch === "{" || ch === "[" || ch === "(") {` + `
` + `        depth++;` + `
` + `        token += ch;` + `
` + `      } else if (ch === "}" || ch === "]" || ch === ")") {` + `
` + `        depth--;` + `
` + `        token += ch;` + `
` + `      } else if (ch === "," && depth === 0) {` + `
` + `        args.push(parseEfValue(token.trim()));` + `
` + `        token = "";` + `
` + `      } else {` + `
` + `        token += ch;` + `
` + `      }` + `
` + `    }` + `
` + `    if (token.trim() !== "") args.push(parseEfValue(token.trim()));` + `
` + `    return args;` + `
` + `  }` + `
` + `` + `
` + `  function run(item, oController) {` + `
` + `    try {` + `
` + `      const snippet = item.trim();` + `
` + `      const match = /^\\.?eF\\s*\\(([\\s\\S]*)\\)\\s*;?$/.exec(snippet);` + `
` + `      if (match) {` + `
` + `        oController.eF(...parseEfArgs(match[1]));` + `
` + `        return;` + `
` + `      }` + `
` + `` + `
` + `      Function("return " + item)();` + `
` + `    } catch (e) {` + `
` + `      Lib.logError("LegacyCustomJs: snippet execution failed", e);` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  return { run };` + `
` + `});` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_legacy_js;

