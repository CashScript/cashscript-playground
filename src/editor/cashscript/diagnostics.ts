import type { Artifact } from 'cashscript';
import { compileString, type CashScriptWarning } from 'cashc';
import { compileString as compileStringV013 } from 'cashc-v0.13';
import { compileString as compileStringV012 } from 'cashc-v0.12';
import type { CashScriptVersion } from './version';

interface CashScriptErrorListener {
  syntaxError<T>(
    recognizer: unknown,
    offendingSymbol: T,
    line: number,
    charPositionInLine: number,
    message: string,
    e?: unknown,
  ): void;
}

interface CompileOptionsWithListeners {
  errorListener?: CashScriptErrorListener;
  warningListener?: (warning: CashScriptWarning) => void;
}

type CompileStringWithListeners = (
  code: string,
  compilerOptions?: CompileOptionsWithListeners,
) => Artifact;

interface SourcePoint {
  line: number;
  column: number;
}

interface SourceLocation {
  start?: SourcePoint;
  end?: SourcePoint;
}

interface ResolvedSourceLocation {
  start: SourcePoint;
  end: SourcePoint;
}

interface OffendingTokenLike {
  text?: string | null;
  line?: number;
  column?: number;
  start?: number;
  stop?: number;
}

interface CompilerErrorLike {
  message?: string;
  node?: {
    location?: SourceLocation;
  };
}

export type CashScriptDiagnosticSeverity = 'error' | 'warning';

export interface CashScriptDiagnostic {
  message: string;
  severity: CashScriptDiagnosticSeverity;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

// Only v0.14 compilers support warnings, so we don't forward warningListener to earlier compilers.
const compileStringByVersion: Record<CashScriptVersion, CompileStringWithListeners> = {
  '0.14': compileString,
  '0.13': (code, { errorListener } = {}) => compileStringV013(code, { errorListener }),
  '0.12': (code, { errorListener } = {}) => compileStringV012(code, { errorListener }),
};

export function compileCashScript(code: string, compilerVersion: CashScriptVersion): Artifact {
  return compileStringByVersion[compilerVersion](code);
}

export function getCashScriptDiagnostics(
  code: string,
  compilerVersion: CashScriptVersion,
): CashScriptDiagnostic[] {
  const errorListener = new SafeErrorListener();
  const warnings: CashScriptDiagnostic[] = [];
  const warningListener = (warning: CashScriptWarning): void => {
    warnings.push(diagnosticFromCompilerWarning(warning));
  };

  try {
    compileStringByVersion[compilerVersion](code, { errorListener, warningListener });
  } catch (error) {
    const syntaxDiagnostics = errorListener.getDiagnostics();
    if (syntaxDiagnostics.length > 0) return syntaxDiagnostics;

    // Warnings are emitted by an earlier compiler pass than most semantic
    // errors, so the warnings gathered before the error still apply.
    return [diagnosticFromCompilerError(error), ...warnings];
  }

  return [...errorListener.getDiagnostics(), ...warnings];
}

class SafeErrorListener implements CashScriptErrorListener {
  private diagnostics: CashScriptDiagnostic[] = [];

  getDiagnostics(): CashScriptDiagnostic[] {
    return this.diagnostics;
  }

  syntaxError<T>(
    _recognizer: unknown,
    offendingSymbol: T,
    line: number,
    charPositionInLine: number,
    message: string,
    _e?: unknown,
  ): void {
    const capitalisedMessage = message.charAt(0).toUpperCase() + message.slice(1);
    const point = { line, column: charPositionInLine };
    const tokenRange = rangeFromOffendingToken(offendingSymbol, point);

    this.diagnostics.push({
      message: capitalisedMessage,
      severity: 'error',
      ...pointToMarkerRange(tokenRange.start, tokenRange.end),
    });
  }
}

function rangeFromOffendingToken<T>(
  offendingSymbol: T,
  fallbackPoint: SourcePoint,
): ResolvedSourceLocation {
  if (!offendingSymbol || typeof offendingSymbol !== 'object') {
    return { start: fallbackPoint, end: fallbackPoint };
  }

  const token = offendingSymbol as OffendingTokenLike;
  const tokenLine = typeof token.line === 'number' ? token.line : fallbackPoint.line;
  const tokenColumn = typeof token.column === 'number' ? token.column : fallbackPoint.column;
  const start = { line: tokenLine, column: tokenColumn };
  const tokenLength = tokenLengthFromSymbol(token);

  if (tokenLength === undefined) return { start, end: start };

  return {
    start,
    end: {
      line: tokenLine,
      column: tokenColumn + tokenLength,
    },
  };
}

function tokenLengthFromSymbol(token: OffendingTokenLike): number | undefined {
  if (token.text && token.text !== '<EOF>') return token.text.length;

  if (typeof token.start === 'number' && typeof token.stop === 'number' && token.stop >= token.start) {
    return token.stop - token.start + 1;
  }

  return undefined;
}

function diagnosticFromCompilerError(error: unknown): CashScriptDiagnostic {
  const message = error instanceof Error ? error.message : String(error);
  const location = (error as CompilerErrorLike | null | undefined)?.node?.location;

  return diagnosticFromLocatedMessage(message, location, 'error');
}

function diagnosticFromCompilerWarning(warning: CashScriptWarning): CashScriptDiagnostic {
  return diagnosticFromLocatedMessage(warning.message, warning.node.location, 'warning');
}

// Compiler errors and warnings carry the location of the offending AST node
// (when available) and append that same location to their message. The marker
// is anchored on the node's location, falling back to the one in the message.
function diagnosticFromLocatedMessage(
  originalMessage: string,
  location: SourceLocation | undefined,
  severity: CashScriptDiagnosticSeverity,
): CashScriptDiagnostic {
  const message = withoutLocationSuffix(originalMessage);
  const messageLocation = originalMessage.match(/\bat Line (\d+), Column (\d+)$/);
  const fallbackPoint = messageLocation
    ? { line: Number(messageLocation[1]), column: Number(messageLocation[2]) }
    : { line: 1, column: 0 };

  return {
    message,
    severity,
    ...pointToMarkerRange(
      location?.start ?? fallbackPoint,
      location?.end ?? location?.start ?? fallbackPoint,
    ),
  };
}

function pointToMarkerRange(
  start: SourcePoint,
  end: SourcePoint,
): Omit<CashScriptDiagnostic, 'message' | 'severity'> {
  const startPosition = pointToMarkerPosition(start);
  const endPosition = pointToMarkerPosition(end);

  return expandEmptyMarkerRange({
    startLineNumber: startPosition.lineNumber,
    startColumn: startPosition.column,
    endLineNumber: endPosition.lineNumber,
    endColumn: endPosition.column,
  });
}

function pointToMarkerPosition(point: SourcePoint): { lineNumber: number; column: number } {
  return {
    lineNumber: Math.max(point.line, 1),
    column: Math.max(point.column + 1, 1),
  };
}

function expandEmptyMarkerRange(
  range: Omit<CashScriptDiagnostic, 'message' | 'severity'>,
): Omit<CashScriptDiagnostic, 'message' | 'severity'> {
  if (
    range.endLineNumber > range.startLineNumber
    || (
      range.endLineNumber === range.startLineNumber
      && range.endColumn > range.startColumn
    )
  ) {
    return range;
  }

  return {
    ...range,
    endLineNumber: range.startLineNumber,
    endColumn: range.startColumn + 1,
  };
}

function withoutLocationSuffix(message: string): string {
  return message.replace(/\s+at Line \d+, Column \d+$/, '');
}
