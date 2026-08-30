
class z2ui5_cl_ui5f_devtools_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  [` + `
` + `    "z2ui5/core/AppState",` + `
` + `    "z2ui5/core/Lib",` + `
` + `    "z2ui5/devtools/Console",` + `
` + `    "z2ui5/devtools/DeveloperTools",` + `
` + `    "z2ui5/devtools/Picker",` + `
` + `    "z2ui5/devtools/Recorder",` + `
` + `  ],` + `
` + `  (AppState, Lib, Console, DeveloperTools, Picker, Recorder) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    const AUTO_OPEN_PARAM = "z2ui5-devtools";` + `
` + `` + `
` + `    let instance = null;` + `
` + `    let boundKeydown = null;` + `
` + `    let errorDetailsHook = null;` + `
` + `` + `
` + `    function publish(value) {` + `
` + `      AppState.setGlobal("developerTools", value);` + `
` + `    }` + `
` + `` + `
` + `    function get() {` + `
` + `      if (!instance) {` + `
` + `        instance = new DeveloperTools();` + `
` + `        publish(instance);` + `
` + `      }` + `
` + `      return instance;` + `
` + `    }` + `
` + `` + `
` + `    function toggle() {` + `
` + `      get().toggle();` + `
` + `    }` + `
` + `` + `
` + `    function show(tabKey) {` + `
` + `      get().show(tabKey);` + `
` + `    }` + `
` + `` + `
` + `    function searchParams() {` + `
` + `      try {` + `
` + `        return new URLSearchParams(window.location.search);` + `
` + `      } catch {` + `
` + `        return null;` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function isAutoOpenRequested() {` + `
` + `      return Boolean(searchParams()?.has(AUTO_OPEN_PARAM));` + `
` + `    }` + `
` + `` + `
` + `    function autoOpenTab() {` + `
` + `      const value = searchParams()?.get(AUTO_OPEN_PARAM);` + `
` + `      if (value === null || value === undefined) return "";` + `
` + `      const key = value.toUpperCase();` + `
` + `      return key === "1" || key === "X" ? "" : key;` + `
` + `    }` + `
` + `` + `
` + `    function onErrorDetails() {` + `
` + `      const dialog = get();` + `
` + `      dialog.reopenErrorOnClose = true;` + `
` + `      dialog.show("ERROR");` + `
` + `    }` + `
` + `` + `
` + `    function install() {` + `
` + `      if (boundKeydown) return;` + `
` + `` + `
` + `      Recorder.install();` + `
` + `` + `
` + `      Console.install();` + `
` + `` + `
` + `      Console.setOnError(() => {` + `
` + `        if (instance?.oDialog?.isOpen?.()) return;` + `
` + `        show("LOG");` + `
` + `      });` + `
` + `` + `
` + `      errorDetailsHook = onErrorDetails;` + `
` + `      Lib.registerCallback("onErrorDetails", errorDetailsHook);` + `
` + `` + `
` + `      boundKeydown = (event) => {` + `
` + `        if (event.ctrlKey && event.key === "F12") toggle();` + `
` + `      };` + `
` + `      document.addEventListener("keydown", boundKeydown);` + `
` + `` + `
` + `      if (isAutoOpenRequested()) show(autoOpenTab() || undefined);` + `
` + `    }` + `
` + `` + `
` + `    function exit() {` + `
` + `      if (boundKeydown) {` + `
` + `        document.removeEventListener("keydown", boundKeydown);` + `
` + `        boundKeydown = null;` + `
` + `      }` + `
` + `      if (errorDetailsHook) {` + `
` + `        Lib.unregisterCallback("onErrorDetails", errorDetailsHook);` + `
` + `        errorDetailsHook = null;` + `
` + `      }` + `
` + `` + `
` + `      if (instance) {` + `
` + `        instance.destroy();` + `
` + `        instance = null;` + `
` + `      }` + `
` + `      publish(null);` + `
` + `      Console.uninstall();` + `
` + `      Recorder.uninstall();` + `
` + `` + `
` + `      Picker.stop();` + `
` + `    }` + `
` + `` + `
` + `    return {` + `
` + `      install,` + `
` + `      exit,` + `
` + `      toggle,` + `
` + `      show,` + `
` + `      isAutoOpenRequested,` + `
` + `      autoOpenTab,` + `
` + `` + `
` + `      _peek: () => instance,` + `
` + `    };` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_devtools_js;

