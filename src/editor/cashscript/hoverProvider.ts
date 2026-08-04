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
  CompletionItemData,
} from './completionData';
import { isAvailableInVersion } from './version';
import { extractVariables, extractGlobalFunctions, ExtractedVariable, ExtractedFunction } from './variableExtractor';

// Build lookup maps for efficient hover lookup. A label can appear multiple
// times with different version ranges (e.g. the pragma snippet per compiler
// version), so each label maps to all its variants and lookups pick the first
// variant available in the selected compiler version.
const hoverDataMap = new Map<string, CompletionItemData[]>();

function buildHoverDataMap(): void {
  const allItems: CompletionItemData[] = [
    ...globalFunctions,
    ...casts,
    ...typeKeywords,
    ...instantiations,
    ...timeUnits,
    ...valueUnits,
    ...keywords,
    ...globalObjects,
    ...bytesMethods,
  ];

  for (const item of allItems) {
    const existing = hoverDataMap.get(item.label);
    if (existing) {
      existing.push(item);
    } else {
      hoverDataMap.set(item.label, [item]);
    }
  }
}

// Build the map once
buildHoverDataMap();

// Returns the hover item for a label that is available in the selected
// compiler version, if any.
function getAvailableHoverItem(label: string): CompletionItemData | undefined {
  const items = hoverDataMap.get(label);
  return items?.find(item => isAvailableInVersion(item.minVersion, item.maxVersion));
}

// Create maps for contextual properties
const txPropertyMap = new Map(txProperties.map(p => [p.label, p]));
const inputPropertyMap = new Map(inputProperties.map(p => [p.label, p]));
const outputPropertyMap = new Map(outputProperties.map(p => [p.label, p]));
const thisPropertyMap = new Map(thisProperties.map(p => [p.label, p]));
const arrayPropertyMap = new Map(arrayProperties.map(p => [p.label, p]));
const consolePropertyMap = new Map(consoleProperties.map(p => [p.label, p]));

export function registerHoverProvider(monaco: typeof Monaco): void {
  monaco.languages.registerHoverProvider(CASHSCRIPT_LANGUAGE_ID, {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (!word) {
        return null;
      }

      const wordText = word.word;
      const lineContent = model.getLineContent(position.lineNumber);
      const lineUntilWord = lineContent.substring(0, word.startColumn - 1);

      // Determine context for property lookups
      const hoverContent = getHoverContent(wordText, lineUntilWord, model.getValue());

      if (!hoverContent) {
        return null;
      }

      return {
        range: new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        ),
        contents: hoverContent,
      };
    },
  });
}

function getHoverContent(
  word: string,
  lineUntilWord: string,
  sourceCode: string
): Monaco.IMarkdownString[] | null {
  // Check for contextual properties first (tx., this., inputs., outputs.)

  // tx.inputs[...].property
  if (/tx\.inputs\s*\[[^\]]*\]\s*\.\s*$/.test(lineUntilWord)) {
    const prop = inputPropertyMap.get(word);
    if (prop) {
      return formatHoverContent(prop);
    }
  }

  // tx.outputs[...].property
  if (/tx\.outputs\s*\[[^\]]*\]\s*\.\s*$/.test(lineUntilWord)) {
    const prop = outputPropertyMap.get(word);
    if (prop) {
      return formatHoverContent(prop);
    }
  }

  // tx.inputs.property / tx.outputs.property (array members, e.g. .length)
  if (/tx\.(?:inputs|outputs)\s*\.\s*$/.test(lineUntilWord)) {
    const prop = arrayPropertyMap.get(word);
    if (prop) {
      return formatHoverContent(prop);
    }
  }

  // tx.property
  if (/\btx\s*\.\s*$/.test(lineUntilWord)) {
    const prop = txPropertyMap.get(word);
    if (prop) {
      return formatHoverContent(prop);
    }
  }

  // this.property
  if (/\bthis\s*\.\s*$/.test(lineUntilWord)) {
    const prop = thisPropertyMap.get(word);
    if (prop) {
      return formatHoverContent(prop);
    }
  }

  // console.member
  if (/\bconsole\s*\.\s*$/.test(lineUntilWord)) {
    const prop = consolePropertyMap.get(word);
    if (prop) {
      return formatHoverContent(prop);
    }
  }

  // bytes methods (after any identifier followed by dot, excluding tx/this/console)
  if (/\b\w+\s*\.\s*$/.test(lineUntilWord) && !/\b(?:tx|this|console)\s*\.\s*$/.test(lineUntilWord)) {
    const method = getAvailableHoverItem(word);
    if (method && (method.kind === 'Method' || method.kind === 'Property')) {
      return formatHoverContent(method);
    }
  }

  // Check for global items (gated by the selected compiler version)
  const globalItem = getAvailableHoverItem(word);
  if (globalItem) {
    return formatHoverContent(globalItem);
  }

  // Fixed-width bytesN types and unsafe_bytesN casts are parameterised by N, so
  // they're kept out of completions to reduce clutter. They're still valid and
  // hoverable, so synthesize a hover for any concrete N here.
  const unsafeBytesNMatch = word.match(/^unsafe_bytes([1-9]|[12][0-9]|3[0-2])$/);
  if (unsafeBytesNMatch && isAvailableInVersion('0.13.0')) {
    const n = unsafeBytesNMatch[1];
    return formatHoverContent({
      label: word,
      kind: 'Function',
      detail: `unsafe_bytes${n}(any v) -> bytes${n}`,
      documentation: `Unsafe cast to a bytes sequence of ${n} bytes. Skips the runtime length check — the caller is responsible for guaranteeing the value is exactly ${n} bytes.`,
    });
  }

  const bytesNMatch = word.match(/^bytes([1-9]|[12][0-9]|3[0-2])$/);
  if (bytesNMatch) {
    return formatHoverContent({
      label: word,
      kind: 'Keyword',
      detail: `Fixed ${bytesNMatch[1]}-byte array`,
      documentation: `Fixed-length ${bytesNMatch[1]}-byte array.`,
    });
  }

  // Check for user-defined global functions (0.14+)
  if (isAvailableInVersion('0.14.0')) {
    const userFunction = extractGlobalFunctions(sourceCode).find(fn => fn.name === word);
    if (userFunction) {
      return formatGlobalFunctionHover(userFunction);
    }
  }

  // Check for user-declared variables
  const variables = extractVariables(sourceCode);
  const userVariable = variables.find(v => v.name === word);
  if (userVariable) {
    return formatVariableHover(userVariable);
  }

  return null;
}

function formatHoverContent(item: CompletionItemData): Monaco.IMarkdownString[] {
  const contents: Monaco.IMarkdownString[] = [];

  // Detail as code block
  if (item.detail) {
    contents.push({
      value: `\`\`\`cashscript\n${item.detail}\n\`\`\``,
    });
  }

  // Documentation as regular text
  if (item.documentation) {
    contents.push({
      value: item.documentation,
    });
  }

  return contents;
}

function formatGlobalFunctionHover(fn: ExtractedFunction): Monaco.IMarkdownString[] {
  const returnsSuffix = fn.returnTypes ? ` returns (${fn.returnTypes})` : '';

  return [
    { value: `\`\`\`cashscript\nfunction ${fn.name}(${fn.parameters})${returnsSuffix}\n\`\`\`` },
    { value: 'User-defined function' },
  ];
}

function formatVariableHover(variable: ExtractedVariable): Monaco.IMarkdownString[] {
  const contents: Monaco.IMarkdownString[] = [];

  let scopeDescription = '';
  if (variable.scope === 'contract') {
    scopeDescription = 'Contract parameter';
  } else if (variable.scope === 'function') {
    scopeDescription = `Parameter of function \`${variable.functionName}\``;
  } else if (variable.scope === 'global') {
    scopeDescription = 'Global constant';
  } else {
    scopeDescription = 'Local variable';
  }

  contents.push({
    value: `\`\`\`cashscript\n${variable.type} ${variable.name}\n\`\`\``,
  });

  contents.push({
    value: scopeDescription,
  });

  return contents;
}
