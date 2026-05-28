import type * as Monaco from 'monaco-editor';
import { registerCashScriptLanguage, applyMonarchForVersion, CASHSCRIPT_LANGUAGE_ID, CASHSCRIPT_THEME_ID } from './languageDefinition';
import { registerCompletionProvider } from './completionProvider';
import { registerHoverProvider } from './hoverProvider';
import { setCashScriptCompilerVersion, onCashScriptCompilerVersionChange } from './version';

export { CASHSCRIPT_LANGUAGE_ID, CASHSCRIPT_THEME_ID, setCashScriptCompilerVersion };
export type { CashScriptVersion } from './version';

/**
 * Sets up the CashScript language support for Monaco editor.
 * This includes:
 * - Language registration with Monarch tokenizer for syntax highlighting
 * - Completion provider with dot-completion support
 * - Hover provider for documentation tooltips
 *
 * @param monaco The Monaco instance from @monaco-editor/react
 */
export function setupCashScriptLanguage(monaco: typeof Monaco): void {
  // Check if already registered to avoid duplicate registration
  const languages = monaco.languages.getLanguages();
  if (languages.some(lang => lang.id === CASHSCRIPT_LANGUAGE_ID)) {
    return;
  }

  // Register language definition and tokenizer
  registerCashScriptLanguage(monaco);

  // Register completion provider
  registerCompletionProvider(monaco);

  // Register hover provider
  registerHoverProvider(monaco);

  // Highlighting is registered statically, so re-tokenize when the selected
  // compiler version changes (completions/hover read the version live and need
  // no re-registration).
  onCashScriptCompilerVersionChange((version) => applyMonarchForVersion(monaco, version));
}
