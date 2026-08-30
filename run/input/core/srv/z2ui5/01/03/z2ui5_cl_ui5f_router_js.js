
class z2ui5_cl_ui5f_router_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  ["sap/ui/core/routing/HashChanger", "z2ui5/core/AppState", "z2ui5/core/Lib"],` + `
` + `  (HashChanger, AppState, Lib) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    const APP_ROUTE_PREFIX = "/app/";` + `
` + `` + `
` + `    const SHELL_SEPARATOR = "&/";` + `
` + `` + `
` + `    let _fnNavigate = null;` + `
` + `    let _boundHashChanged = null;` + `
` + `` + `
` + `    function hashChanger() {` + `
` + `      return HashChanger.getInstance();` + `
` + `    }` + `
` + `` + `
` + `    function splitHash(sHash) {` + `
` + `      const raw = String(sHash || "").replace(/^#/, "");` + `
` + `` + `
` + `      if (!raw || raw.startsWith("/")) return { shell: "", app: raw };` + `
` + `      const i = raw.indexOf(SHELL_SEPARATOR);` + `
` + `      if (i < 0) return { shell: "", app: raw };` + `
` + `      let app = raw.slice(i + SHELL_SEPARATOR.length).replace(/^\\/+/, "");` + `
` + `      if (app) app = \`/\${app}\`;` + `
` + `      return { shell: raw.slice(0, i), app };` + `
` + `    }` + `
` + `` + `
` + `    function appHashOf(sHash) {` + `
` + `      return splitHash(sHash).app;` + `
` + `    }` + `
` + `` + `
` + `    function getHash() {` + `
` + `      const app = appHashOf(hashChanger().getHash());` + `
` + `      return app && !app.startsWith("/") ? \`/\${app}\` : app;` + `
` + `    }` + `
` + `` + `
` + `    function hrefFor(sAppHash) {` + `
` + `      const base = window.location.href.split("#")[0];` + `
` + `      const shell = splitHash(window.location.hash).shell;` + `
` + `      if (!shell) return \`\${base}#\${sAppHash}\`;` + `
` + `` + `
` + `      return \`\${base}#\${shell}\${SHELL_SEPARATOR}\${String(sAppHash).replace(/^\\/+/, "")}\`;` + `
` + `    }` + `
` + `` + `
` + `    function getRawHash() {` + `
` + `      return String(window.location.hash || "").replace(/^#/, "");` + `
` + `    }` + `
` + `` + `
` + `    function patternFor(sClass, sDraftId) {` + `
` + `      const base = \`\${APP_ROUTE_PREFIX}\${sClass}\`;` + `
` + `      return sDraftId ? \`\${base}/\${sDraftId}\` : base;` + `
` + `    }` + `
` + `` + `
` + `    function segmentsOf(sHash) {` + `
` + `      const app = appHashOf(sHash).replace(/^\\/+/, "");` + `
` + `      const marker = "app/";` + `
` + `      if (!app.startsWith(marker)) return null;` + `
` + `` + `
` + `      return app.slice(marker.length).split(/[&?]/)[0].split("/");` + `
` + `    }` + `
` + `` + `
` + `    function parse(sHash) {` + `
` + `      const parts = segmentsOf(sHash);` + `
` + `      if (!parts || !parts[0]) return null;` + `
` + `      return { app: parts[0], draft: parts.length > 1 ? parts[1] : "" };` + `
` + `    }` + `
` + `` + `
` + `    function appOf(sHash) {` + `
` + `      const route = parse(sHash);` + `
` + `      return route ? route.app : "";` + `
` + `    }` + `
` + `` + `
` + `    function draftOf(sHash) {` + `
` + `      const route = parse(sHash);` + `
` + `      return route ? route.draft : "";` + `
` + `    }` + `
` + `` + `
` + `    function navTo(sRoute, bReplace) {` + `
` + `      const sHash = String(sRoute || "").replace(/^\\/+/, "");` + `
` + `      if (bReplace) {` + `
` + `        hashChanger().replaceHash(sHash);` + `
` + `      } else {` + `
` + `        hashChanger().setHash(sHash);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function onHashChanged(sNewHash) {` + `
` + `      const state = AppState.state;` + `
` + `` + `
` + `      if (!state.navRouting) return;` + `
` + `` + `
` + `      const route = parse(sNewHash);` + `
` + `      if (!route) return;` + `
` + `` + `
` + `      if (route.draft) {` + `
` + `        if (route.draft === state.currentDraftId) return;` + `
` + `      } else if (` + `
` + `        route.app.toUpperCase() === String(state.currentApp).toUpperCase()` + `
` + `      ) {` + `
` + `        return;` + `
` + `      }` + `
` + `` + `
` + `      state.navFromHash = true;` + `
` + `      if (_fnNavigate) _fnNavigate();` + `
` + `    }` + `
` + `` + `
` + `    function repointCallerEntry(mOptions, draftForRoute) {` + `
` + `      const state = AppState.state;` + `
` + `      const prevApp = mOptions.navAppCallPrevApp;` + `
` + `      const prevDraft = mOptions.navAppCallPrevId;` + `
` + `      if (!draftForRoute || !prevApp || !prevDraft) return;` + `
` + `      const prevRoute = patternFor(prevApp, prevDraft);` + `
` + `      if (getHash() === prevRoute) return;` + `
` + `` + `
` + `      state.currentDraftId = prevDraft;` + `
` + `      navTo(prevRoute, true);` + `
` + `    }` + `
` + `` + `
` + `    function applyMode(mOptions) {` + `
` + `      if (!mOptions.setNavRouting) return;` + `
` + `      const mode = String(mOptions.setNavRouting).toUpperCase();` + `
` + `      const on = mode === "KEEP" || mode === "FRESH";` + `
` + `      AppState.state.navRouting = on;` + `
` + `      AppState.state.navMode = on ? mode : null;` + `
` + `    }` + `
` + `` + `
` + `    function updateAppRoute(mOptions, ID, app) {` + `
` + `      const state = AppState.state;` + `
` + `` + `
` + `      const draftForRoute = state.navMode === "FRESH" ? null : ID;` + `
` + `` + `
` + `      state.currentApp = app;` + `
` + `      state.currentDraftId = draftForRoute;` + `
` + `` + `
` + `      if (state.navFromHash) {` + `
` + `        state.navFromHash = false;` + `
` + `        return;` + `
` + `      }` + `
` + `      if (mOptions.setPushState) return;` + `
` + `` + `
` + `      const route = patternFor(app, draftForRoute);` + `
` + `      if (mOptions.checkNavAppCall) {` + `
` + `        repointCallerEntry(mOptions, draftForRoute);` + `
` + `        state.currentApp = app;` + `
` + `        state.currentDraftId = draftForRoute;` + `
` + `        navTo(route);` + `
` + `      } else if (getHash() !== route) {` + `
` + `        navTo(route, true);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function sync(mOptions) {` + `
` + `      const ID = mOptions.id;` + `
` + `      try {` + `
` + `        applyMode(mOptions);` + `
` + `` + `
` + `        const state = AppState.state;` + `
` + `        if (state.navRouting) {` + `
` + `          const app = state.oResponse?.APP;` + `
` + `          if (app) updateAppRoute(mOptions, ID, app);` + `
` + `` + `
` + `          if (!mOptions.setPushState) return;` + `
` + `        }` + `
` + `` + `
` + `        if (mOptions.setPushState) {` + `
` + `          const newUrl = \`\${window.location.pathname}\${window.location.search}#\${getRawHash()}\${mOptions.setPushState}\`;` + `
` + `          history.pushState(null, "", newUrl);` + `
` + `` + `
` + `          return;` + `
` + `        }` + `
` + `` + `
` + `        const newHash = mOptions.setAppStateActive` + `
` + `          ? \`/z2ui5-xapp-state=\${ID || ""}\`` + `
` + `          : "";` + `
` + `        navTo(newHash, true);` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("Router.sync: history update failed", e);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function init(fnNavigate) {` + `
` + `      _fnNavigate = fnNavigate;` + `
` + `` + `
` + `      _boundHashChanged = (oEvent) =>` + `
` + `        onHashChanged(oEvent.getParameter("newHash"));` + `
` + `      hashChanger().attachEvent("hashChanged", _boundHashChanged);` + `
` + `` + `
` + `      hashChanger().init();` + `
` + `    }` + `
` + `` + `
` + `    function exit() {` + `
` + `      if (_boundHashChanged) {` + `
` + `        hashChanger().detachEvent("hashChanged", _boundHashChanged);` + `
` + `        _boundHashChanged = null;` + `
` + `      }` + `
` + `      _fnNavigate = null;` + `
` + `    }` + `
` + `` + `
` + `    return {` + `
` + `      init,` + `
` + `      exit,` + `
` + `      splitHash,` + `
` + `      hrefFor,` + `
` + `      patternFor,` + `
` + `      parse,` + `
` + `      appOf,` + `
` + `      draftOf,` + `
` + `      navTo,` + `
` + `      onHashChanged,` + `
` + `      sync,` + `
` + `    };` + `
` + `  },` + `
` + `);` + `
` + `` + `
` + ``;
    return result;
  }
}

module.exports = z2ui5_cl_ui5f_router_js;

