export type SharedContractId =
  | "lifecycle/v0"
  | "tree/v0"
  | "viewport/v0"
  | "layout/v0"
  | "render-command/v0"
  | "font-resource/v0"
  | "glyph-run/v0"
  | "text-backend/v0"
  | "input/v0"
  | "theme/v0"
  | "diagnostics/v0"
  | "testing/v0";

export type ModuleRole =
  | "contract"
  | "core"
  | "viewport"
  | "layout"
  | "render"
  | "text-core"
  | "text-backend"
  | "primitive"
  | "input"
  | "theme"
  | "widget"
  | "diagnostics"
  | "consumer";

export type ModuleContract = Readonly<{
  id: string;
  role: ModuleRole;
  status: "planned" | "experimental" | "active";
  consumes: readonly SharedContractId[];
  provides: readonly SharedContractId[];
  claimAllowed: string;
  claimBlocked: string;
}>;

export const MODULE_CONTRACTS: readonly ModuleContract[] = Object.freeze([
  {
    id: "contracts",
    role: "contract",
    status: "active",
    consumes: [],
    provides: ["lifecycle/v0", "tree/v0", "viewport/v0", "diagnostics/v0"],
    claimAllowed: "Defines stable framework-neutral value and error contracts.",
    claimBlocked: "Must not own Three.js, DOM, GPU, layout, widget, or backend behavior.",
  },
  {
    id: "core",
    role: "core",
    status: "experimental",
    consumes: ["lifecycle/v0", "tree/v0", "diagnostics/v0"],
    provides: ["lifecycle/v0", "tree/v0"],
    claimAllowed: "Owns retained tree and explicit lifecycle state.",
    claimBlocked: "Must not own the host frame loop or select a concrete text backend.",
  },
  {
    id: "viewport",
    role: "viewport",
    status: "experimental",
    consumes: ["viewport/v0", "diagnostics/v0"],
    provides: ["viewport/v0"],
    claimAllowed: "Resolves pure logical, CSS, viewport, and device transforms.",
    claimBlocked: "Must not read browser size or DPR implicitly.",
  },
]);
