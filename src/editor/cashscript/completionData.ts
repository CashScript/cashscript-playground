import type * as Monaco from 'monaco-editor';

export interface CompletionItemData {
  label: string;
  kind: 'Function' | 'Keyword' | 'Class' | 'Constant' | 'Property' | 'Method' | 'Module' | 'Variable';
  detail: string;
  documentation: string;
  insertText?: string;
  // Compiler version range in which this item is available. minVersion is the
  // version it was introduced; maxVersion is the last version it exists in
  // (e.g. a feature removed in 0.13 would set maxVersion: '0.12.0'). Either
  // bound may be omitted; an item with neither exists in every version.
  minVersion?: string;
  maxVersion?: string;
}

// Global functions
export const globalFunctions: CompletionItemData[] = [
  // Math functions
  {
    label: 'abs',
    kind: 'Function',
    detail: 'abs(int a) -> int',
    documentation: 'Returns the absolute value of the argument.',
    insertText: 'abs(${1:value})',
  },
  {
    label: 'min',
    kind: 'Function',
    detail: 'min(int a, int b) -> int',
    documentation: 'Returns the minimum of two integers.',
    insertText: 'min(${1:a}, ${2:b})',
  },
  {
    label: 'max',
    kind: 'Function',
    detail: 'max(int a, int b) -> int',
    documentation: 'Returns the maximum of two integers.',
    insertText: 'max(${1:a}, ${2:b})',
  },
  {
    label: 'within',
    kind: 'Function',
    detail: 'within(int x, int lower, int upper) -> bool',
    documentation: 'Returns true if x is within the range [lower, upper).',
    insertText: 'within(${1:x}, ${2:lower}, ${3:upper})',
  },
  // Crypto functions
  {
    label: 'checkSig',
    kind: 'Function',
    detail: 'checkSig(sig s, pubkey pk) -> bool',
    documentation: 'Checks that the signature is valid for the current transaction and public key.',
    insertText: 'checkSig(${1:signature}, ${2:publicKey})',
  },
  {
    label: 'checkMultiSig',
    kind: 'Function',
    detail: 'checkMultiSig(sig[] sigs, pubkey[] pks) -> bool',
    documentation: 'Checks that all signatures are valid for the current transaction and respective public keys.',
    insertText: 'checkMultiSig(${1:signatures}, ${2:publicKeys})',
  },
  {
    label: 'checkDataSig',
    kind: 'Function',
    detail: 'checkDataSig(datasig s, bytes msg, pubkey pk) -> bool',
    documentation: 'Checks that the signature is valid for the given message and public key.',
    insertText: 'checkDataSig(${1:signature}, ${2:message}, ${3:publicKey})',
  },
  // Hashing functions
  {
    label: 'ripemd160',
    kind: 'Function',
    detail: 'ripemd160(bytes data) -> bytes20',
    documentation: 'Returns the RIPEMD-160 hash of the input.',
    insertText: 'ripemd160(${1:data})',
  },
  {
    label: 'sha1',
    kind: 'Function',
    detail: 'sha1(bytes data) -> bytes20',
    documentation: 'Returns the SHA-1 hash of the input.',
    insertText: 'sha1(${1:data})',
  },
  {
    label: 'sha256',
    kind: 'Function',
    detail: 'sha256(bytes data) -> bytes32',
    documentation: 'Returns the SHA-256 hash of the input.',
    insertText: 'sha256(${1:data})',
  },
  {
    label: 'hash160',
    kind: 'Function',
    detail: 'hash160(bytes data) -> bytes20',
    documentation: 'Returns the RIPEMD-160 hash of the SHA-256 hash of the input (HASH160).',
    insertText: 'hash160(${1:data})',
  },
  {
    label: 'hash256',
    kind: 'Function',
    detail: 'hash256(bytes data) -> bytes32',
    documentation: 'Returns the double SHA-256 hash of the input (HASH256).',
    insertText: 'hash256(${1:data})',
  },
  // Utility functions
  {
    label: 'toPaddedBytes',
    kind: 'Function',
    detail: 'toPaddedBytes(int value, int size) -> bytes',
    documentation: 'Converts an integer `value` to a bytes sequence of length `size`, padded with zero-bytes. Fails at runtime if the integer does not fit into `size` bytes. (Replaces the old `bytes4(int)` / `bytes(int, 4)` padding casts.)',
    insertText: 'toPaddedBytes(${1:value}, ${2:size})',
    minVersion: '0.13.0',
  },
  {
    label: 'date',
    kind: 'Function',
    detail: 'date(string dateString) -> int',
    documentation: 'Converts a date string (e.g. "2024-01-01T00:00:00") to a Unix timestamp at compile time.',
    insertText: 'date(${1:dateString})',
  },
  // Require
  {
    label: 'require',
    kind: 'Function',
    detail: 'require(bool condition, string debugMessage?)',
    documentation: 'Requires that the condition evaluates to true, failing script execution otherwise. The optional `debugMessage` is surfaced during debug evaluation and has no effect in production.',
    insertText: 'require(${1:condition});',
  },
];

// Semantic-only casts. Available from CashScript 0.13.0 onwards.
export const casts: CompletionItemData[] = [
  {
    label: 'unsafe_int',
    kind: 'Function',
    detail: 'unsafe_int(any v) -> int',
    documentation: 'Unsafe cast to int: reinterprets the value without runtime type enforcement. The caller is responsible for ensuring the value is a valid Script number.',
    insertText: 'unsafe_int(${1:value})',
    minVersion: '0.13.0',
  },
  {
    label: 'unsafe_bool',
    kind: 'Function',
    detail: 'unsafe_bool(any v) -> bool',
    documentation: 'Unsafe cast to bool: reinterprets the value without coercing to 1 / 0. The caller is responsible for ensuring the value is already a valid boolean.',
    insertText: 'unsafe_bool(${1:value})',
    minVersion: '0.13.0',
  },
  {
    label: 'unsafe_byte',
    kind: 'Function',
    detail: 'unsafe_byte(any v) -> bytes1',
    documentation: 'Unsafe cast to a single byte. No runtime length enforcement.',
    insertText: 'unsafe_byte(${1:value})',
    minVersion: '0.13.0',
  },
  {
    label: 'unsafe_bytes',
    kind: 'Function',
    detail: 'unsafe_bytes(any v) -> bytes',
    documentation: 'Unsafe cast to unbounded bytes. No runtime length or type enforcement. Use `unsafe_bytesN` (e.g. `unsafe_bytes4`) to cast to a fixed length. (Replaces the old `bytes4(bytes)` truncation cast.)',
    insertText: 'unsafe_bytes(${1:value})',
    minVersion: '0.13.0',
  },
];

// Type keywords
export const typeKeywords: CompletionItemData[] = [
  {
    label: 'int',
    kind: 'Keyword',
    detail: 'Integer type',
    documentation: 'Signed integer type. Can hold values from -2^63 to 2^63-1.',
  },
  {
    label: 'bool',
    kind: 'Keyword',
    detail: 'Boolean type',
    documentation: 'Boolean type that can be either true or false.',
  },
  {
    label: 'string',
    kind: 'Keyword',
    detail: 'String type',
    documentation: 'UTF-8 encoded string type.',
  },
  {
    label: 'bytes',
    kind: 'Keyword',
    detail: 'Byte array type',
    documentation: 'Variable-length byte array.',
  },
  {
    label: 'byte',
    kind: 'Keyword',
    detail: 'Single-byte array',
    documentation: 'Alias for bytes1, a fixed-length single-byte array.',
  },
  {
    label: 'pubkey',
    kind: 'Keyword',
    detail: 'Public key type',
    documentation: 'A Bitcoin Cash public key (33 bytes compressed).',
  },
  {
    label: 'sig',
    kind: 'Keyword',
    detail: 'Signature type',
    documentation: 'A transaction signature used with checkSig.',
  },
  {
    label: 'datasig',
    kind: 'Keyword',
    detail: 'Data signature type',
    documentation: 'A data signature used with checkDataSig.',
  },
];

// Note: the fixed-width bytesN types (bytes1-bytes32) are intentionally left out
// of completions to avoid cluttering the suggestion list — `bytes` covers the
// common case and bytesN are still highlighted and hoverable (see hoverProvider).

// Instantiation types
export const instantiations: CompletionItemData[] = [
  {
    label: 'LockingBytecodeP2PKH',
    kind: 'Class',
    detail: 'new LockingBytecodeP2PKH(bytes20 pkh)',
    documentation: 'Creates P2PKH locking bytecode from a public key hash.',
    insertText: 'new LockingBytecodeP2PKH(${1:pkh})',
  },
  {
    label: 'LockingBytecodeP2SH20',
    kind: 'Class',
    detail: 'new LockingBytecodeP2SH20(bytes20 scriptHash)',
    documentation: 'Creates P2SH20 locking bytecode from a 20-byte script hash.',
    insertText: 'new LockingBytecodeP2SH20(${1:scriptHash})',
  },
  {
    label: 'LockingBytecodeP2SH32',
    kind: 'Class',
    detail: 'new LockingBytecodeP2SH32(bytes32 scriptHash)',
    documentation: 'Creates P2SH32 locking bytecode from a 32-byte script hash.',
    insertText: 'new LockingBytecodeP2SH32(${1:scriptHash})',
  },
  {
    label: 'LockingBytecodeNullData',
    kind: 'Class',
    detail: 'new LockingBytecodeNullData(bytes[] chunks)',
    documentation: 'Creates OP_RETURN locking bytecode for data storage.',
    insertText: 'new LockingBytecodeNullData([${1:data}])',
  },
];

// Time units
export const timeUnits: CompletionItemData[] = [
  {
    label: 'seconds',
    kind: 'Constant',
    detail: 'Time unit',
    documentation: 'Time unit in seconds. Used with time-based operations.',
  },
  {
    label: 'minutes',
    kind: 'Constant',
    detail: 'Time unit',
    documentation: 'Time unit in minutes (60 seconds).',
  },
  {
    label: 'hours',
    kind: 'Constant',
    detail: 'Time unit',
    documentation: 'Time unit in hours (3600 seconds).',
  },
  {
    label: 'days',
    kind: 'Constant',
    detail: 'Time unit',
    documentation: 'Time unit in days (86400 seconds).',
  },
  {
    label: 'weeks',
    kind: 'Constant',
    detail: 'Time unit',
    documentation: 'Time unit in weeks (604800 seconds).',
  },
];

// Value units
export const valueUnits: CompletionItemData[] = [
  {
    label: 'satoshis',
    kind: 'Constant',
    detail: 'Value unit',
    documentation: 'Base unit of Bitcoin Cash. 1 satoshi = 0.00000001 BCH.',
  },
  {
    label: 'sats',
    kind: 'Constant',
    detail: 'Value unit',
    documentation: 'Alias for satoshis.',
  },
  {
    label: 'finney',
    kind: 'Constant',
    detail: 'Value unit',
    documentation: '1 finney = 10 satoshis.',
  },
  {
    label: 'bits',
    kind: 'Constant',
    detail: 'Value unit',
    documentation: '1 bit = 100 satoshis.',
  },
  {
    label: 'bitcoin',
    kind: 'Constant',
    detail: 'Value unit',
    documentation: '1 bitcoin = 100,000,000 satoshis.',
  },
];

// Keywords
export const keywords: CompletionItemData[] = [
  // The pragma snippet should suggest a version constraint matching the
  // selected compiler, so there is one gated variant per supported compiler.
  {
    label: 'pragma',
    kind: 'Keyword',
    detail: 'Pragma directive',
    documentation: 'Specifies the CashScript version. Example: pragma cashscript ^0.12.0;',
    insertText: 'pragma cashscript ^${1:0.12.0};',
    maxVersion: '0.12',
  },
  {
    label: 'pragma',
    kind: 'Keyword',
    detail: 'Pragma directive',
    documentation: 'Specifies the CashScript version. Example: pragma cashscript ^0.13.0;',
    insertText: 'pragma cashscript ^${1:0.13.0};',
    minVersion: '0.13.0',
    maxVersion: '0.13',
  },
  {
    label: 'pragma',
    kind: 'Keyword',
    detail: 'Pragma directive',
    documentation: 'Specifies the CashScript version. Example: pragma cashscript ^0.14.0;',
    insertText: 'pragma cashscript ^${1:0.14.0};',
    minVersion: '0.14.0',
  },
  {
    label: 'import',
    kind: 'Keyword',
    detail: 'Import directive',
    documentation: 'Imports top-level functions and constants from another CashScript file, making them available as if they were declared locally. Import directives must appear at the top of the file, after any pragma directives. Paths starting with `./`, `../` or `/` are resolved relative to the importing file; bare specifiers (e.g. `"pkg/math.cash"`) are resolved from `node_modules`.',
    insertText: 'import "${1:./file.cash}";',
    minVersion: '0.14.0',
  },
  {
    label: 'contract',
    kind: 'Keyword',
    detail: 'Contract definition',
    documentation: 'Defines a new CashScript contract.',
    insertText: 'contract ${1:ContractName}(${2:params}) {\n\t$0\n}',
  },
  {
    label: 'function',
    kind: 'Keyword',
    detail: 'Function definition',
    documentation: 'Defines a new function within a contract.',
    insertText: 'function ${1:functionName}(${2:params}) {\n\t$0\n}',
  },
  {
    label: 'function',
    kind: 'Keyword',
    detail: 'Global function definition (with return values)',
    documentation: 'Defines a reusable top-level function, declared outside the contract. It can perform `require` checks and return one or more values with a `returns (...)` clause, and can be called from contract functions or other top-level functions.',
    insertText: 'function ${1:functionName}(${2:params}) returns (${3:int}) {\n\treturn $0;\n}',
    minVersion: '0.14.0',
  },
  {
    label: 'if',
    kind: 'Keyword',
    detail: 'Conditional statement',
    documentation: 'Executes code if the condition is true.',
    insertText: 'if (${1:condition}) {\n\t$0\n}',
  },
  {
    label: 'else',
    kind: 'Keyword',
    detail: 'Else clause',
    documentation: 'Executes code if the previous if condition was false.',
    insertText: 'else {\n\t$0\n}',
  },
  {
    label: 'for',
    kind: 'Keyword',
    detail: 'For loop',
    documentation: 'Repeats a block a bounded number of times. Loops must have a compile-time bound.',
    insertText: 'for (int ${1:i} = ${2:0}; ${1:i} < ${3:n}; ${1:i}++) {\n\t$0\n}',
    minVersion: '0.13.0',
  },
  {
    label: 'while',
    kind: 'Keyword',
    detail: 'While loop',
    documentation: 'Repeats a block while the condition holds. Loops must have a compile-time bound.',
    insertText: 'while (${1:condition}) {\n\t$0\n}',
    minVersion: '0.13.0',
  },
  {
    label: 'do',
    kind: 'Keyword',
    detail: 'Do-while loop',
    documentation: 'Repeats a block at least once, then while the condition holds.',
    insertText: 'do {\n\t$0\n} while (${1:condition});',
    minVersion: '0.13.0',
  },
  {
    label: 'constant',
    kind: 'Keyword',
    detail: 'Constant modifier',
    documentation: 'Declares a compile-time constant value. From 0.14 constants can also be declared at the top level of a file (e.g. `int constant FEE = 1000;`) and shared between functions and contracts.',
  },
  {
    label: 'return',
    kind: 'Keyword',
    detail: 'Return statement',
    documentation: 'Returns one or more comma-separated values from a user-defined function. A value-returning function must end with a single `return` statement — early or conditional returns are not allowed.',
    insertText: 'return ${1:value};',
    minVersion: '0.14.0',
  },
  {
    label: 'returns',
    kind: 'Keyword',
    detail: 'Return type declaration',
    documentation: 'Declares the return type(s) of a user-defined function, e.g. `function double(int a) returns (int)`. Multiple return values are declared as `returns (T1, T2, ...)` and destructured at the call site: `int q, int r = divmod(a, b);`.',
    insertText: 'returns (${1:int}) ',
    minVersion: '0.14.0',
  },
  {
    label: 'unused',
    kind: 'Keyword',
    detail: 'Unused modifier',
    documentation: 'Marks a parameter or variable as intentionally unused, suppressing the unused-symbol compiler warning.',
    minVersion: '0.14.0',
  },
  {
    label: 'true',
    kind: 'Constant',
    detail: 'Boolean true',
    documentation: 'Boolean literal representing true.',
  },
  {
    label: 'false',
    kind: 'Constant',
    detail: 'Boolean false',
    documentation: 'Boolean literal representing false.',
  },
];

// tx.* properties
export const txProperties: CompletionItemData[] = [
  {
    label: 'version',
    kind: 'Property',
    detail: 'tx.version -> int',
    documentation: 'The transaction version number.',
  },
  {
    label: 'locktime',
    kind: 'Property',
    detail: 'tx.locktime -> int',
    documentation: 'The transaction locktime value.',
  },
  {
    label: 'inputs',
    kind: 'Property',
    detail: 'tx.inputs -> Input[]',
    documentation: 'Array of all transaction inputs. Access individual inputs with tx.inputs[i].',
  },
  {
    label: 'outputs',
    kind: 'Property',
    detail: 'tx.outputs -> Output[]',
    documentation: 'Array of all transaction outputs. Access individual outputs with tx.outputs[i].',
  },
  {
    label: 'time',
    kind: 'Property',
    detail: 'tx.time -> int',
    documentation: 'The transaction time (block height or Unix timestamp depending on locktime type).',
  },
];

// tx.inputs[i].* properties
export const inputProperties: CompletionItemData[] = [
  {
    label: 'value',
    kind: 'Property',
    detail: 'tx.inputs[i].value -> int',
    documentation: 'The value of the input in satoshis.',
  },
  {
    label: 'lockingBytecode',
    kind: 'Property',
    detail: 'tx.inputs[i].lockingBytecode -> bytes',
    documentation: 'The locking bytecode of the input.',
  },
  {
    label: 'outpointTransactionHash',
    kind: 'Property',
    detail: 'tx.inputs[i].outpointTransactionHash -> bytes32',
    documentation: 'The transaction hash of the outpoint being spent.',
  },
  {
    label: 'outpointIndex',
    kind: 'Property',
    detail: 'tx.inputs[i].outpointIndex -> int',
    documentation: 'The output index of the outpoint being spent.',
  },
  {
    label: 'unlockingBytecode',
    kind: 'Property',
    detail: 'tx.inputs[i].unlockingBytecode -> bytes',
    documentation: 'The unlocking bytecode of the input.',
  },
  {
    label: 'sequenceNumber',
    kind: 'Property',
    detail: 'tx.inputs[i].sequenceNumber -> int',
    documentation: 'The sequence number of the input.',
  },
  {
    label: 'tokenCategory',
    kind: 'Property',
    detail: 'tx.inputs[i].tokenCategory -> bytes32',
    documentation: 'The token category (CashTokens) of the input, or 0x if none.',
  },
  {
    label: 'tokenAmount',
    kind: 'Property',
    detail: 'tx.inputs[i].tokenAmount -> int',
    documentation: 'The fungible token amount of the input.',
  },
  {
    label: 'nftCommitment',
    kind: 'Property',
    detail: 'tx.inputs[i].nftCommitment -> bytes',
    documentation: 'The NFT commitment data of the input.',
  },
];

// tx.outputs[i].* properties
export const outputProperties: CompletionItemData[] = [
  {
    label: 'value',
    kind: 'Property',
    detail: 'tx.outputs[i].value -> int',
    documentation: 'The value of the output in satoshis.',
  },
  {
    label: 'lockingBytecode',
    kind: 'Property',
    detail: 'tx.outputs[i].lockingBytecode -> bytes',
    documentation: 'The locking bytecode of the output.',
  },
  {
    label: 'tokenCategory',
    kind: 'Property',
    detail: 'tx.outputs[i].tokenCategory -> bytes32',
    documentation: 'The token category (CashTokens) of the output, or 0x if none.',
  },
  {
    label: 'tokenAmount',
    kind: 'Property',
    detail: 'tx.outputs[i].tokenAmount -> int',
    documentation: 'The fungible token amount of the output.',
  },
  {
    label: 'nftCommitment',
    kind: 'Property',
    detail: 'tx.outputs[i].nftCommitment -> bytes',
    documentation: 'The NFT commitment data of the output.',
  },
];

// this.* properties
export const thisProperties: CompletionItemData[] = [
  {
    label: 'activeInputIndex',
    kind: 'Property',
    detail: 'this.activeInputIndex -> int',
    documentation: 'The index of the input currently being evaluated.',
  },
  {
    label: 'activeBytecode',
    kind: 'Property',
    detail: 'this.activeBytecode -> bytes',
    documentation: 'The full locking bytecode of the contract.',
  },
  {
    label: 'age',
    kind: 'Property',
    detail: 'this.age -> int',
    documentation: 'Relative age (sequence-number) check. `require(this.age >= N)` enforces that this input is at least `N` blocks or seconds old (BIP68).',
  },
];

// bytes methods
export const bytesMethods: CompletionItemData[] = [
  {
    label: 'split',
    kind: 'Method',
    detail: 'bytes.split(int index) -> bytes, bytes',
    documentation: 'Splits the byte array at the given index, returning two parts.',
    insertText: 'split(${1:index})',
  },
  {
    label: 'reverse',
    kind: 'Method',
    detail: 'bytes.reverse() -> bytes',
    documentation: 'Returns the byte array in reverse order.',
    insertText: 'reverse()',
  },
  {
    label: 'slice',
    kind: 'Method',
    detail: 'bytes.slice(int start, int end) -> bytes',
    documentation: 'Returns a new sequence containing the elements from `start` (inclusive) to `end` (exclusive).',
    insertText: 'slice(${1:start}, ${2:end})',
  },
  {
    label: 'length',
    kind: 'Property',
    detail: 'bytes.length -> int',
    documentation: 'The length of the byte array.',
  },
];

// Properties available on the tx.inputs / tx.outputs arrays themselves.
export const arrayProperties: CompletionItemData[] = [
  {
    label: 'length',
    kind: 'Property',
    detail: 'tx.inputs.length / tx.outputs.length -> int',
    documentation: 'The number of inputs or outputs in the current transaction.',
  },
];

// console.* members (debug-only, no effect in production).
export const consoleProperties: CompletionItemData[] = [
  {
    label: 'log',
    kind: 'Method',
    detail: 'console.log(...args)',
    documentation: 'Logs primitive data or variable values to the debug console. Has no effect in production.',
    insertText: 'log(${1:args})',
  },
];

// Global objects that trigger dot completion
export const globalObjects: CompletionItemData[] = [
  {
    label: 'tx',
    kind: 'Module',
    detail: 'Transaction introspection',
    documentation: 'Access transaction properties like tx.version, tx.inputs, tx.outputs, etc.',
  },
  {
    label: 'this',
    kind: 'Module',
    detail: 'Contract introspection',
    documentation: 'Access contract properties like this.activeInputIndex and this.activeBytecode.',
  },
  {
    label: 'console',
    kind: 'Module',
    detail: 'Debug logging',
    documentation: 'Debug-only logging. Use console.log(...) to inspect values during evaluation.',
  },
];

// Helper to create Monaco completion items
export function createCompletionItem(
  item: CompletionItemData,
  range: Monaco.IRange,
  monaco: typeof Monaco
): Monaco.languages.CompletionItem {
  const kindMap: Record<string, Monaco.languages.CompletionItemKind> = {
    Function: monaco.languages.CompletionItemKind.Function,
    Keyword: monaco.languages.CompletionItemKind.Keyword,
    Class: monaco.languages.CompletionItemKind.Class,
    Constant: monaco.languages.CompletionItemKind.Constant,
    Property: monaco.languages.CompletionItemKind.Property,
    Method: monaco.languages.CompletionItemKind.Method,
    Module: monaco.languages.CompletionItemKind.Module,
    Variable: monaco.languages.CompletionItemKind.Variable,
  };

  return {
    label: item.label,
    kind: kindMap[item.kind] ?? monaco.languages.CompletionItemKind.Text,
    detail: item.detail,
    documentation: item.documentation,
    insertText: item.insertText ?? item.label,
    insertTextRules: item.insertText?.includes('$')
      ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
      : undefined,
    range,
  };
}
