const names = [
  "bg", "surface", "raised", "muted", "fg",
  "accent", "orange", "red", "green", "blue",
];

const palettes = {
  light: [
    "#fafafa", "#e7eaed", "#d8d8d7", "#828c9a", "#5c6166",
    "#f29718", "#fa8532", "#e65050", "#86b300", "#22a4e6",
  ],
  mirage: [
    "#1f2430", "#1a1f29", "#323843", "#565b66", "#cccac2",
    "#ffcc66", "#ffa659", "#ff6666", "#d5ff80", "#73d0ff",
  ],
  dark: [
    "#0f1419", "#131721", "#2d3640", "#5c6773", "#bfbdb6",
    "#e6b450", "#ff8f40", "#d95757", "#aad94c", "#59c2ff",
  ],
  evolve: [
    "#020202", "#0d0d0d", "#2d3640", "#5c6773", "#bfbdb6",
    "#e6b450", "#ff8f40", "#dd3e25", "#aad94c", "#59c2ff",
  ],
};

const sss = Cc["@mozilla.org/content/style-sheet-service;1"]
  .getService(Ci.nsIStyleSheetService);

let currentSheet = null;

function getVariant() {
  const scheme = Services.prefs.getIntPref("zen.view.window.scheme", 2);
  const window = Services.wm.getMostRecentWindow("navigator:browser");

  const dark = scheme === 0 ||
    (scheme === 2 &&
      !!window?.matchMedia("(-moz-system-dark-theme)").matches);

  if (!dark) return "light";

  const variant = Services.prefs.getStringPref(
    "mod.ayu_zen.variant",
    "dark"
  );

  return palettes[variant] && variant !== "light" ? variant : "dark";
}

function update() {
  const variant = getVariant();

  const declarations = names.map(
    (name, i) => `--ayu-${name}: ${palettes[variant][i]};`
  ).join("\n");

  const css = `
    @-moz-document url-prefix("about:") {
      :root {
        ${declarations}
        --ayu-content-accent: var(--ayu-accent);
      }
    }
  `;

  const uri = Services.io.newURI(
    `data:text/css;charset=utf-8,${encodeURIComponent(css)}`
  );

  if (currentSheet?.spec === uri.spec) return;

  if (currentSheet && sss.sheetRegistered(currentSheet, sss.USER_SHEET)) {
    sss.unregisterSheet(currentSheet, sss.USER_SHEET);
  }

  sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
  currentSheet = uri;
}

const observer = { observe: update };

const prefs = [
  "zen.view.window.scheme",
  "mod.ayu_zen.variant",
];

const topics = [
  "look-and-feel-changed",
  "browser-delayed-startup-finished",
];

for (const pref of prefs) {
  Services.prefs.addObserver(pref, observer);
}

for (const topic of topics) {
  Services.obs.addObserver(observer, topic);
}

function cleanup() {
  for (const pref of prefs) {
    Services.prefs.removeObserver(pref, observer);
  }

  for (const topic of topics) {
    Services.obs.removeObserver(observer, topic);
  }

  if (currentSheet && sss.sheetRegistered(currentSheet, sss.USER_SHEET)) {
    sss.unregisterSheet(currentSheet, sss.USER_SHEET);
  }

  currentSheet = null;
}

const manager = ChromeUtils.importESModule(
  "chrome://userscripts/content/core/manager.sys.mjs"
).default;

manager.addUnloadListener(
  "chrome://sine/content/ayu-zen/ayu-content.sys.mjs",
  null,
  cleanup
);

update();
