
class z2ui5_cl_ui5f_launchpd_js {
  static get() {
    let result = ``;
    result = `sap.ui.define(` + `
` + `  ["sap/m/library", "z2ui5/core/Lib", "z2ui5/core/AppState"],` + `
` + `  (mobileLibrary, Lib, AppState) => {` + `
` + `    "use strict";` + `
` + `` + `
` + `    const _URLHelper = mobileLibrary.URLHelper;` + `
` + `` + `
` + `    function withCrossAppNavigator(callback) {` + `
` + `      const nav = AppState.state.oLaunchpad?.CrossAppNavigator;` + `
` + `      if (!nav) {` + `
` + `        Lib.logError("CrossAppNav: not running inside Launchpad");` + `
` + `        return;` + `
` + `      }` + `
` + `      try {` + `
` + `        callback(nav);` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("CrossAppNav: callback failed", e);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    function evCrossAppNavToPrevApp() {` + `
` + `      withCrossAppNavigator((nav) => nav.backToPreviousApp());` + `
` + `    }` + `
` + `` + `
` + `    function evCrossAppNavToExt(oController, args) {` + `
` + `      withCrossAppNavigator((nav) => {` + `
` + `        const hash =` + `
` + `          nav.hrefForExternal({ target: args[1], params: args[2] }) || "";` + `
` + `        if (args[3] === "EXT") {` + `
` + `          const base = window.location.href.split("#")[0];` + `
` + `          const url = \`\${base}\${hash}\`;` + `
` + `          if (!Lib.isValidRedirectURL(url)) {` + `
` + `            Lib.logError(\`CrossAppNav EXT: unsafe redirect URL '\${url}'\`);` + `
` + `            return;` + `
` + `          }` + `
` + `          _URLHelper.redirect(url, true);` + `
` + `        } else {` + `
` + `          nav.toExternal({ target: { shellHash: hash } });` + `
` + `        }` + `
` + `      });` + `
` + `    }` + `
` + `` + `
` + `    function evSetTitleLaunchpad(oController, args) {` + `
` + `      const title = Lib.toText(args[1]);` + `
` + `      try {` + `
` + `        const shell = AppState.state.oLaunchpad?.ShellUIService;` + `
` + `        if (shell?.setTitle) {` + `
` + `          const result = shell.setTitle(title);` + `
` + `          if (result?.catch) {` + `
` + `            result.catch((e) =>` + `
` + `              Lib.logError(` + `
` + `                "SET_TITLE_LAUNCHPAD: ShellUIService.setTitle failed",` + `
` + `                e,` + `
` + `              ),` + `
` + `            );` + `
` + `          }` + `
` + `        }` + `
` + `      } catch (e) {` + `
` + `        Lib.logError("SET_TITLE_LAUNCHPAD: ShellUIService.setTitle failed", e);` + `
` + `      }` + `
` + `    }` + `
` + `` + `
` + `    const handlers = {` + `
` + `      CROSS_APP_NAV_TO_PREV_APP: evCrossAppNavToPrevApp,` + `
` + `      CROSS_APP_NAV_TO_EXT: evCrossAppNavToExt,` + `
` + `      SET_TITLE_LAUNCHPAD: evSetTitleLaunchpad,` + `
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

module.exports = z2ui5_cl_ui5f_launchpd_js;

