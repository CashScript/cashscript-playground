// Compiler-version awareness for the CashScript language support.
//
// Monaco providers are registered once and live for the whole session, so we
// keep the selected compiler version in a module-level variable that the
// completion and hover providers read on each invocation. The editor pushes
// updates here via `setCashScriptCompilerVersion` whenever the user switches
// versions, which avoids re-registering providers (Monaco can't cleanly
// unregister them) while still gating version-specific language features.

export type CashScriptVersion = '0.12' | '0.13' | '0.14';

let currentVersion: CashScriptVersion = '0.14';

// Listeners notified when the selected version changes. Used by the highlighting
// layer, which (unlike completions/hover) is registered statically and must be
// re-registered to reflect a new version.
const versionListeners: Array<(version: CashScriptVersion) => void> = [];

export function onCashScriptCompilerVersionChange(
  listener: (version: CashScriptVersion) => void,
): void {
  versionListeners.push(listener);
}

export function setCashScriptCompilerVersion(version: CashScriptVersion): void {
  currentVersion = version;
  for (const listener of versionListeners) listener(version);
}

export function getCashScriptCompilerVersion(): CashScriptVersion {
  return currentVersion;
}

function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

// An item is available when the selected compiler version falls within its
// [minVersion, maxVersion] range. Either bound may be omitted: no minVersion
// means "available since the earliest supported version", no maxVersion means
// "still available in the latest". Items with neither exist in every version.
export function isAvailableInVersion(
  minVersion: string | undefined,
  maxVersion: string | undefined = undefined,
  version: string = currentVersion,
): boolean {
  if (minVersion && compareVersions(version, minVersion) < 0) return false;
  if (maxVersion && compareVersions(version, maxVersion) > 0) return false;
  return true;
}
