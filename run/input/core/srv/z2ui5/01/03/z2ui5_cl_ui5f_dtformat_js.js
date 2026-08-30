
class z2ui5_cl_ui5f_dtformat_js {
  static get() {
    let result = ``;
    result = `sap.ui.define([], () => {` + `
` + `  "use strict";` + `
` + `` + `
` + `  const INDENT_UNIT = 3;` + `
` + `` + `
` + `  function toJson(val) {` + `
` + `    const safe = val === undefined ? null : val;` + `
` + `` + `
` + `    const ancestors = [];` + `
` + `    try {` + `
` + `      return JSON.stringify(` + `
` + `        safe,` + `
` + `        function (key, value) {` + `
` + `          if (typeof value === "object" && value !== null) {` + `
` + `            while (` + `
` + `              ancestors.length > 0 &&` + `
` + `              ancestors[ancestors.length - 1] !== this` + `
` + `            ) {` + `
` + `              ancestors.pop();` + `
` + `            }` + `
` + `            if (ancestors.includes(value)) return "[Circular]";` + `
` + `            ancestors.push(value);` + `
` + `          }` + `
` + `          return value;` + `
` + `        },` + `
` + `        INDENT_UNIT,` + `
` + `      );` + `
` + `    } catch {` + `
` + `      return String(safe);` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  const PRETTIFY_XSL = \`<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">` + `
` + `        <xsl:strip-space elements="*" />` + `
` + `        <xsl:template match="para[content-style][not(text())]">` + `
` + `          <xsl:value-of select="normalize-space(.)" />` + `
` + `        </xsl:template>` + `
` + `        <xsl:template match="node()|@*">` + `
` + `          <xsl:copy>` + `
` + `            <xsl:apply-templates select="node()|@*" />` + `
` + `          </xsl:copy>` + `
` + `        </xsl:template>` + `
` + `        <xsl:output indent="yes" />` + `
` + `      </xsl:stylesheet>\`;` + `
` + `` + `
` + `  const _xmlSerializer = new XMLSerializer();` + `
` + `  const _domParser = new DOMParser();` + `
` + `  let _xsltProcessor = null;` + `
` + `` + `
` + `  function getXsltProcessor() {` + `
` + `    if (_xsltProcessor) return _xsltProcessor;` + `
` + `    const xsltDoc = _domParser.parseFromString(PRETTIFY_XSL, "application/xml");` + `
` + `    _xsltProcessor = new XSLTProcessor();` + `
` + `    _xsltProcessor.importStylesheet(xsltDoc);` + `
` + `    return _xsltProcessor;` + `
` + `  }` + `
` + `` + `
` + `  function prettifyXml(sourceXml) {` + `
` + `    if (!sourceXml) return "";` + `
` + `    try {` + `
` + `      const xmlDoc = _domParser.parseFromString(sourceXml, "application/xml");` + `
` + `      const resultDoc = getXsltProcessor().transformToDocument(xmlDoc);` + `
` + `      if (!resultDoc) return sourceXml;` + `
` + `      const resultXml = _xmlSerializer.serializeToString(resultDoc);` + `
` + `` + `
` + `      return resultXml.replace(/&gt;|&lt;/g, (match) =>` + `
` + `        match === "&gt;" ? ">" : "<",` + `
` + `      );` + `
` + `    } catch {` + `
` + `      return sourceXml;` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  return { toJson, prettifyXml };` + `
` + `});` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_dtformat_js;

