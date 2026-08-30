
class z2ui5_cl_ui5f_session_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(["sap/ui/Device", "z2ui5/core/Lib"], (Device, Lib) => {` + `
` + `  "use strict";` + `
` + `` + `
` + `  let deviceStatic;` + `
` + `  function getDeviceStatic() {` + `
` + `    if (!deviceStatic) {` + `
` + `      deviceStatic = {` + `
` + `        SYSTEM: Lib.deriveSystemType(Device.system),` + `
` + `        BROWSER: {` + `
` + `          NAME: Device.browser.name || "",` + `
` + `          VERSION: String(Device.browser.version || ""),` + `
` + `        },` + `
` + `        OS: {` + `
` + `          NAME: Device.os.name || "",` + `
` + `          VERSION: String(Device.os.version || ""),` + `
` + `        },` + `
` + `        SUPPORT: {` + `
` + `          TOUCH: Device.support.touch || false,` + `
` + `          POINTER: Device.support.pointer || false,` + `
` + `          RETINA: Device.support.retina || false,` + `
` + `        },` + `
` + `      };` + `
` + `    }` + `
` + `    return deviceStatic;` + `
` + `  }` + `
` + `` + `
` + `  function getDeviceLive() {` + `
` + `    return {` + `
` + `      ORIENTATION: Device.orientation.portrait ? "portrait" : "landscape",` + `
` + `      RESIZE: {` + `
` + `        WIDTH: Device.resize.width || window.innerWidth,` + `
` + `        HEIGHT: Device.resize.height || window.innerHeight,` + `
` + `      },` + `
` + `    };` + `
` + `  }` + `
` + `` + `
` + `  let sessionConfigSent = false;` + `
` + `` + `
` + `  let liveSent = "";` + `
` + `` + `
` + `  let pending = null;` + `
` + `` + `
` + `  function config(oConfig, draftId) {` + `
` + `    const live = getDeviceLive();` + `
` + `    const liveKey = JSON.stringify(live);` + `
` + `    if (sessionConfigSent && draftId) {` + `
` + `      if (liveKey === liveSent) {` + `
` + `        pending = null;` + `
` + `        return {};` + `
` + `      }` + `
` + `      pending = { live: liveKey };` + `
` + `      return { S_DEVICE: live };` + `
` + `    }` + `
` + `    pending = { config: Boolean(oConfig?.S_UI5), live: liveKey };` + `
` + `    return {` + `
` + `      S_UI5: oConfig?.S_UI5,` + `
` + `      ComponentData: oConfig?.ComponentData,` + `
` + `      S_DEVICE: { ...getDeviceStatic(), ...live },` + `
` + `    };` + `
` + `  }` + `
` + `` + `
` + `  function takePending() {` + `
` + `    const p = pending;` + `
` + `    pending = null;` + `
` + `    return p;` + `
` + `  }` + `
` + `` + `
` + `  function confirmSent(p) {` + `
` + `    if (!p) return;` + `
` + `    if (p.config) sessionConfigSent = true;` + `
` + `    if (p.live !== undefined) liveSent = p.live;` + `
` + `    if (p.location) locationSent = true;` + `
` + `  }` + `
` + `` + `
` + `  let locationSent = false;` + `
` + `` + `
` + `  function location(draftId, search) {` + `
` + `    if (draftId && locationSent) return null;` + `
` + `` + `
` + `    pending = { ...pending, location: true };` + `
` + `    return {` + `
` + `      ORIGIN: window.location.origin,` + `
` + `      PATHNAME: window.location.pathname,` + `
` + `      SEARCH: search || window.location.search,` + `
` + `    };` + `
` + `  }` + `
` + `` + `
` + `  return { config, takePending, confirmSent, location };` + `
` + `});` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_session_js;

