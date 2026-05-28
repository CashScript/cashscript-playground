import type * as Monaco from 'monaco-editor';
import { CASHSCRIPT_LANGUAGE_ID } from './languageDefinition';
import {
  globalFunctions,
  casts,
  typeKeywords,
  instantiations,
  timeUnits,
  valueUnits,
  keywords,
  txProperties,
  inputProperties,
  outputProperties,
  thisProperties,
  arrayProperties,
  consoleProperties,
  bytesMethods,
  globalObjects,
  createCompletionItem,
  CompletionItemData,
} from './completionData';
import { isAvailableInVersion } from './version';
import { getAvailableVariables, ExtractedVariable } from './variableExtractor';

export function registerCompletionProvider(monaco: typeof Monaco): void {
  monaco.languages.registerCompletionItemProvider(CASHSCRIPT_LANGUAGE_ID, {
    triggerCharacters: ['.', ' '],
    provideCompletionItems: (model, position) => {
      const lineContent = model.getLineContent(position.lineNumber);
      const lineUntilPosition = lineContent.substring(0, position.column - 1);

      // Get the word at cursor position for filtering
      const wordInfo = model.getWordUntilPosition(position);
      const range: Monaco.IRange = {
        startLineNumber: position.lineNumber,
        startColumn: wordInfo.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: wordInfo.endColumn,
      };

      const suggestions: Monaco.languages.CompletionItem[] = [];

      // Check for dot completion
      const dotCompletionResult = handleDotCompletion(lineUntilPosition, range, monaco);
      if (dotCompletionResult) {
        return { suggestions: dotCompletionResult };
      }

      // Check if we're after 'new' keyword
      if (/\bnew\s+$/.test(lineUntilPosition)) {
        return {
          suggestions: instantiations.map(item => createCompletionItem(item, range, monaco)),
        };
      }

      // Standard completions, filtered by the selected compiler version.
      const allCompletions: CompletionItemData[] = [
        ...globalFunctions,
        ...casts,
        ...typeKeywords,
        ...keywords,
        ...timeUnits,
        ...valueUnits,
        ...globalObjects,
      ];

      for (const item of allCompletions) {
        if (!isAvailableInVersion(item.minVersion, item.maxVersion)) continue;
        suggestions.push(createCompletionItem(item, range, monaco));
      }

      // Add user-declared variables
      const sourceCode = model.getValue();
      const offset = model.getOffsetAt(position);
      const userVariables = getAvailableVariables(sourceCode, offset);

      for (const variable of userVariables) {
        suggestions.push(createVariableCompletionItem(variable, range, monaco));
      }

      return { suggestions };
    },
  });
}

/**
 * Handles dot completion for tx., this., tx.inputs[i]., tx.outputs[i]., and bytes methods.
 */
function handleDotCompletion(
  lineUntilPosition: string,
  range: Monaco.IRange,
  monaco: typeof Monaco
): Monaco.languages.CompletionItem[] | null {
  // Check for tx.inputs[...]. or tx.outputs[...]
  if (/tx\.inputs\s*\[[^\]]*\]\s*\.\s*\w*$/.test(lineUntilPosition)) {
    return inputProperties.map(item => createCompletionItem(item, range, monaco));
  }

  if (/tx\.outputs\s*\[[^\]]*\]\s*\.\s*\w*$/.test(lineUntilPosition)) {
    return outputProperties.map(item => createCompletionItem(item, range, monaco));
  }

  // Check for tx.inputs. or tx.outputs. (array members, e.g. .length)
  if (/tx\.(?:inputs|outputs)\s*\.\s*\w*$/.test(lineUntilPosition)) {
    return arrayProperties.map(item => createCompletionItem(item, range, monaco));
  }

  // Check for tx.
  if (/\btx\s*\.\s*\w*$/.test(lineUntilPosition)) {
    return txProperties.map(item => createCompletionItem(item, range, monaco));
  }

  // Check for this.
  if (/\bthis\s*\.\s*\w*$/.test(lineUntilPosition)) {
    return thisProperties.map(item => createCompletionItem(item, range, monaco));
  }

  // Check for console.
  if (/\bconsole\s*\.\s*\w*$/.test(lineUntilPosition)) {
    return consoleProperties.map(item => createCompletionItem(item, range, monaco));
  }

  // Check for bytes methods (identifier followed by dot)
  // This is a heuristic - we show bytes methods after any identifier followed by a dot
  // that doesn't match the above patterns
  if (/\b\w+\s*\.\s*\w*$/.test(lineUntilPosition)) {
    // Don't show bytes methods for known objects
    if (!/\b(?:tx|this)\s*\.\s*\w*$/.test(lineUntilPosition)) {
      return bytesMethods.map(item => createCompletionItem(item, range, monaco));
    }
  }

  return null;
}

/**
 * Creates a completion item for a user-declared variable.
 */
function createVariableCompletionItem(
  variable: ExtractedVariable,
  range: Monaco.IRange,
  monaco: typeof Monaco
): Monaco.languages.CompletionItem {
  let scopeLabel = '';
  if (variable.scope === 'contract') {
    scopeLabel = ' (contract parameter)';
  } else if (variable.scope === 'function') {
    scopeLabel = ` (${variable.functionName} parameter)`;
  } else {
    scopeLabel = ' (local variable)';
  }

  return {
    label: variable.name,
    kind: monaco.languages.CompletionItemKind.Variable,
    detail: `${variable.type} ${variable.name}${scopeLabel}`,
    documentation: `User-declared variable of type ${variable.type}.`,
    insertText: variable.name,
    range,
  };
}
