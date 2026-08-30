
class z2ui5_cl_ui5f_report_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  ["z2ui5/core/Lib", "z2ui5/devtools/Recorder", "z2ui5/devtools/Tabs"],` + `
` + `  (Lib, Recorder, Tabs) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    const MAX_SECTION = 100000;` + `
` + `` + `
` + `    const ABAP_SOURCE_ORDER = 55;` + `
` + `    const ABAP_SOURCE_TITLE = "ABAP SOURCE";` + `
` + `` + `
` + `    function buildExport(abapSource) {` + `
` + `      const sections = [];` + `
` + `      const push = (title, content) => {` + `
` + `        if (!content) return;` + `
` + `        let body = String(content);` + `
` + `        if (body.length > MAX_SECTION) {` + `
` + `          body =` + `
` + `            \`\${body.slice(0, MAX_SECTION)}\\n\\n... [truncated \` +` + `
` + `            \`\${body.length - MAX_SECTION} more characters - open the \` +` + `
` + `            \`\${title} tab for the full content]\`;` + `
` + `        }` + `
` + `        sections.push(\`===== \${title} =====\\n\${body}\`);` + `
` + `      };` + `
` + `` + `
` + `      const entries = Tabs.exportTabs().map((tab) => ({` + `
` + `        order: tab.exportOrder,` + `
` + `        title: Tabs.exportTitle(tab),` + `
` + `` + `
` + `        body: Tabs.render(tab.key),` + `
` + `      }));` + `
` + `      if (abapSource) {` + `
` + `        entries.push({` + `
` + `          order: ABAP_SOURCE_ORDER,` + `
` + `          title: ABAP_SOURCE_TITLE,` + `
` + `          body: abapSource,` + `
` + `        });` + `
` + `      }` + `
` + `      entries.sort((a, b) => a.order - b.order);` + `
` + `      for (const entry of entries) push(entry.title, entry.body);` + `
` + `` + `
` + `      return sections.join("\\n\\n") || "(nothing to export)";` + `
` + `    }` + `
` + `` + `
` + `    function buildMarkdown(abapSource) {` + `
` + `      const plain = buildExport(abapSource);` + `
` + `      const blocks = plain.split(/^===== (.+) =====$/m);` + `
` + `` + `
` + `      const out = ["## abap2UI5 - Developer Tools export", ""];` + `
` + `      for (let i = 1; i < blocks.length; i += 2) {` + `
` + `        const title = blocks[i];` + `
` + `        const body = (blocks[i + 1] || "").trim();` + `
` + `        if (!body) continue;` + `
` + `` + `
` + `        const open = title === "ENVIRONMENT" ? " open" : "";` + `
` + `        const fence = title.includes("SOURCE") ? "abap" : "text";` + `
` + `        out.push(\`<details\${open}>\`);` + `
` + `        out.push(\`<summary>\${title}</summary>\`);` + `
` + `        out.push("");` + `
` + `        out.push(\`\\\`\\\`\\\`\${fence}\`);` + `
` + `        out.push(body);` + `
` + `        out.push("\`\`\`");` + `
` + `        out.push("");` + `
` + `        out.push("</details>");` + `
` + `        out.push("");` + `
` + `      }` + `
` + `      return out.join("\\n");` + `
` + `    }` + `
` + `` + `
` + `    function exportFileName(appName, extension) {` + `
` + `      const stamp = new Date().toISOString().replace(/[:.]/g, "-");` + `
` + `      return \`\${appName || "abap2ui5"}_\${stamp}.\${extension}\`;` + `
` + `    }` + `
` + `` + `
` + `    function downloadText(fileName, content, mimeType) {` + `
` + `      try {` + `
` + `        const blob = new Blob([content], {` + `
` + `          type: \`\${mimeType || "text/plain"};charset=utf-8\`,` + `
` + `        });` + `
` + `        const url = URL.createObjectURL(blob);` + `
` + `        const anchor = document.createElement("a");` + `
` + `        anchor.href = url;` + `
` + `        anchor.download = fileName;` + `
` + `        document.body.appendChild(anchor);` + `
` + `        anchor.click();` + `
` + `        document.body.removeChild(anchor);` + `
` + `` + `
` + `        setTimeout(() => URL.revokeObjectURL(url), 0);` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("DevTools Report: download failed", e);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function confirmOnButton(oButton) {` + `
` + `      const original = oButton.getText();` + `
` + `      oButton.setText("Copied");` + `
` + `      setTimeout(() => {` + `
` + `        if (!Lib.isDestroyed(oButton)) oButton.setText(original);` + `
` + `      }, 1500);` + `
` + `    }` + `
` + `` + `
` + `    function openDialog(appName, abapSource) {` + `
` + `      const text = buildExport(abapSource);` + `
` + `      sap.ui.require(` + `
` + `        ["sap/m/Dialog", "sap/m/TextArea", "sap/m/Button"],` + `
` + `        (Dialog, TextArea, Button) => {` + `
` + `          const area = new TextArea({` + `
` + `            editable: true,` + `
` + `            width: "100%",` + `
` + `            rows: 25,` + `
` + `            growing: false,` + `
` + `          });` + `
` + `` + `
` + `          area.setValue(text);` + `
` + `          const dialog = new Dialog({` + `
` + `            title: "abap2UI5 - Developer Tools Export",` + `
` + `            stretch: true,` + `
` + `            content: [area],` + `
` + `` + `
` + `            buttons: [` + `
` + `              new Button({` + `
` + `                text: "Copy as Markdown",` + `
` + `                type: "Emphasized",` + `
` + `` + `
` + `                press: (oEvent) => {` + `
` + `                  copyMarkdown(abapSource);` + `
` + `                  confirmOnButton(oEvent.getSource());` + `
` + `                },` + `
` + `              }),` + `
` + `              new Button({` + `
` + `                text: "Copy as Text",` + `
` + `                press: (oEvent) => {` + `
` + `                  Lib.copyToClipboard(text);` + `
` + `                  confirmOnButton(oEvent.getSource());` + `
` + `                },` + `
` + `              }),` + `
` + `` + `
` + `              new Button({` + `
` + `                text: "Download Report",` + `
` + `                press: () => downloadText(exportFileName(appName, "txt"), text),` + `
` + `              }),` + `
` + `              new Button({` + `
` + `                text: "Download History (JSON)",` + `
` + `                press: () =>` + `
` + `                  downloadText(` + `
` + `                    exportFileName(appName, "json"),` + `
` + `                    Recorder.exportJson(),` + `
` + `                    "application/json",` + `
` + `                  ),` + `
` + `              }),` + `
` + `              new Button({` + `
` + `                text: "Close",` + `
` + `                press: () => dialog.close(),` + `
` + `              }),` + `
` + `            ],` + `
` + `            afterClose: () => dialog.destroy(),` + `
` + `          });` + `
` + `          dialog.open();` + `
` + `        },` + `
` + `      );` + `
` + `    }` + `
` + `` + `
` + `    function copyMarkdown(abapSource) {` + `
` + `      try {` + `
` + `        Lib.copyToClipboard(buildMarkdown(abapSource));` + `
` + `        return "Bug report copied as Markdown - paste it into a GitHub issue.";` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("DevTools Report: markdown export failed", e);` + `
` + `        return \`Could not build the report: \${e?.message || e}\`;` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    return {` + `
` + `      buildExport,` + `
` + `      buildMarkdown,` + `
` + `      copyMarkdown,` + `
` + `      downloadText,` + `
` + `      exportFileName,` + `
` + `      openDialog,` + `
` + `    };` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_report_js;

