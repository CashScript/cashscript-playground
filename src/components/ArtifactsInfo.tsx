import React from 'react'
import { Artifact } from 'cashscript'

interface Props {
  artifacts?: Artifact[]
  setArtifacts: (artifacts: Artifact[] | undefined) => void
}

const ContractInfo: React.FC<Props> = ({ artifacts, setArtifacts }) => {

  const downloadArtifact = (artifact: Artifact) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(artifact, null, 2)));
    element.setAttribute('download', `${artifact.contractName}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const removeArtifact = (artifactToRemove: Artifact) => {
    const artifactToRemoveName = artifactToRemove.contractName;
    const newArtifacts = artifacts?.filter(artifact => artifact.contractName !== artifactToRemoveName)
    setArtifacts(newArtifacts)
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
    }}>
      <h2>Contract Artifacts</h2>
      { artifacts?.length?
      (<div>
        {artifacts.map(artifact => (
          <details key={artifact.contractName} style={{margin:"10px 0"}}>
            <summary style={{fontSize: "1rem"}}>
              {artifact.contractName}
              <div style={{float:"right"}}>
                <img
                  src='./trash.svg'
                  onClick={() => removeArtifact(artifact)}
                  style={{padding: "0px 6px", width: "fit-content", cursor:"pointer"}}
                  alt='trashIcon'
                />
              </div>
            </summary>
          
            <div style={{paddingLeft: "15px"}}>
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
              <p onClick={() => downloadArtifact(artifact)}>
                download JSON file
                <img src='./downloadIcon.svg' style={{marginLeft:"5px", verticalAlign: "text-bottom", cursor:"pointer"}}/>
              </p>
            </div>
          </details>
          ))}
        </div>) : 
      <div>Compile a CashScript contract to get started!</div> }
    </div>
  )
}

export default ContractInfo