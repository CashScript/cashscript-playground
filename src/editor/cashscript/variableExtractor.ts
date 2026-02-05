export interface ExtractedVariable {
  name: string;
  type: string;
  scope: 'contract' | 'function' | 'local';
  functionName?: string;
}

/**
 * Extracts user-declared variables from CashScript source code.
 * This includes contract parameters, function parameters, and local variable declarations.
 */
export function extractVariables(sourceCode: string): ExtractedVariable[] {
  const variables: ExtractedVariable[] = [];

  // Remove comments to avoid false matches
  const codeWithoutComments = removeComments(sourceCode);

  // Extract contract parameters
  // Pattern: contract ContractName(type1 param1, type2 param2, ...)
  const contractMatch = codeWithoutComments.match(/contract\s+\w+\s*\(([^)]*)\)/);
  if (contractMatch && contractMatch[1]) {
    const params = parseParameters(contractMatch[1]);
    params.forEach(param => {
      variables.push({
        name: param.name,
        type: param.type,
        scope: 'contract',
      });
    });
  }

  // Extract function parameters
  // Pattern: function functionName(type1 param1, type2 param2, ...)
  const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;
  let functionMatch;
  while ((functionMatch = functionRegex.exec(codeWithoutComments)) !== null) {
    const functionName = functionMatch[1];
    const params = parseParameters(functionMatch[2]);
    params.forEach(param => {
      variables.push({
        name: param.name,
        type: param.type,
        scope: 'function',
        functionName,
      });
    });
  }

  // Extract local variable declarations
  // Pattern: type varName = expression;
  // CashScript types: int, bool, string, bytes, bytes1-32, pubkey, sig, datasig
  const typePattern = '(?:int|bool|string|bytes(?:[1-9]|[12][0-9]|3[0-2])?|pubkey|sig|datasig)';
  const localVarRegex = new RegExp(`(${typePattern})\\s+(\\w+)\\s*=`, 'g');
  let localMatch;
  while ((localMatch = localVarRegex.exec(codeWithoutComments)) !== null) {
    const varType = localMatch[1];
    const varName = localMatch[2];
    // Avoid duplicates
    if (!variables.some(v => v.name === varName)) {
      variables.push({
        name: varName,
        type: varType,
        scope: 'local',
      });
    }
  }

  return variables;
}

/**
 * Parses a parameter list string into individual parameters.
 */
function parseParameters(paramString: string): Array<{ name: string; type: string }> {
  const params: Array<{ name: string; type: string }> = [];

  if (!paramString.trim()) {
    return params;
  }

  // Split by comma, handling potential whitespace
  const paramParts = paramString.split(',');

  for (const part of paramParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Pattern: type name (possibly with array brackets)
    // Examples: "int amount", "bytes32 hash", "pubkey[] keys"
    const match = trimmed.match(/^(\w+(?:\[\])?)\s+(\w+)$/);
    if (match) {
      params.push({
        type: match[1],
        name: match[2],
      });
    }
  }

  return params;
}

/**
 * Removes single-line and multi-line comments from the source code.
 */
function removeComments(code: string): string {
  // Remove multi-line comments
  let result = code.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove single-line comments
  result = result.replace(/\/\/.*$/gm, '');
  return result;
}

/**
 * Determines the current function context at a given position.
 * Returns the function name if inside a function, undefined otherwise.
 */
export function getCurrentFunctionContext(sourceCode: string, offset: number): string | undefined {
  const codeBeforeCursor = sourceCode.substring(0, offset);

  // Find all function declarations before the cursor
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{/g;
  let lastFunctionName: string | undefined;
  let lastFunctionStart = -1;
  let match;

  while ((match = functionRegex.exec(codeBeforeCursor)) !== null) {
    lastFunctionName = match[1];
    lastFunctionStart = match.index;
  }

  if (lastFunctionStart === -1) {
    return undefined;
  }

  // Count braces to see if we're still inside the function
  const codeFromFunction = sourceCode.substring(lastFunctionStart, offset);
  let braceCount = 0;
  for (const char of codeFromFunction) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
  }

  // If braces are balanced or we have more opens than closes, we're inside
  return braceCount > 0 ? lastFunctionName : undefined;
}

/**
 * Gets variables available at a specific position in the code.
 * Takes into account the current function scope.
 */
export function getAvailableVariables(
  sourceCode: string,
  offset: number
): ExtractedVariable[] {
  const allVariables = extractVariables(sourceCode);
  const currentFunction = getCurrentFunctionContext(sourceCode, offset);

  return allVariables.filter(variable => {
    // Contract-level variables are always available
    if (variable.scope === 'contract') {
      return true;
    }

    // Function parameters are only available inside their function
    if (variable.scope === 'function') {
      return variable.functionName === currentFunction;
    }

    // For local variables, we'd need more sophisticated analysis
    // For now, include them if they appear before the cursor
    return true;
  });
}
