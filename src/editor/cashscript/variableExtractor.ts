export interface ExtractedVariable {
  name: string;
  type: string;
  scope: 'contract' | 'function' | 'local' | 'global';
  functionName?: string;
  // Declared with the `unused` modifier (0.14+): the value is dropped right
  // after its declaration and cannot be referenced later.
  unused: boolean;
}

// A user-defined global (top-level) function, introduced in CashScript 0.14.
export interface ExtractedFunction {
  name: string;
  parameters: string;
  returnTypes?: string;
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
        unused: param.unused,
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
        unused: param.unused,
      });
    });
  }

  // Extract local variable declarations and top-level (global) constants
  // Pattern: type [constant|unused] varName = expression;
  // CashScript types: int, bool, string, bytes, bytes1-32, pubkey, sig, datasig
  // Declarations at brace depth 0 are global constants (0.14+); anything deeper
  // is a local variable.
  const typePattern = '(?:int|bool|string|bytes(?:[1-9]|[12][0-9]|3[0-2])?|pubkey|sig|datasig)';
  // Captures the (possibly empty) run of modifiers between a type and a name
  const modifiersPattern = '((?:(?:constant|unused)\\s+)*)';
  const localVarRegex = new RegExp(`(${typePattern})\\s+${modifiersPattern}(\\w+)\\s*=`, 'g');
  let localMatch;
  while ((localMatch = localVarRegex.exec(codeWithoutComments)) !== null) {
    const [, varType, modifiers, varName] = localMatch;
    // Avoid duplicates
    if (!variables.some(v => v.name === varName)) {
      variables.push({
        name: varName,
        type: varType,
        scope: braceDepthAt(codeWithoutComments, localMatch.index) === 0 ? 'global' : 'local',
        unused: hasUnusedModifier(modifiers),
      });
    }
  }

  // Extract declarations made inside tuple assignments, in both the bare and
  // the parenthesised form:
  //   bytes a, bytes b = x.split(2);
  //   (int quotient, int remainder) = divmod(a, b);
  // Since 0.14 a target without a type reassigns an existing variable instead
  // of declaring a new one, and both kinds can be mixed in one assignment
  // (e.g. `(int fresh, current, next) = step(current, next);`). Only the typed
  // targets declare a variable here — untyped ones are picked up at their own
  // declaration. Newly declared targets accept the same modifiers as regular
  // declarations (e.g. `bytes unused ignored, bytes constant tail = x.split(4);`).
  const tupleTargetPattern = `(?:${typePattern}\\s+(?:(?:constant|unused)\\s+)*)?\\w+`;
  const tupleAssignmentRegex = new RegExp(
    // Anchored on a statement boundary so comma-separated *argument* lists
    // (e.g. `f(a, b)`) and parameter lists are not mistaken for targets.
    `(?:^|[;{})])\\s*\\(?\\s*(${tupleTargetPattern}(?:\\s*,\\s*${tupleTargetPattern})+)\\s*\\)?\\s*=(?!=)`,
    'g',
  );
  const declarationTargetRegex = new RegExp(`^(${typePattern})\\s+${modifiersPattern}(\\w+)$`);
  let tupleMatch;
  while ((tupleMatch = tupleAssignmentRegex.exec(codeWithoutComments)) !== null) {
    const scope = braceDepthAt(codeWithoutComments, tupleMatch.index) === 0 ? 'global' : 'local';

    for (const target of tupleMatch[1].split(',')) {
      const declaration = target.trim().match(declarationTargetRegex);
      if (!declaration) continue;

      const [, varType, modifiers, varName] = declaration;
      // Avoid duplicates
      if (variables.some(v => v.name === varName)) continue;

      variables.push({ name: varName, type: varType, scope, unused: hasUnusedModifier(modifiers) });
    }
  }

  return variables;
}

/**
 * Extracts user-defined global functions (CashScript 0.14+): function
 * definitions at the top level of the file, outside any contract block.
 */
export function extractGlobalFunctions(sourceCode: string): ExtractedFunction[] {
  const codeWithoutComments = removeComments(sourceCode);
  const functions: ExtractedFunction[] = [];

  const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*(?:returns\s*\(([^)]*)\))?/g;
  let match;
  while ((match = functionRegex.exec(codeWithoutComments)) !== null) {
    // Contract functions live at brace depth 1 (inside the contract block);
    // global functions are declared at depth 0.
    if (braceDepthAt(codeWithoutComments, match.index) !== 0) continue;

    functions.push({
      name: match[1],
      parameters: match[2].trim(),
      returnTypes: match[3]?.trim(),
    });
  }

  return functions;
}

/**
 * Returns the brace nesting depth at the given index. Used to tell top-level
 * definitions (depth 0) apart from definitions inside a contract or function
 * body. Braces inside string literals are a known, acceptable inaccuracy.
 */
function braceDepthAt(code: string, index: number): number {
  let depth = 0;
  for (let i = 0; i < index; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') depth--;
  }
  return depth;
}

/**
 * Whether a run of declaration modifiers (e.g. `constant unused `) includes
 * the `unused` modifier.
 */
function hasUnusedModifier(modifiers: string): boolean {
  return /\bunused\b/.test(modifiers);
}

/**
 * Parses a parameter list string into individual parameters.
 */
function parseParameters(paramString: string): Array<{ name: string; type: string; unused: boolean }> {
  const params: Array<{ name: string; type: string; unused: boolean }> = [];

  if (!paramString.trim()) {
    return params;
  }

  // Split by comma, handling potential whitespace
  const paramParts = paramString.split(',');

  for (const part of paramParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Pattern: type [constant|unused] name (possibly with array brackets)
    // Examples: "int amount", "bytes32 hash", "pubkey[] keys", "int unused x"
    const match = trimmed.match(/^(\w+(?:\[\])?)\s+((?:(?:constant|unused)\s+)*)(\w+)$/);
    if (match) {
      params.push({
        type: match[1],
        name: match[3],
        unused: hasUnusedModifier(match[2]),
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

  // Find all function declarations before the cursor. Global functions (0.14+)
  // may declare return types between the parameter list and the body.
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*(?:returns\s*\([^)]*\)\s*)?\{/g;
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
    // Variables marked `unused` are dropped right after their declaration and
    // cannot be referenced anywhere
    if (variable.unused) return false;

    // Contract-level variables and global constants are always available
    if (variable.scope === 'contract' || variable.scope === 'global') {
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
