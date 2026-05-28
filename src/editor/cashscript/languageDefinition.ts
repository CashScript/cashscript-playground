import type * as Monaco from 'monaco-editor';
import { isAvailableInVersion, getCashScriptCompilerVersion } from './version';

export const CASHSCRIPT_LANGUAGE_ID = 'cashscript';
export const CASHSCRIPT_THEME_ID = 'cashscript-light';

// Extend IMonarchLanguage to include custom token arrays used in tokenizer rules via @name
interface CashScriptMonarchLanguage extends Monaco.languages.IMonarchLanguage {
  keywords: string[];
  typeKeywords: string[];
  builtinFunctions: string[];
  instantiations: string[];
  timeUnits: string[];
  valueUnits: string[];
  operators: string[];
  symbols: RegExp;
  escapes: RegExp;
}

// Builds the Monarch tokenizer for a specific compiler version. Highlighting is
// gated by version the same way completions/hover are: features added in 0.13
// (loops, unsafe casts, toPaddedBytes, and the bitwise-inversion / shift /
// compound-assignment / increment operators) are only highlighted under a 0.13+
// compiler. (bytesN remains a valid type in every version — only its *cast*
// form was removed in 0.13 — so the bytesN tokens are highlighted throughout.)
function buildMonarchLanguage(version: string): CashScriptMonarchLanguage {
  const since013 = isAvailableInVersion('0.13.0', undefined, version);

  return {
    defaultToken: '',
    tokenPostfix: '.cashscript',

    keywords: [
      'pragma', 'cashscript', 'contract', 'function', 'constructor',
      'if', 'else', 'require', 'new', 'constant',
      // Loops (0.13+)
      ...(since013 ? ['for', 'while', 'do'] : []),
    ],

    typeKeywords: [
      'int', 'bool', 'string', 'pubkey', 'sig', 'datasig', 'byte',
      'bytes', 'bytes1', 'bytes2', 'bytes3', 'bytes4', 'bytes5', 'bytes6', 'bytes7', 'bytes8',
      'bytes9', 'bytes10', 'bytes11', 'bytes12', 'bytes13', 'bytes14', 'bytes15', 'bytes16',
      'bytes17', 'bytes18', 'bytes19', 'bytes20', 'bytes21', 'bytes22', 'bytes23', 'bytes24',
      'bytes25', 'bytes26', 'bytes27', 'bytes28', 'bytes29', 'bytes30', 'bytes31', 'bytes32',
    ],

    builtinFunctions: [
      // Math functions
      'abs', 'min', 'max', 'within',
      // Crypto functions
      'checkSig', 'checkMultiSig', 'checkDataSig',
      // Hashing functions
      'ripemd160', 'sha1', 'sha256', 'hash160', 'hash256',
      // Utility functions (date/slice exist pre-0.13)
      'date', 'slice',
      ...(since013 ? ['toPaddedBytes'] : []),
      // Introspection / debug
      'tx', 'this', 'console',
    ],

    instantiations: [
      'LockingBytecodeP2PKH', 'LockingBytecodeP2SH20', 'LockingBytecodeP2SH32', 'LockingBytecodeNullData',
    ],

    timeUnits: [
      'seconds', 'minutes', 'hours', 'days', 'weeks',
    ],

    valueUnits: [
      'satoshis', 'sats', 'finney', 'bits', 'bitcoin',
    ],

    operators: [
      '=', '>', '<', '!', '?', ':',
      '==', '<=', '>=', '!=', '&&', '||',
      '+', '-', '*', '/', '%', '&', '|', '^',
      // Bitwise inversion, shift, compound-assignment and increment/decrement (0.13+)
      ...(since013 ? ['~', '<<', '>>', '+=', '-=', '++', '--'] : []),
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
      root: [
        // Pragma
        [/pragma\s+cashscript\s+[^;]+/, 'keyword.pragma'],

        // Unsafe casts (0.13+), including the variable-length unsafe_bytesN form
        ...(since013
          ? [[/(?:unsafe_int|unsafe_bool|unsafe_byte|unsafe_bytes\d*)\b/, 'type'] as Monaco.languages.IMonarchLanguageRule]
          : []),

        // Identifiers and keywords
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'type',
            '@builtinFunctions': 'predefined',
            '@instantiations': 'type.identifier',
            '@timeUnits': 'constant.numeric',
            '@valueUnits': 'constant.numeric',
            '@default': 'identifier',
          },
        }],

        // Whitespace
        { include: '@whitespace' },

        // Delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': '',
          },
        }],

        // Numbers
        [/0[xX][0-9a-fA-F]+/, 'number.hex'],
        [/\d+/, 'number'],

        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string_double'],
        [/'/, 'string', '@string_single'],

        // Hex literals
        [/0x[0-9a-fA-F]+/, 'number.hex'],
      ],

      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment'],
      ],

      comment: [
        [/[^\/*]+/, 'comment'],
        [/\/\*/, 'comment', '@push'],
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment'],
      ],

      string_double: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, 'string', '@pop'],
      ],

      string_single: [
        [/[^\\']+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/'/, 'string', '@pop'],
      ],
    },
  };
}

// Keep a handle on the active tokens provider so switching compiler versions can
// dispose it and re-register a tokenizer built for the new version.
let tokensProviderDisposable: Monaco.IDisposable | undefined;

// (Re)registers the Monarch tokenizer for the given version. Disposing the
// previous provider first makes Monaco re-tokenize open models with the new
// rules, so highlighting updates immediately on a version switch.
export function applyMonarchForVersion(monaco: typeof Monaco, version: string): void {
  tokensProviderDisposable?.dispose();
  tokensProviderDisposable = monaco.languages.setMonarchTokensProvider(
    CASHSCRIPT_LANGUAGE_ID,
    buildMonarchLanguage(version),
  );
}

export function registerCashScriptLanguage(monaco: typeof Monaco): void {
  // Register the language
  monaco.languages.register({ id: CASHSCRIPT_LANGUAGE_ID });

  // Register the Monarch tokenizer for the currently-selected compiler version
  applyMonarchForVersion(monaco, getCashScriptCompilerVersion());

  // Set language configuration for bracket matching, auto-closing, etc.
  monaco.languages.setLanguageConfiguration(CASHSCRIPT_LANGUAGE_ID, {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    indentationRules: {
      increaseIndentPattern: /^\s*(?:contract|function|if|else|for|while|do)\b.*\{\s*$/,
      decreaseIndentPattern: /^\s*\}/,
    },
  });

  // The built-in light theme leaves several scopes uncoloured (notably built-in
  // functions and operators), so define a theme that colours every scope the
  // tokenizer emits. Based on 'vs' so comments/strings/numbers keep their
  // defaults.
  monaco.editor.defineTheme(CASHSCRIPT_THEME_ID, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0000ff' },        // contract/function/if/require...
      { token: 'type', foreground: '267f99' },            // int/bool/bytes/pubkey/unsafe casts
      { token: 'type.identifier', foreground: '267f99' }, // contract names + LockingBytecode classes
      { token: 'predefined', foreground: '6f42c1' },      // built-in functions (checkSig, abs, tx...)
      { token: 'constant.numeric', foreground: '098658' },// time/value units (sats, days...)
    ],
    colors: {},
  });
}
