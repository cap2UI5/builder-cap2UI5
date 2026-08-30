
class z2ui5_cl_ui5f_liveedit_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  [` + `
` + `    "z2ui5/core/actions/Slots",` + `
` + `    "z2ui5/core/AppState",` + `
` + `    "z2ui5/core/Lib",` + `
` + `    "z2ui5/core/ViewSlots",` + `
` + `  ],` + `
` + `  (Slots, AppState, Lib, ViewSlots) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    const TAB_TO_SLOT = {` + `
` + `      VIEW: "MAIN",` + `
` + `      POPUP: "POPUP",` + `
` + `      POPOVER: "POPOVER",` + `
` + `      NEST1: "NEST",` + `
` + `      NEST2: "NEST2",` + `
` + `    };` + `
` + `` + `
` + `    function slotOfTab(tabKey) {` + `
` + `      return TAB_TO_SLOT[tabKey];` + `
` + `    }` + `
` + `` + `
` + `    function canApply(tabKey) {` + `
` + `      const slotKey = slotOfTab(tabKey);` + `
` + `      if (!slotKey) return false;` + `
` + `      return Boolean(ViewSlots.getView(slotKey));` + `
` + `    }` + `
` + `` + `
` + `    async function apply(tabKey, xml) {` + `
` + `      const slotKey = slotOfTab(tabKey);` + `
` + `      if (!slotKey) return "This tab shows no view slot - nothing to apply.";` + `
` + `      if (!xml || !xml.trim()) return "The editor is empty - nothing to apply.";` + `
` + `` + `
` + `      const oldView = ViewSlots.getView(slotKey);` + `
` + `      if (!oldView) return \`Slot \${slotKey} is not filled - nothing to apply.\`;` + `
` + `      const oldModel = oldView.getModel?.();` + `
` + `      const modelData = oldModel?.getData?.();` + `
` + `` + `
` + `      try {` + `
` + `        const options =` + `
` + `          slotKey === "MAIN" ? AppState.state.lastMainDisplayOptions || {} : {};` + `
` + `        await Slots.action("display", slotKey, xml, options, undefined);` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("DevTools LiveEdit: applying the edited XML failed", e);` + `
` + `        return \`Could not build the view: \${e?.message || e}\`;` + `
` + `      }` + `
` + `` + `
` + `      try {` + `
` + `        const newView = ViewSlots.getView(slotKey);` + `
` + `        const newModel = newView?.getModel?.();` + `
` + `        if (modelData && newModel?.setData && slotKey !== "MAIN") {` + `
` + `          newModel.setData(modelData);` + `
` + `        }` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("DevTools LiveEdit: restoring the model failed", e);` + `
` + `      }` + `
` + `` + `
` + `      return (` + `
` + `        \`Applied to slot \${slotKey}. This is a LOCAL preview - the backend \` +` + `
` + `        \`knows nothing about it, and the next roundtrip replaces it.\`` + `
` + `      );` + `
` + `    }` + `
` + `` + `
` + `    function originalXml(tabKey) {` + `
` + `      const slotKey = slotOfTab(tabKey);` + `
` + `      if (!slotKey) return "";` + `
` + `      return (` + `
` + `        ViewSlots.getView(slotKey)?.mProperties?.viewContent ||` + `
` + `        ViewSlots.getViewXml(slotKey) ||` + `
` + `        ""` + `
` + `      );` + `
` + `    }` + `
` + `` + `
` + `    function isBusy() {` + `
` + `      return Boolean(AppState.state.isBusy);` + `
` + `    }` + `
` + `` + `
` + `    return { apply, canApply, slotOfTab, originalXml, isBusy };` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_liveedit_js;

