
class z2ui5_cl_ui5f_browser_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  [` + `
` + `    "sap/m/MessageBox",` + `
` + `    "sap/m/library",` + `
` + `    "sap/ui/util/Storage",` + `
` + `    "z2ui5/core/Router",` + `
` + `    "z2ui5/core/Lib",` + `
` + `    "z2ui5/core/AppState",` + `
` + `  ],` + `
` + `  (MessageBox, mobileLibrary, Storage, Router, Lib, AppState) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    const _URLHelper = mobileLibrary.URLHelper;` + `
` + `` + `
` + `    function evClipboardCopy(oController, args) {` + `
` + `      Lib.copyToClipboard(args[1]);` + `
` + `    }` + `
` + `` + `
` + `    function evClipboardAppState() {` + `
` + `      const id = AppState.state.oResponse?.ID || "";` + `
` + `` + `
` + `      Lib.copyToClipboard(Router.hrefFor(\`/z2ui5-xapp-state=\${id}\`));` + `
` + `    }` + `
` + `` + `
` + `    function evDownloadB64File(oController, args) {` + `
` + `      if (!Lib.isSafeDownloadURL(args[1])) {` + `
` + `        Lib.logError("DOWNLOAD_B64_FILE: blocked unsafe URL");` + `
` + `        return;` + `
` + `      }` + `
` + `` + `
` + `      if (` + `
` + `        /^data:(text\\/html|application\\/xhtml|text\\/xml|image\\/svg)/i.test(` + `
` + `          args[1],` + `
` + `        )` + `
` + `      ) {` + `
` + `        Lib.logError("DOWNLOAD_B64_FILE: blocked active data: MIME type");` + `
` + `        return;` + `
` + `      }` + `
` + `      const a = document.createElement("a");` + `
` + `      a.href = args[1];` + `
` + `` + `
` + `      a.download = String(args[2] || "").replace(/[\\\\/:*?"<>|\\x00-\\x1f]/g, "_");` + `
` + `` + `
` + `      document.body.appendChild(a);` + `
` + `      a.click();` + `
` + `      document.body.removeChild(a);` + `
` + `    }` + `
` + `` + `
` + `    function evStoreData(oController, args) {` + `
` + `      const { TYPE, PREFIX, VALUE, KEY } = args[1] ?? {};` + `
` + `      try {` + `
` + `        const storageType = Storage.Type[TYPE] || Storage.Type.session;` + `
` + `        const oStorage = new Storage(storageType, PREFIX);` + `
` + `        if (VALUE === "" || VALUE == null) {` + `
` + `          oStorage.remove(KEY);` + `
` + `        } else {` + `
` + `          oStorage.put(KEY, VALUE);` + `
` + `        }` + `
` + `      } catch (e) {` + `
` + `        Lib.logError(` + `
` + `          \`STORE_DATA: storage operation failed for key '\${KEY}'\`,` + `
` + `          e,` + `
` + `        );` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evLocationReload(oController, args) {` + `
` + `      if (Lib.isValidRedirectURL(args[1])) {` + `
` + `        window.location.href = args[1];` + `
` + `      } else {` + `
` + `        MessageBox.error(` + `
` + `          "Invalid redirect URL. Only relative URLs to the same domain are allowed.",` + `
` + `        );` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evSystemLogout(oController, args) {` + `
` + `      const logoutUrl = args[1] || "/sap/public/bc/icf/logoff";` + `
` + `      try {` + `
` + `        const container = AppState.state.oLaunchpad?.Container;` + `
` + `` + `
` + `        if (container?.logout && args.length <= 1) {` + `
` + `          container.logout();` + `
` + `          return;` + `
` + `        }` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("SYSTEM_LOGOUT: ushell logout failed", e);` + `
` + `      }` + `
` + `      logoutViaBspTerminate(logoutUrl);` + `
` + `    }` + `
` + `` + `
` + `    function logoutViaBspTerminate(logoutUrl) {` + `
` + `      const path = window.location.pathname;` + `
` + `      if (!path.startsWith("/sap/bc/bsp/")) {` + `
` + `        redirectToLogout(logoutUrl);` + `
` + `        return;` + `
` + `      }` + `
` + `` + `
` + `      const bspKill = \`\${path}?sap-sessioncmd=logoff\`;` + `
` + `      let done = false;` + `
` + `      let frame;` + `
` + `      const finish = () => {` + `
` + `        if (done) return;` + `
` + `        done = true;` + `
` + `` + `
` + `        if (frame) {` + `
` + `          try {` + `
` + `            frame.remove();` + `
` + `          } catch {}` + `
` + `          frame = null;` + `
` + `        }` + `
` + `        redirectToLogout(logoutUrl);` + `
` + `      };` + `
` + `      try {` + `
` + `        frame = document.createElement("iframe");` + `
` + `        frame.style.display = "none";` + `
` + `        frame.src = bspKill;` + `
` + `        frame.addEventListener("load", finish);` + `
` + `        document.body.appendChild(frame);` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("SYSTEM_LOGOUT: BSP terminate iframe failed", e);` + `
` + `        finish();` + `
` + `        return;` + `
` + `      }` + `
` + `` + `
` + `      setTimeout(finish, 1500);` + `
` + `    }` + `
` + `` + `
` + `    function redirectToLogout(logoutUrl) {` + `
` + `      if (Lib.isValidRedirectURL(logoutUrl)) {` + `
` + `        window.location.href = logoutUrl;` + `
` + `      } else {` + `
` + `        MessageBox.error(` + `
` + `          "Invalid logout URL. Only relative URLs to the same domain are allowed.",` + `
` + `        );` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evOpenNewTab(oController, args) {` + `
` + `      if (!Lib.isValidRedirectURL(args[1])) {` + `
` + `        MessageBox.error(` + `
` + `          "Invalid URL. Only relative URLs to the same domain are allowed.",` + `
` + `        );` + `
` + `        return;` + `
` + `      }` + `
` + `      const newWindow = window.open(args[1], "_blank");` + `
` + `` + `
` + `      if (newWindow) newWindow.opener = null;` + `
` + `    }` + `
` + `` + `
` + `    function evUrlHelper(oController, args) {` + `
` + `      const params = args[2] ?? {};` + `
` + `` + `
` + `      const hasCrLf = (v) => typeof v === "string" && /[\\r\\n]/.test(v);` + `
` + `      if (Object.values(params).some(hasCrLf)) {` + `
` + `        Lib.logError("URLHELPER: blocked CR/LF in parameters");` + `
` + `        return;` + `
` + `      }` + `
` + `      const actions = {` + `
` + `        REDIRECT: () => {` + `
` + `          if (!Lib.isSafeRedirectProtocol(params.URL)) {` + `
` + `            MessageBox.error(` + `
` + `              "Invalid redirect URL. Only http/https protocols are allowed.",` + `
` + `            );` + `
` + `            return;` + `
` + `          }` + `
` + `          _URLHelper.redirect(params.URL, params.NEW_WINDOW);` + `
` + `        },` + `
` + `        TRIGGER_EMAIL: () =>` + `
` + `          _URLHelper.triggerEmail(` + `
` + `            params.EMAIL,` + `
` + `            params.SUBJECT,` + `
` + `            params.BODY,` + `
` + `            params.CC,` + `
` + `            params.BCC,` + `
` + `            params.NEW_WINDOW,` + `
` + `          ),` + `
` + `        TRIGGER_SMS: () =>` + `
` + `          _URLHelper.triggerSms(params.TEL, params.TEXT, params.NEW_WINDOW),` + `
` + `        TRIGGER_TEL: () => _URLHelper.triggerTel(params.TEL),` + `
` + `      };` + `
` + `      try {` + `
` + `        const fn = actions[args[1]];` + `
` + `        if (fn) fn();` + `
` + `      } catch (e) {` + `
` + `        Lib.logError(\`URLHELPER: '\${args[1]}' failed\`, e);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evSetTitle(oController, args) {` + `
` + `      const title = Lib.toText(args[1]);` + `
` + `      try {` + `
` + `        document.title = title;` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("SET_TITLE: setting document.title failed", e);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evSetFavicon(oController, args) {` + `
` + `      const href = Lib.toText(args[1]);` + `
` + `` + `
` + `      if (!Lib.isSafeDownloadURL(href)) {` + `
` + `        Lib.logError(\`SET_FAVICON: refused unsafe URL "\${href}"\`);` + `
` + `        return;` + `
` + `      }` + `
` + `      try {` + `
` + `        const existing = document.head.querySelector('link[rel~="icon"]');` + `
` + `        if (existing) {` + `
` + `          existing.href = href;` + `
` + `          return;` + `
` + `        }` + `
` + `        const link = document.createElement("link");` + `
` + `        link.rel = "icon";` + `
` + `        link.href = href;` + `
` + `        document.head.appendChild(link);` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("SET_FAVICON: setting the favicon failed", e);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evPlayAudio(oController, args) {` + `
` + `      if (!Lib.isSafeDownloadURL(args[1])) {` + `
` + `        Lib.logError("PLAY_AUDIO: blocked unsafe audio URL");` + `
` + `        return;` + `
` + `      }` + `
` + `      try {` + `
` + `        const playing = new Audio(args[1]).play();` + `
` + `` + `
` + `        if (playing?.catch) {` + `
` + `          playing.catch((e) =>` + `
` + `            Lib.logError(\`PLAY_AUDIO: failed for '\${args[1]}'\`, e),` + `
` + `          );` + `
` + `        }` + `
` + `      } catch (e) {` + `
` + `        Lib.logError(\`PLAY_AUDIO: failed for '\${args[1]}'\`, e);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    const handlers = {` + `
` + `      CLIPBOARD_COPY: evClipboardCopy,` + `
` + `      CLIPBOARD_APP_STATE: evClipboardAppState,` + `
` + `      DOWNLOAD_B64_FILE: evDownloadB64File,` + `
` + `      STORE_DATA: evStoreData,` + `
` + `      LOCATION_RELOAD: evLocationReload,` + `
` + `      SYSTEM_LOGOUT: evSystemLogout,` + `
` + `      OPEN_NEW_TAB: evOpenNewTab,` + `
` + `      URLHELPER: evUrlHelper,` + `
` + `      SET_TITLE: evSetTitle,` + `
` + `      SET_FAVICON: evSetFavicon,` + `
` + `      PLAY_AUDIO: evPlayAudio,` + `
` + `    };` + `
` + `` + `
` + `    return { handlers };` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_browser_js;

