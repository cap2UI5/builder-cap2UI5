
class z2ui5_cl_ui5f_variants_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(["z2ui5/core/Lib", "z2ui5/core/ViewSlots"], (Lib, ViewSlots) => {` + `
` + `  "use strict";` + `
` + `` + `
` + `  const SMART_VARIANT_INIT_TRIES = 50;` + `
` + `  const SMART_VARIANT_INIT_DELAY = 100;` + `
` + `` + `
` + `  function anchorPersoControl(oSVM, target) {` + `
` + `    if (oSVM._oPersoControl) return;` + `
` + `    if (typeof oSVM.setPersControler === "function") {` + `
` + `      oSVM.setPersControler(target);` + `
` + `    } else {` + `
` + `      oSVM._oPersoControl = target;` + `
` + `    }` + `
` + `  }` + `
` + `` + `
` + `  function ensureInitialised(oSVM, target, attempt, fnCallback) {` + `
` + `    if (Lib.isDestroyed(oSVM)) return;` + `
` + `    const wrapper = oSVM._getControlWrapper` + `
` + `      ? oSVM._getControlWrapper(target)` + `
` + `      : null;` + `
` + `    if (!wrapper) {` + `
` + `      if (attempt < SMART_VARIANT_INIT_TRIES) {` + `
` + `        setTimeout(` + `
` + `          () => ensureInitialised(oSVM, target, attempt + 1, fnCallback),` + `
` + `          SMART_VARIANT_INIT_DELAY,` + `
` + `        );` + `
` + `      }` + `
` + `      return;` + `
` + `    }` + `
` + `    if (wrapper.bInitialized) return;` + `
` + `    oSVM.initialise(fnCallback || (() => {}), target);` + `
` + `  }` + `
` + `` + `
` + `  const activeInits = new Set();` + `
` + `` + `
` + `  function evSmartVariantInit(oController, args) {` + `
` + `    const [, svmId, controlId] = args;` + `
` + `    const key = \`\${svmId}|\${controlId || ""}\`;` + `
` + `    if (activeInits.has(key)) return;` + `
` + `    activeInits.add(key);` + `
` + `    const finish = () => activeInits.delete(key);` + `
` + `    let tries = 0;` + `
` + `    const run = () => {` + `
` + `      if (Lib.isDestroyed(oController)) {` + `
` + `        finish();` + `
` + `        return;` + `
` + `      }` + `
` + `      const oSVM = ViewSlots.resolveById(svmId);` + `
` + `      const control = controlId ? ViewSlots.resolveById(controlId) : null;` + `
` + `      if (!oSVM || (controlId && !control)) {` + `
` + `        if (tries++ < SMART_VARIANT_INIT_TRIES) {` + `
` + `          setTimeout(run, SMART_VARIANT_INIT_DELAY);` + `
` + `          return;` + `
` + `        }` + `
` + `        Lib.logError(` + `
` + `          \`SMART_VARIANT_INIT: '\${controlId ? \`\${svmId}' / '\${controlId}\` : svmId}' not found\`,` + `
` + `        );` + `
` + `        finish();` + `
` + `        return;` + `
` + `      }` + `
` + `      if (Lib.isDestroyed(oSVM) || typeof oSVM.initialise !== "function") {` + `
` + `        Lib.logError(` + `
` + `          \`SMART_VARIANT_INIT: no SmartVariantManagement for id '\${svmId}'\`,` + `
` + `        );` + `
` + `        finish();` + `
` + `        return;` + `
` + `      }` + `
` + `      let target = control;` + `
` + `      if (!target) {` + `
` + `        const registered = oSVM.getPersonalizableControls` + `
` + `          ? oSVM.getPersonalizableControls()` + `
` + `          : [];` + `
` + `        if (!registered.length) {` + `
` + `          if (tries++ < SMART_VARIANT_INIT_TRIES) {` + `
` + `            setTimeout(run, SMART_VARIANT_INIT_DELAY);` + `
` + `            return;` + `
` + `          }` + `
` + `          Lib.logError(` + `
` + `            \`SMART_VARIANT_INIT: no personalizable control registered at '\${svmId}'\`,` + `
` + `          );` + `
` + `          finish();` + `
` + `          return;` + `
` + `        }` + `
` + `        target = ViewSlots.resolveById(registered[0].getControl());` + `
` + `        if (!target) {` + `
` + `          finish();` + `
` + `          return;` + `
` + `        }` + `
` + `      }` + `
` + `      anchorPersoControl(oSVM, target);` + `
` + `      ensureInitialised(oSVM, target, 0);` + `
` + `` + `
` + `      finish();` + `
` + `    };` + `
` + `` + `
` + `    run();` + `
` + `  }` + `
` + `` + `
` + `  const FILTER_BAR_WIRED = "_z2ui5FilterBarVariantWired";` + `
` + `` + `
` + `  function filterItemControl(item) {` + `
` + `    return item && typeof item.getControl === "function"` + `
` + `      ? item.getControl()` + `
` + `      : null;` + `
` + `  }` + `
` + `` + `
` + `  function filterItemValue(item) {` + `
` + `    const control = filterItemControl(item);` + `
` + `    return control && typeof control.getValue === "function"` + `
` + `      ? control.getValue()` + `
` + `      : "";` + `
` + `  }` + `
` + `` + `
` + `  function registerFilterBarCallbacks(oFilterBar) {` + `
` + `    oFilterBar.registerFetchData(() =>` + `
` + `      oFilterBar.getAllFilterItems().map((item) => ({` + `
` + `        groupName: item.getGroupName(),` + `
` + `        fieldName: item.getName(),` + `
` + `        fieldData: filterItemValue(item),` + `
` + `      })),` + `
` + `    );` + `
` + `    oFilterBar.registerApplyData((data) => {` + `
` + `      (data || []).forEach((entry) => {` + `
` + `        const control = oFilterBar.determineControlByName(` + `
` + `          entry.fieldName,` + `
` + `          entry.groupName,` + `
` + `        );` + `
` + `` + `
` + `        if (control && typeof control.setValue === "function") {` + `
` + `          control.setValue(entry.fieldData);` + `
` + `        }` + `
` + `      });` + `
` + `    });` + `
` + `    oFilterBar.registerGetFiltersWithValues(() =>` + `
` + `      oFilterBar` + `
` + `        .getFilterGroupItems()` + `
` + `        .filter((item) => String(filterItemValue(item)).length > 0),` + `
` + `    );` + `
` + `  }` + `
` + `` + `
` + `  function attachFilterBarChange(oSVM, oFilterBar) {` + `
` + `    oFilterBar.getAllFilterItems().forEach((item) => {` + `
` + `      const control = filterItemControl(item);` + `
` + `      if (!control || typeof control.attachChange !== "function") return;` + `
` + `      control.attachChange((oEvent) => {` + `
` + `        if (typeof oSVM.currentVariantSetModified === "function") {` + `
` + `          oSVM.currentVariantSetModified(true);` + `
` + `        }` + `
` + `        if (typeof oFilterBar.fireFilterChange === "function") {` + `
` + `          oFilterBar.fireFilterChange(oEvent);` + `
` + `        }` + `
` + `      });` + `
` + `    });` + `
` + `  }` + `
` + `` + `
` + `  function withPersonalizableInfo(callback) {` + `
` + `    const name = "sap/ui/comp/smartvariants/PersonalizableInfo";` + `
` + `` + `
` + `    if (` + `
` + `      typeof sap === "undefined" ||` + `
` + `      !sap.ui ||` + `
` + `      typeof sap.ui.require !== "function"` + `
` + `    ) {` + `
` + `      Lib.logError("FILTER_BAR_VARIANT_INIT: sap.ui.require not available");` + `
` + `      return;` + `
` + `    }` + `
` + `    const loaded = sap.ui.require(name);` + `
` + `    if (loaded) {` + `
` + `      callback(loaded);` + `
` + `      return;` + `
` + `    }` + `
` + `    sap.ui.require([name], callback, () =>` + `
` + `      Lib.logError(` + `
` + `        "FILTER_BAR_VARIANT_INIT: sap.ui.comp.smartvariants not available",` + `
` + `      ),` + `
` + `    );` + `
` + `  }` + `
` + `` + `
` + `  function evFilterBarVariantInit(oController, args) {` + `
` + `    const [, svmId, filterBarId] = args;` + `
` + `` + `
` + `    const key = \`\${svmId}|\${filterBarId || ""}\`;` + `
` + `    if (activeInits.has(key)) return;` + `
` + `    activeInits.add(key);` + `
` + `    const finish = () => activeInits.delete(key);` + `
` + `    let tries = 0;` + `
` + `    const run = () => {` + `
` + `      if (Lib.isDestroyed(oController)) {` + `
` + `        finish();` + `
` + `        return;` + `
` + `      }` + `
` + `      const oSVM = ViewSlots.resolveById(svmId);` + `
` + `      const oFilterBar = ViewSlots.resolveById(filterBarId);` + `
` + `      if (!oSVM || !oFilterBar) {` + `
` + `        if (tries++ < SMART_VARIANT_INIT_TRIES) {` + `
` + `          setTimeout(run, SMART_VARIANT_INIT_DELAY);` + `
` + `          return;` + `
` + `        }` + `
` + `        Lib.logError(` + `
` + `          \`FILTER_BAR_VARIANT_INIT: '\${svmId}' / '\${filterBarId}' not found\`,` + `
` + `        );` + `
` + `        finish();` + `
` + `        return;` + `
` + `      }` + `
` + `      if (` + `
` + `        Lib.isDestroyed(oSVM) ||` + `
` + `        typeof oSVM.addPersonalizableControl !== "function"` + `
` + `      ) {` + `
` + `        Lib.logError(` + `
` + `          \`FILTER_BAR_VARIANT_INIT: no SmartVariantManagement for id '\${svmId}'\`,` + `
` + `        );` + `
` + `        finish();` + `
` + `        return;` + `
` + `      }` + `
` + `      if (typeof oFilterBar.registerFetchData !== "function") {` + `
` + `        Lib.logError(` + `
` + `          \`FILTER_BAR_VARIANT_INIT: no FilterBar for id '\${filterBarId}'\`,` + `
` + `        );` + `
` + `        finish();` + `
` + `        return;` + `
` + `      }` + `
` + `      if (oFilterBar[FILTER_BAR_WIRED]) {` + `
` + `        finish();` + `
` + `        return;` + `
` + `      }` + `
` + `      oFilterBar[FILTER_BAR_WIRED] = true;` + `
` + `` + `
` + `      finish();` + `
` + `` + `
` + `      registerFilterBarCallbacks(oFilterBar);` + `
` + `      attachFilterBarChange(oSVM, oFilterBar);` + `
` + `      withPersonalizableInfo((PersonalizableInfo) => {` + `
` + `        oSVM.addPersonalizableControl(` + `
` + `          new PersonalizableInfo({` + `
` + `            type: "filterBar",` + `
` + `            keyName: "persistencyKey",` + `
` + `            dataSource: "",` + `
` + `            control: oFilterBar,` + `
` + `          }),` + `
` + `        );` + `
` + `        anchorPersoControl(oSVM, oFilterBar);` + `
` + `` + `
` + `        ensureInitialised(oSVM, oFilterBar, 0, () => {` + `
` + `          if (typeof oSVM.currentVariantSetModified === "function") {` + `
` + `            oSVM.currentVariantSetModified(false);` + `
` + `          }` + `
` + `        });` + `
` + `      });` + `
` + `    };` + `
` + `` + `
` + `    run();` + `
` + `  }` + `
` + `` + `
` + `  const handlers = {` + `
` + `    SMART_VARIANT_INIT: evSmartVariantInit,` + `
` + `    FILTER_BAR_VARIANT_INIT: evFilterBarVariantInit,` + `
` + `  };` + `
` + `` + `
` + `  return { handlers };` + `
` + `});` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_variants_js;

