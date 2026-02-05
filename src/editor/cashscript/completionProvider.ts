import type * as Monaco from 'monaco-editor';
import { CASHSCRIPT_LANGUAGE_ID } from './languageDefinition';
import {
  globalFunctions,
  typeKeywords,
  instantiations,
  timeUnits,
  valueUnits,
  keywords,
  txProperties,
  inputProperties,
  outputProperties,
  thisProperties,
  bytesMethods,
  globalObjects,
  createCompletionItem,
  CompletionItemData,
} from './completionData';
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

      // Standard completions
      const allCompletions: CompletionItemData[] = [
        ...globalFunctions,
        ...typeKeywords,
        ...keywords,
        ...timeUnits,
        ...valueUnits,
        ...globalObjects,
      ];

      for (const item of allCompletions) {
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

  // Check for tx.
  if (/\btx\s*\.\s*\w*$/.test(lineUntilPosition)) {
    return txProperties.map(item => createCompletionItem(item, range, monaco));
  }

  // Check for this.
  if (/\bthis\s*\.\s*\w*$/.test(lineUntilPosition)) {
    return thisProperties.map(item => createCompletionItem(item, range, monaco));
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
