export type StudioView = "playground" | "components" | "field" | "layout" | "contracts";
export type StudioState = {
  view: StudioView;
  selected: string;
  value: number;
  offsetX: number;
  offsetY: number;
  width: number;
  invert: boolean;
  grid: boolean;
  safe: boolean;
  inventory: boolean;
  wireframe: boolean;
  paused: boolean;
  category: string;
  search: string;
  profile: string;
  scale: "contain" | "cover" | "native" | "stretch" | "integer";
  zoom: number;
  dpr: number;
  format: string;
  text: string;
  contract: string;
};

const views: Array<[StudioView, string, string, string]> = [
  [
    "playground",
    "Playground",
    "The HUD in context.",
    "Select a group, change its state, and inspect the result in the scene.",
  ],
  [
    "components",
    "Components",
    "One shared language.",
    "Twelve live specimens. The same primitives, states, and monochrome tokens.",
  ],
  [
    "field",
    "In game",
    "Find your way through.",
    "WASD move · Q / E turn · Shift sprint · 1–6 equipment · B inventory · Esc release mouse",
  ],
  [
    "layout",
    "Scale & type",
    "Logical units. Real pixels.",
    "Compare UI and pixel text at a 640 × 360 reference resolution.",
  ],
  [
    "contracts",
    "Render contracts",
    "Make the contract visible.",
    "Inspect actual Three.js output. Captures and queue data come from this running renderer.",
  ],
];

export function createStudioShell() {
  const state: StudioState = {
    view: "playground",
    selected: "health",
    value: 86,
    offsetX: 0,
    offsetY: 0,
    width: 220,
    invert: false,
    grid: false,
    safe: false,
    inventory: false,
    wireframe: false,
    paused: true,
    category: "all",
    search: "",
    profile: "ready",
    scale: "contain",
    zoom: 1,
    dpr: Math.min(devicePixelRatio, 2),
    format: "landscape",
    text: "SIGNAL / 0123456789",
    contract: "order",
  };
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <header class="masthead"><a class="brand" href="#playground"><span class="brand-mark">◇</span> three hud <small>/ LAB</small></a>
      <nav aria-label="Laboratories">${views.map(([id, name]) => `<button data-view="${id}">${name}</button>`).join("")}</nav>
      <select id="mobile-view" aria-label="View">${views.map(([id, name]) => `<option value="${id}">${name}</option>`).join("")}</select><button id="toggle-controls" aria-expanded="false" aria-controls="controls-panel">Controls</button></header>
    <div class="workspace">
      <main class="workbench">
        <div class="toolbar"><label class="compact-select" data-section="components">Category<select id="compact-category" aria-label="Category"><option value="all">all</option><option value="vitals">vitals</option><option value="inventory">inventory</option><option value="navigation">navigation</option><option value="content">content</option></select></label><label class="compact-select" data-section="contracts">Contract<select id="compact-contract" aria-label="Contract"><option value="order">order</option><option value="clip">clip</option><option value="alpha">alpha</option><option value="dpr">dpr</option><option value="time">time</option><option value="texture">texture</option></select></label><h1 id="view-title"></h1><label data-section="components" class="search-label"><span class="sr-only">Search components</span><input id="component-search" type="search" placeholder="Find a component…"></label><span id="component-count" data-section="components">12 / 12</span>
          <div class="toolbar-actions" data-section="playground field"><button id="pause">▷ Continue</button><button id="reset">↺ Reset</button></div></div>
        <div class="viewport-card"><div id="surface-slot"></div></div>
      </main>
      <aside class="inspector" id="controls-panel" aria-label="Controls" hidden>
        <div class="inspector-title"><strong>Controls</strong><button id="close-controls" aria-label="Close controls">×</button></div>
        <section data-section="playground field"><div class="state-buttons">${[
          ["health", "Integrity"],
          ["equipment", "Equipment"],
          ["map", "Minimap"],
          ["crosshair", "Reticle"],
        ]
          .map(([id, name]) => `<button data-node="${id}">${name}</button>`)
          .join("")}</div>
        <label class="toggle"><input id="wireframe" type="checkbox"> Wireframe world</label></section>
        <div class="event-actions" data-section="playground field"><button id="damage"><b>− Receive damage</b><small>−23 integrity</small></button><button id="heal"><b>+ Restore health</b><small>+25 integrity</small></button><button id="ability"><b>◇ Use ability</b><small>5 second cooldown</small></button></div>
        <section data-section="playground field"><p class="eyebrow">NODE</p><h2 id="selected-node">health</h2><p class="quiet" id="property-help">Position and width edit the integrity block.</p>
          <label>Integrity <output id="value-output">86%</output><input id="value" type="range" min="0" max="100" value="86"></label>
          <div id="transform-fields"><h3>Position & size · integrity</h3><div class="field-pair"><label>Offset X<input id="offsetX" type="number" min="-200" max="200" value="0"></label><label>Offset Y<input id="offsetY" type="number" min="-200" max="200" value="0"></label></div><label>Logical width<input id="width" type="number" min="100" max="360" value="220"></label></div>
        </section>
        <section data-section="components"><p class="eyebrow">SPECIMEN STATE</p><div class="state-buttons">${["ready", "damage", "cooldown", "disabled"].map((id) => `<button data-profile="${id}">${id}</button>`).join("")}</div><label>Value<input id="specimen-value" type="range" min="0" max="100" value="86"></label><p class="quiet">States apply where they have meaning. Navigation remains directional.</p></section>
        <section data-section="layout contracts"><h3>Surface & scaling</h3><label>Scale mode<select id="scale" aria-label="Scale mode">${["contain", "cover", "native", "stretch", "integer"].map((id) => `<option>${id}</option>`).join("")}</select></label><label>HUD zoom<input id="zoom" aria-label="HUD zoom" type="range" min="0.5" max="2" step="0.1" value="1"></label><label>Renderer DPR<select id="dpr" aria-label="Renderer DPR">${[1, 1.5, 2, 3].map((n) => `<option${n === state.dpr ? " selected" : ""}>${n}</option>`).join("")}</select></label><label>Format<select id="format" aria-label="Format"><option>landscape</option><option>portrait</option><option>square</option></select></label></section>
        <section data-section="layout"><label>Text sample<input id="text" aria-label="Text sample" maxlength="40" value="SIGNAL / 0123456789"></label><p class="quiet">UI and pixel use the package's built-in ASCII atlas. No external fonts or Windfoil claim.</p></section>
        <section><h3>Appearance</h3><label class="toggle"><input id="invert" type="checkbox"> Invert monochrome HUD</label><label class="toggle"><input id="safe" type="checkbox"> Safe area</label><label class="toggle"><input id="grid" type="checkbox"> Reference grid</label><label class="toggle" data-section="playground field"><input id="inventory" type="checkbox"> Inventory panel</label></section>
        <details><summary>Renderer diagnostics</summary><pre id="renderer-info">Initializing…</pre><div id="status-slot"></div></details>
        <section data-section="contracts"><button id="export-contracts">↓ Export contract evidence</button><pre id="contract-result">Select a contract.</pre></section>
        <details data-section="playground"><summary>Preset</summary><button id="export-preset">↓ Export preset</button><pre id="preset-preview"></pre><label class="import-label">↑ Import preset<input id="import-preset" type="file" accept="application/json,.json"></label><p id="import-result" role="status"></p></details>
      <details><summary>Help</summary><p id="view-description" class="quiet"></p><p id="lab-note" class="quiet"></p></details><button id="capture">↓ PNG</button></aside></div>`,
  );
  const app = document.querySelector<HTMLElement>("#app")!;
  document.querySelector("#surface-slot")!.append(app);
  document.querySelector("#status-slot")!.append(document.querySelector("#status")!);
  let change = (_key: string) => {};
  let action = (_name: string) => {};
  const abort = new AbortController();
  const on = (target: EventTarget, type: string, listener: EventListener) =>
    target.addEventListener(type, listener, { signal: abort.signal });
  const input = (id: string) => document.getElementById(id) as HTMLInputElement;
  const controls = document.getElementById("controls-panel")!;
  const controlsToggle = document.getElementById("toggle-controls")!;
  function setControls(open: boolean) {
    controls.hidden = !open;
    controlsToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("controls-open", open);
    change("controls");
    if (!open) controlsToggle.focus();
  }
  on(controlsToggle, "click", () => setControls(controls.hidden === true));
  on(document.getElementById("close-controls")!, "click", () => setControls(false));
  on(document, "keydown", (event) => {
    if ((event as KeyboardEvent).key === "Escape" && !controls.hidden) setControls(false);
  });
  on(input("mobile-view"), "change", () => {
    state.view = input("mobile-view").value as StudioView;
    state.paused = state.view !== "field";
    history.replaceState(null, "", `#${state.view}`);
    update("view");
  });
  function refresh() {
    input("mobile-view").value = state.view;
    document.body.dataset["view"] = state.view;
    const view = views.find(([id]) => id === state.view)!;
    document.getElementById("view-title")!.textContent = view[1];
    document.getElementById("view-description")!.textContent = view[3];
    for (const section of document.querySelectorAll<HTMLElement>("[data-section]"))
      section.hidden = !section.dataset["section"]!.split(" ").includes(state.view);
    for (const [attribute, value] of [
      ["view", state.view],
      ["node", state.selected],
      ["category", state.category],
      ["profile", state.profile],
      ["contract", state.contract],
    ]) {
      for (const button of document.querySelectorAll<HTMLButtonElement>(`[data-${attribute}]`))
        button.setAttribute("aria-pressed", String(button.dataset[attribute!] === value));
    }
    document.getElementById("pause")!.textContent = state.paused ? "▷ Continue" : "Ⅱ Pause";
    document.getElementById("selected-node")!.textContent = state.selected;
    document.getElementById("value-output")!.textContent = `${Math.round(state.value)}%`;
    for (const id of ["value", "specimen-value"]) input(id).value = String(state.value);
    for (const id of ["offsetX", "offsetY", "width"] as const) {
      input(id).value = String(state[id]);
      input(id).disabled = state.selected !== "health";
    }
    for (const id of ["invert", "grid", "safe", "inventory", "wireframe"] as const)
      input(id).checked = state[id];
    document.getElementById("property-help")!.textContent =
      state.selected === "health"
        ? "Position and width edit the integrity block."
        : "Selected in the live HUD. Transform fields apply only to integrity.";
    document.getElementById("preset-preview")!.textContent = JSON.stringify(preset(), null, 2);
    input("compact-category").value = state.category;
    input("compact-contract").value = state.contract;
    app.parentElement!.dataset["format"] =
      state.view === "layout" || state.view === "contracts" ? state.format : "landscape";
  }
  function preset() {
    return {
      schema: "three-hud-playground/v1",
      theme: state.invert ? "mono-light" : "mono-dark",
      health: { value: state.value, x: state.offsetX, y: state.offsetY, width: state.width },
      inventory: state.inventory,
    };
  }
  function update(key: string) {
    refresh();
    change(key);
  }
  for (const [attribute, key] of [
    ["view", "view"],
    ["node", "selected"],
    ["category", "category"],
    ["profile", "profile"],
    ["contract", "contract"],
  ] as const) {
    for (const button of document.querySelectorAll<HTMLButtonElement>(`button[data-${attribute}]`))
      on(button, "click", () => {
        Object.assign(state, { [key]: button.dataset[attribute] });
        if (key === "view") {
          history.replaceState(null, "", `#${state.view}`);
          state.paused = state.view !== "field";
        }
        update(key);
      });
  }
  for (const key of ["invert", "grid", "safe", "inventory", "wireframe"] as const)
    on(input(key), "change", () => {
      state[key] = input(key).checked;
      update(key);
    });
  for (const key of ["value", "offsetX", "offsetY", "width", "zoom", "dpr"] as const)
    on(input(key), "input", () => {
      const field = input(key);
      const value = Number(field.value);
      if (
        !Number.isFinite(value) ||
        (field.min && value < Number(field.min)) ||
        (field.max && value > Number(field.max))
      )
        return;
      state[key] = value;
      update(key);
    });
  on(input("specimen-value"), "input", () => {
    state.value = Number(input("specimen-value").value);
    update("value");
  });
  for (const key of ["category", "contract"] as const)
    on(input(`compact-${key}`), "change", () => {
      state[key] = input(`compact-${key}`).value;
      update(key);
    });
  on(input("component-search"), "input", () => {
    state.search = input("component-search").value;
    update("search");
  });
  for (const key of ["scale", "format", "text"] as const)
    on(input(key), "input", () => {
      Object.assign(state, { [key]: input(key).value });
      update(key);
    });
  on(document.getElementById("pause")!, "click", () => {
    state.paused = !state.paused;
    update("paused");
  });
  for (const name of ["reset", "damage", "heal", "ability", "capture", "export-contracts"])
    on(document.getElementById(name)!, "click", () => action(name));
  on(document.getElementById("export-preset")!, "click", () =>
    download("three-hud-preset.json", JSON.stringify(preset(), null, 2)),
  );
  on(input("import-preset"), "change", () => {
    void (async () => {
      try {
        const file = input("import-preset").files?.[0];
        if (!file) return;
        if (file.size > 8192) throw new Error("Preset must be smaller than 8 KB.");
        const data = JSON.parse(await file.text());
        if (
          data?.schema !== "three-hud-playground/v1" ||
          !["mono-light", "mono-dark"].includes(data.theme) ||
          typeof data.inventory !== "boolean"
        )
          throw new Error("Invalid preset schema.");
        for (const [key, min, max] of [
          ["value", 0, 100],
          ["x", -200, 200],
          ["y", -200, 200],
          ["width", 100, 360],
        ] as const)
          if (
            typeof data.health?.[key] !== "number" ||
            !Number.isFinite(data.health[key]) ||
            data.health[key] < min ||
            data.health[key] > max
          )
            throw new Error(`Invalid health.${key}.`);
        Object.assign(state, {
          value: data.health.value,
          offsetX: data.health.x,
          offsetY: data.health.y,
          width: data.health.width,
          invert: data.theme === "mono-light",
          inventory: data.inventory,
        });
        update("preset");
        document.getElementById("import-result")!.textContent = "Preset imported.";
      } catch (error) {
        document.getElementById("import-result")!.textContent =
          error instanceof Error ? error.message : "Invalid preset.";
      }
    })();
  });
  on(window, "hashchange", () => {
    const view = location.hash.slice(1);
    if (views.some(([id]) => id === view)) {
      state.view = view as StudioView;
      state.paused = view !== "field";
      update("view");
    }
  });
  const hash = location.hash.slice(1);
  if (views.some(([id]) => id === hash)) {
    state.view = hash as StudioView;
    state.paused = state.view !== "field";
  }
  refresh();
  return {
    state,
    refresh,
    connect(onChange: (key: string) => void, onAction: (name: string) => void) {
      change = onChange;
      action = onAction;
      update("view");
    },
    dispose() {
      abort.abort();
    },
  };
}

export function download(name: string, content: string | Blob) {
  const url = URL.createObjectURL(
    typeof content === "string" ? new Blob([content], { type: "application/json" }) : content,
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
