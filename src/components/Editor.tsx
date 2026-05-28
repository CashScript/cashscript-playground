import React, { useState, useEffect } from 'react'
import MonacoEditor, { loader } from '@monaco-editor/react'
import { Button, Form } from 'react-bootstrap'
import { ColumnFlex, RowFlex, CompilerVersion } from './shared'
import { setupCashScriptLanguage, setCashScriptCompilerVersion, CASHSCRIPT_LANGUAGE_ID, CASHSCRIPT_THEME_ID } from '@/editor/cashscript'
import type * as Monaco from 'monaco-editor'

interface Props {
  code: string
  setCode: (value: string) => void
  compile: () => void,
  compilerVersion: CompilerVersion
  setCompilerVersion: (version: CompilerVersion) => void
}

const Editor: React.FC<Props> = ({ code, setCode, compile, compilerVersion, setCompilerVersion }) => {
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [isLanguageReady, setIsLanguageReady] = useState(false)

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

  function handleEditorMount() {
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
          onChange={(e) => setCompilerVersion(e.target.value as CompilerVersion)}
          style={{ width: '170px', borderRadius: '30px' }}
        >
          <option value="0.13.0">cashc v0.13</option>
          <option value="0.12.0">cashc v0.12</option>
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
