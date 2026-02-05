import type * as Monaco from 'monaco-editor';

export const CASHSCRIPT_LANGUAGE_ID = 'cashscript';

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

export function registerCashScriptLanguage(monaco: typeof Monaco): void {
  // Register the language
  monaco.languages.register({ id: CASHSCRIPT_LANGUAGE_ID });

  // Register the Monarch tokenizer for syntax highlighting
  const monarchLanguage: CashScriptMonarchLanguage = {
    defaultToken: '',
    tokenPostfix: '.cashscript',

    keywords: [
      'pragma', 'cashscript', 'contract', 'function', 'constructor',
      'if', 'else', 'require', 'new', 'constant'
    ],

    typeKeywords: [
      'int', 'bool', 'string', 'pubkey', 'sig', 'datasig',
      'bytes', 'bytes1', 'bytes2', 'bytes3', 'bytes4', 'bytes5', 'bytes6', 'bytes7', 'bytes8',
      'bytes9', 'bytes10', 'bytes11', 'bytes12', 'bytes13', 'bytes14', 'bytes15', 'bytes16',
      'bytes17', 'bytes18', 'bytes19', 'bytes20', 'bytes21', 'bytes22', 'bytes23', 'bytes24',
      'bytes25', 'bytes26', 'bytes27', 'bytes28', 'bytes29', 'bytes30', 'bytes31', 'bytes32'
    ],

    builtinFunctions: [
      // Math functions
      'abs', 'min', 'max', 'within',
      // Crypto functions
      'checkSig', 'checkMultiSig', 'checkDataSig',
      // Hashing functions
      'ripemd160', 'sha1', 'sha256', 'hash160', 'hash256',
      // Introspection
      'tx', 'this'
    ],

    instantiations: [
      'LockingBytecodeP2PKH', 'LockingBytecodeP2SH20', 'LockingBytecodeP2SH32', 'LockingBytecodeNullData'
    ],

    timeUnits: [
      'seconds', 'minutes', 'hours', 'days', 'weeks'
    ],

    valueUnits: [
      'satoshis', 'sats', 'finney', 'bits', 'bitcoin'
    ],

    operators: [
      '=', '>', '<', '!', '~', '?', ':',
      '==', '<=', '>=', '!=', '&&', '||',
      '+', '-', '*', '/', '%', '&', '|', '^'
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
      root: [
        // Pragma
        [/pragma\s+cashscript\s+[^;]+/, 'keyword.pragma'],

        // Identifiers and keywords
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'type',
            '@builtinFunctions': 'predefined',
            '@instantiations': 'type.identifier',
            '@timeUnits': 'constant.numeric',
            '@valueUnits': 'constant.numeric',
            '@default': 'identifier'
          }
        }],

        // Whitespace
        { include: '@whitespace' },

        // Delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': ''
          }
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
        [/[\/*]/, 'comment']
      ],

      string_double: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, 'string', '@pop']
      ],

      string_single: [
        [/[^\\']+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/'/, 'string', '@pop']
      ],
    }
  };
  monaco.languages.setMonarchTokensProvider(CASHSCRIPT_LANGUAGE_ID, monarchLanguage);

  // Set language configuration for bracket matching, auto-closing, etc.
  monaco.languages.setLanguageConfiguration(CASHSCRIPT_LANGUAGE_ID, {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ],
    indentationRules: {
      increaseIndentPattern: /^\s*(?:contract|function|if|else)\b.*\{\s*$/,
      decreaseIndentPattern: /^\s*\}/
    }
  });
}
