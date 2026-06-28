import React, { useState, useEffect, useRef } from 'react'
import MonacoEditor, { loader } from '@monaco-editor/react'
import { Button, Form } from 'react-bootstrap'
import { ColumnFlex, RowFlex } from './shared'
import { setupCashScriptLanguage, setCashScriptCompilerVersion, CASHSCRIPT_LANGUAGE_ID, CASHSCRIPT_THEME_ID } from '@/editor/cashscript'
import { getCashScriptDiagnostics } from '@/editor/cashscript/diagnostics'
import type * as Monaco from 'monaco-editor'
import type { CashScriptVersion } from '@/editor/cashscript/version'
interface Props {
  code: string
  setCode: (value: string) => void
  compile: () => void,
  compilerVersion: CashScriptVersion
  setCompilerVersion: (version: CashScriptVersion) => void
}

const CASHSCRIPT_MARKER_OWNER = 'cashscript-compiler';

const Editor: React.FC<Props> = ({ code, setCode, compile, compilerVersion, setCompilerVersion }) => {
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [isLanguageReady, setIsLanguageReady] = useState(false)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof Monaco | null>(null)

  // Initialize CashScript language support
  useEffect(() => {
    loader.init().then((monacoInstance: typeof Monaco) => {
      setupCashScriptLanguage(monacoInstance)
      setIsLanguageReady(true)
    })
  }, [])

  // Keep the language providers in sync with the selected compiler version so
  // completions and hovers reflect the features available in that version.
  useEffect(() => {
    setCashScriptCompilerVersion(compilerVersion)
  }, [compilerVersion])

  useEffect(() => {
    if (!isEditorReady) return undefined;

    const monaco = monacoRef.current;
    const model = editorRef.current?.getModel();
    if (!monaco || !model) return undefined;

    const validationTimeout = setTimeout(() => {
      const diagnostics = getCashScriptDiagnostics(code, compilerVersion);
      const markers = diagnostics.map((diagnostic) => ({
        ...diagnostic,
        severity: monaco.MarkerSeverity.Error,
        source: 'cashc',
      }));

      monaco.editor.setModelMarkers(model, CASHSCRIPT_MARKER_OWNER, markers);
    }, 750);

    return () => clearTimeout(validationTimeout);
  }, [code, compilerVersion, isEditorReady])

  useEffect(() => {
    return () => {
      const monaco = monacoRef.current;
      const model = editorRef.current?.getModel();
      if (monaco && model) monaco.editor.setModelMarkers(model, CASHSCRIPT_MARKER_OWNER, []);
    };
  }, [])

  function handleEditorMount(
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco,
  ) {
    editorRef.current = editor
    monacoRef.current = monaco
    setIsEditorReady(true)
  }

  return (
    <ColumnFlex
      id="editor"
      style={{ flex: 3, margin: '16px', border: '2px solid black', background: 'white' }}
    >
      <MonacoEditor
        language={isLanguageReady ? CASHSCRIPT_LANGUAGE_ID : 'plaintext'}
        value={code}
        theme={isLanguageReady ? CASHSCRIPT_THEME_ID : 'light'}
        onChange={(value) => setCode(value ?? "")}
        onMount={handleEditorMount}
      />
      <RowFlex style={{ margin: '20px auto', alignItems: 'center', gap: '12px' }}>
        <Form.Select
          aria-label="Compiler version"
          value={compilerVersion}
          disabled={!isEditorReady}
          onChange={(e) => setCompilerVersion(e.target.value as CashScriptVersion)}
          style={{ width: '170px', borderRadius: '30px' }}
        >
          <option value="0.14">cashc v0.14</option>
          <option value="0.12">cashc v0.12</option>
        </Form.Select>
        <Button
          variant="secondary"
          disabled={!isEditorReady}
          onClick={() => compile()}
          style={{
            borderRadius: '30px',
            width: '150px',
          }}>
          Compile
        </Button>
      </RowFlex>
    </ColumnFlex>
  )
}

export default Editor
