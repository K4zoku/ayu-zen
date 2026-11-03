const { Services } = ChromeUtils.importESModule(
  "resource://gre/modules/Services.sys.mjs"
);

const variantPref = "mod.ayu_zen.variant";

const schemePrefs = [
  "zen.view.window.scheme",
  "browser.theme.toolbar-theme",
  "browser.theme.content-theme",
  "layout.css.prefers-color-scheme.content-override",
];

function syncScheme() {
  const variant = Services.prefs.getStringPref(variantPref, "light");

  // 1 = Light, 0 = Dark
  const scheme = variant === "light" || variant === "" ? 1 : 0;

  for (const pref of schemePrefs) {
    if (Services.prefs.getIntPref(pref, 2) !== scheme) {
      Services.prefs.setIntPref(pref, scheme);
    }
  }
}

const observer = {
  observe: syncScheme,
};

Services.prefs.addObserver(variantPref, observer);

syncScheme();

const cleanup = () => {
  Services.prefs.removeObserver(variantPref, observer);
};

if (typeof window.addUnloadListener === "function") {
  window.addUnloadListener(cleanup);
} else {
  window.addEventListener("unload", cleanup, { once: true });
}
