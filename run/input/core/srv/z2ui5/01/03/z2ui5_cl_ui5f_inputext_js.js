
class z2ui5_cl_ui5f_inputext_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  ["sap/m/Input", "sap/m/InputRenderer", "z2ui5/core/Lib"],` + `
` + `  (Input, InputRenderer, Lib) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    const HTML_MODES = new Set([` + `
` + `      "decimal",` + `
` + `      "email",` + `
` + `      "none",` + `
` + `      "numeric",` + `
` + `      "search",` + `
` + `      "tel",` + `
` + `      "text",` + `
` + `      "url",` + `
` + `    ]);` + `
` + `` + `
` + `    return Input.extend("z2ui5.cc.InputExt", {` + `
` + `      metadata: {` + `
` + `        properties: {` + `
` + `          inputMode: {` + `
` + `            type: "string",` + `
` + `            defaultValue: "",` + `
` + `          },` + `
` + `        },` + `
` + `      },` + `
` + `` + `
` + `      setInputMode(val) {` + `
` + `        this.setProperty("inputMode", val, true);` + `
` + `        this._applyInputMode();` + `
` + `        return this;` + `
` + `      },` + `
` + `` + `
` + `      onAfterRendering(...args) {` + `
` + `        Input.prototype.onAfterRendering.apply(this, args);` + `
` + `` + `
` + `        const dom = this.getFocusDomRef();` + `
` + `        this._renderedMode = dom ? dom.getAttribute("inputmode") : null;` + `
` + `        this._applyInputMode();` + `
` + `      },` + `
` + `` + `
` + `      _htmlMode() {` + `
` + `        const raw = this.getInputMode();` + `
` + `        if (!raw) return "";` + `
` + `` + `
` + `        const mode = String(raw).trim().toLowerCase();` + `
` + `        if (HTML_MODES.has(mode)) return mode;` + `
` + `` + `
` + `        if (this._refusedMode !== mode) {` + `
` + `          this._refusedMode = mode;` + `
` + `          Lib.logError(` + `
` + `            \`InputExt: inputMode "\${raw}" is not an HTML inputmode keyword - \` +` + `
` + `              \`ignored\`,` + `
` + `          );` + `
` + `        }` + `
` + `        return "";` + `
` + `      },` + `
` + `` + `
` + `      _applyInputMode() {` + `
` + `        const dom = this.getFocusDomRef();` + `
` + `        if (!dom) return;` + `
` + `        const mode = this._htmlMode();` + `
` + `        if (mode) {` + `
` + `          dom.setAttribute("inputmode", mode);` + `
` + `        } else if (this._renderedMode) {` + `
` + `          dom.setAttribute("inputmode", this._renderedMode);` + `
` + `        } else {` + `
` + `          dom.removeAttribute("inputmode");` + `
` + `        }` + `
` + `      },` + `
` + `` + `
` + `      renderer: InputRenderer,` + `
` + `    });` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_inputext_js;

