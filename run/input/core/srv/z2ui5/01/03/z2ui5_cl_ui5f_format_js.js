
class z2ui5_cl_ui5f_format_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(["sap/ui/core/IconPool"], (IconPool) => {` + `
` + `  "use strict";` + `
` + `` + `
` + `  function parseYmd(d) {` + `
` + `    return [` + `
` + `      Number(d.slice(0, 4)),` + `
` + `      Number(d.slice(4, 6)) - 1,` + `
` + `      Number(d.slice(6, 8)),` + `
` + `    ];` + `
` + `  }` + `
` + `` + `
` + `  function isNoAbapDate(d) {` + `
` + `    const s = String(d);` + `
` + `    if (!/^\\d{8}$/.test(s)) return true;` + `
` + `` + `
` + `    return (` + `
` + `      Number(s.slice(0, 4)) === 0 ||` + `
` + `      Number(s.slice(4, 6)) === 0 ||` + `
` + `      Number(s.slice(6, 8)) === 0` + `
` + `    );` + `
` + `  }` + `
` + `` + `
` + `  return {` + `
` + `    DateCreateObject(s) {` + `
` + `      if (!s) return null;` + `
` + `      return new Date(s);` + `
` + `    },` + `
` + `    DateAbapDateToDateObject(d) {` + `
` + `      if (isNoAbapDate(d)) return null;` + `
` + `      return new Date(...parseYmd(d));` + `
` + `    },` + `
` + `` + `
` + `    DateAbapDateTimeToDateObject(d, t = "000000") {` + `
` + `      if (isNoAbapDate(d)) return null;` + `
` + `      return new Date(` + `
` + `        ...parseYmd(d),` + `
` + `        Number(t.slice(0, 2)),` + `
` + `        Number(t.slice(2, 4)),` + `
` + `        Number(t.slice(4, 6)),` + `
` + `      );` + `
` + `    },` + `
` + `` + `
` + `    expandInlineIcons(text) {` + `
` + `      if (!text) return "";` + `
` + `      return String(text).replace(` + `
` + `        /%%icon:(sap-icon:\\/\\/[^%]+)%%/g,` + `
` + `        (match, uri) => {` + `
` + `          const info = IconPool.getIconInfo(uri);` + `
` + `          if (!info) return "";` + `
` + `          return \`<span class="sapMMsgStripInlineIcon" style="font-family:'\${info.fontFamily}'">\${info.content}</span>\`;` + `
` + `        },` + `
` + `      );` + `
` + `    },` + `
` + `  };` + `
` + `});` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_format_js;

