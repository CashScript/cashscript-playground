import React, { useState } from 'react'
import { ControlledEditor } from '@monaco-editor/react'
import { Button, Form } from 'react-bootstrap'
import { ColumnFlex, RowFlex, CompilerVersion } from './shared'

interface Props {
  code: string
  setCode: (value: string) => void
  compile: () => void,
  compilerVersion: CompilerVersion
  setCompilerVersion: (version: CompilerVersion) => void
}

const Editor: React.FC<Props> = ({ code, setCode, compile, compilerVersion, setCompilerVersion }) => {
  const [isEditorReady, setIsEditorReady] = useState(false)

  function handleEditorDidMount() {
    setIsEditorReady(true)
  }

  return (
    <ColumnFlex
      id="editor"
      style={{ flex: 3, margin: '16px', border: '2px solid black', background: 'white' }}
    >
      <ControlledEditor
        language="sol"
        value={code}
        theme="light"
        onChange={(ev: any, code?: string) => setCode(code?? "") }
        editorDidMount={handleEditorDidMount}
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
