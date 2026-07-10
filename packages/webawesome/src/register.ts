/**
 * Cherry-pick imports for common WebAwesome Free components.
 *
 * Each import triggers the custom-element registration as a side-effect.
 * The exported functions are explicit opt-in handles — they are no-ops
 * because the import itself does the work.
 */

// --- Side-effect imports (registers the custom element) -------------------

import "@awesome.me/webawesome/dist/components/alert/alert.js";
import "@awesome.me/webawesome/dist/components/badge/badge.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/card/card.js";
import "@awesome.me/webawesome/dist/components/checkbox/checkbox.js";
import "@awesome.me/webawesome/dist/components/details/details.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/divider/divider.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "@awesome.me/webawesome/dist/components/input/input.js";
import "@awesome.me/webawesome/dist/components/select/select.js";
import "@awesome.me/webawesome/dist/components/spinner/spinner.js";
import "@awesome.me/webawesome/dist/components/switch/switch.js";
import "@awesome.me/webawesome/dist/components/tab/tab.js";
import "@awesome.me/webawesome/dist/components/tab-group/tab-group.js";
import "@awesome.me/webawesome/dist/components/tab-panel/tab-panel.js";
import "@awesome.me/webawesome/dist/components/tooltip/tooltip.js";

// --- Explicit opt-in functions (no-ops; kept for intent clarity) ----------

/** Register all bundled WebAwesome components. */
export function registerAll(): void {
  /* Side-effect imports above have already registered everything. */
}

/** @internal Individual register stubs — use if you prefer granular imports. */
export function registerAlert(): void { /* registered via import */ }
export function registerBadge(): void { /* registered via import */ }
export function registerButton(): void { /* registered via import */ }
export function registerCard(): void { /* registered via import */ }
export function registerCheckbox(): void { /* registered via import */ }
export function registerDetails(): void { /* registered via import */ }
export function registerDialog(): void { /* registered via import */ }
export function registerDivider(): void { /* registered via import */ }
export function registerIcon(): void { /* registered via import */ }
export function registerInput(): void { /* registered via import */ }
export function registerSelect(): void { /* registered via import */ }
export function registerSpinner(): void { /* registered via import */ }
export function registerSwitch(): void { /* registered via import */ }
export function registerTab(): void { /* registered via import */ }
export function registerTabGroup(): void { /* registered via import */ }
export function registerTabPanel(): void { /* registered via import */ }
export function registerTooltip(): void { /* registered via import */ }
