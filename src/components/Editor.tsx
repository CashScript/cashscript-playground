import React, { useState } from 'react'
import { ControlledEditor } from '@monaco-editor/react'
import { Button } from 'react-bootstrap'
import { ColumnFlex } from './shared'

interface Props {
  code: string
  setCode: (value: string) => void
  compile: () => void
}

const Editor: React.FC<Props> = ({ code, setCode, compile }) => {
  const [isEditorReady, setIsEditorReady] = useState(false)

  function handleEditorDidMount() {
    setIsEditorReady(true)
  }

  return (
    <ColumnFlex
      id="editor"
      style={{ flex: 1, margin: '16px', border: '2px solid black', background: 'white' }}
    >
      <ControlledEditor
        language="sol"
        value={code}
        theme="light"
        onChange={(ev: any, code?: string) => code && setCode(code)}
        editorDidMount={handleEditorDidMount}
      />
      <Button
        variant="secondary"
        disabled={!isEditorReady}
        onClick={() => compile()}
        style={{
          margin: '20px auto',
          borderRadius: '30px',
          width: '150px',
      }}>
        Compile
      </Button>
    </ColumnFlex>
  )
}

export default Editor
