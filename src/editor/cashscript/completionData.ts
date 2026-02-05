import type * as Monaco from 'monaco-editor';

export interface CompletionItemData {
  label: string;
  kind: 'Function' | 'Keyword' | 'Class' | 'Constant' | 'Property' | 'Method' | 'Module' | 'Variable';
  detail: string;
  documentation: string;
  insertText?: string;
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
  // Require
  {
    label: 'require',
    kind: 'Function',
    detail: 'require(bool condition)',
    documentation: 'Requires that the condition evaluates to true. If not, the transaction fails.',
    insertText: 'require(${1:condition});',
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
    label: 'bytes20',
    kind: 'Keyword',
    detail: 'Fixed 20-byte array',
    documentation: 'Fixed-length 20-byte array. Commonly used for hash160 outputs.',
  },
  {
    label: 'bytes32',
    kind: 'Keyword',
    detail: 'Fixed 32-byte array',
    documentation: 'Fixed-length 32-byte array. Commonly used for sha256/hash256 outputs.',
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

// Generate bytes1-bytes32
for (let i = 1; i <= 32; i++) {
  if (i !== 20 && i !== 32) { // Skip 20 and 32, already added
    typeKeywords.push({
      label: `bytes${i}`,
      kind: 'Keyword',
      detail: `Fixed ${i}-byte array`,
      documentation: `Fixed-length ${i}-byte array.`,
    });
  }
}

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
  {
    label: 'pragma',
    kind: 'Keyword',
    detail: 'Pragma directive',
    documentation: 'Specifies the CashScript version. Example: pragma cashscript ^0.10.0;',
    insertText: 'pragma cashscript ^${1:0.10.0};',
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
    label: 'constant',
    kind: 'Keyword',
    detail: 'Constant modifier',
    documentation: 'Declares a compile-time constant value.',
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
    label: 'length',
    kind: 'Property',
    detail: 'bytes.length -> int',
    documentation: 'The length of the byte array.',
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
