
class z2ui5_cl_ui5f_abapsrc_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  ["z2ui5/core/AppState", "z2ui5/devtools/Inspect"],` + `
` + `  (AppState, Inspect) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    let cache = null;` + `
` + `` + `
` + `    function appName() {` + `
` + `      return AppState.state.responseData?.S_FRONT?.APP || "";` + `
` + `    }` + `
` + `` + `
` + `    function sourceUrl() {` + `
` + `      const name = appName();` + `
` + `      if (!name) return "";` + `
` + `      return \`\${window.location.origin}/sap/bc/adt/oo/classes/\${encodeURIComponent(name)}/source/main\`;` + `
` + `    }` + `
` + `` + `
` + `    function adtUrl() {` + `
` + `      const url = sourceUrl();` + `
` + `      if (!url) return "";` + `
` + `      const event = AppState.state.oBody?.S_FRONT?.EVENT;` + `
` + `      if (!event || cache?.app !== appName() || !cache?.source) return url;` + `
` + `      const lineNumber = Inspect.findEventLine(cache.source, event);` + `
` + `      return lineNumber ? \`\${url}#start=\${lineNumber},1\` : url;` + `
` + `    }` + `
` + `` + `
` + `    function openInAdt() {` + `
` + `      const url = adtUrl();` + `
` + `      if (!url) return;` + `
` + `      window.open(url, "_blank", "noopener,noreferrer");` + `
` + `    }` + `
` + `` + `
` + `    function iframeHtml() {` + `
` + `      const url = sourceUrl();` + `
` + `      if (!url) return "";` + `
` + `      return \`<iframe src="\${url}" style="width:100%;height:85vh;border:none;" />\`;` + `
` + `    }` + `
` + `` + `
` + `    async function fetchSource() {` + `
` + `      const url = sourceUrl();` + `
` + `      if (!url) return "";` + `
` + `      const name = appName();` + `
` + `      if (cache?.app === name) return cache.source;` + `
` + `      let source = "";` + `
` + `      try {` + `
` + `        const response = await fetch(url, {` + `
` + `          headers: { Accept: "text/plain" },` + `
` + `          credentials: "same-origin",` + `
` + `        });` + `
` + `        if (response.ok) source = await response.text();` + `
` + `      } catch {` + `
` + `        source = "";` + `
` + `      }` + `
` + `      cache = { app: name, source };` + `
` + `      return source;` + `
` + `    }` + `
` + `` + `
` + `    return {` + `
` + `      appName,` + `
` + `      sourceUrl,` + `
` + `      adtUrl,` + `
` + `      openInAdt,` + `
` + `      iframeHtml,` + `
` + `      fetchSource,` + `
` + `` + `
` + `      _setCache: (value) => {` + `
` + `        cache = value;` + `
` + `      },` + `
` + `    };` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_abapsrc_js;

