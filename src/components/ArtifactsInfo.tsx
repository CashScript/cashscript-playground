import React from 'react'
import { Artifact } from 'cashscript'

interface Props {
  artifact?: Artifact
}

const ContractInfo: React.FC<Props> = ({ artifact }) => {

  const downloadArtifact = () => {
    if(!artifact) return
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(artifact, null, 2)));
    element.setAttribute('download', `${artifact.contractName}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div style={{
      flex: 2,
      margin: '16px',
      border: '2px solid black',
      borderTop: '1px solid black',
      fontSize: '100%',
      lineHeight: 'inherit',
      overflow: 'auto',
      background: '#fffffe',
      padding: '8px 16px',
      color: '#000'
    }}>{ artifact?
      (<div>
        <h2>Artifact {artifact.contractName}</h2>
        <strong>Last Updated</strong>
        <p>{artifact.updatedAt}</p>
        <strong>Artifact Bytecode</strong>
        <details>
          <summary>
            show full Bytecode
          </summary>
          {artifact.bytecode}
        </details>
        <strong>Compiler Version</strong>
        <p>{artifact.compiler.version}</p>
        <strong>Download Artifact</strong>
        <p onClick={downloadArtifact}>
          download JSON file
          <img src='./downloadIcon.svg' style={{marginLeft:"5px", verticalAlign: "text-bottom", cursor:"pointer"}}/>
        </p>
      </div>) : 
      <div>Compile a CashScript contract to get started!</div> }
    </div>
  )
}

export default ContractInfo