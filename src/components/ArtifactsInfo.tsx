import React from 'react'
import { Artifact } from 'cashscript'
import { Button } from 'react-bootstrap'
import FileUploader from './FileUploader'

interface Props {
  setCode: (code: string) => void
  artifacts?: Artifact[]
  setArtifacts: (artifacts: Artifact[] | undefined) => void
}

const ArtifactsInfo: React.FC<Props> = ({ setCode, artifacts, setArtifacts }) => {

  const downloadArtifact = (artifact: Artifact) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(artifact, null, 2)));
    element.setAttribute('download', `${artifact.contractName}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const importArtifactFile = (fileText: string) => {
    try{
      const importedArtifact: Artifact = JSON.parse(fileText)
      const nameNewArtifact = importedArtifact.contractName
      const sameArifactExists = artifacts?.find(artifact => nameNewArtifact === artifact.contractName)
      if(sameArifactExists){
        const confirmOverwrite = confirm("About to overwite existing artifact with same name")
        if(!confirmOverwrite) return
      }
      const newArtifacts = [importedArtifact, ...artifacts ?? []]
      setArtifacts(newArtifacts)
      localStorage.setItem("artifacts", JSON.stringify(newArtifacts , null, 2));
      alert("imported!")
    } catch(error){
      console.log(error)
      alert("import failed")
    }
  };

  const removeArtifact = (artifactToRemove: Artifact) => {
    const artifactToRemoveName = artifactToRemove.contractName;
    const newArtifacts = artifacts?.filter(artifact => artifact.contractName !== artifactToRemoveName)
    setArtifacts(newArtifacts)
    localStorage.setItem("artifacts", JSON.stringify(newArtifacts , null, 2));
  }

  const loadArtifact = (artifact: Artifact) => {
    setCode(artifact.source)
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
      <div style={{display:"flex", justifyContent:"space-between"}}>
        <h2 style={{width:"fit-content"}}>Contract Artifacts</h2>
        <FileUploader handleFile={importArtifactFile} />
      </div>

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
              <strong>Load Contract to Editor</strong>
              <Button variant="secondary" size="sm" style={{display:"block"}} onClick={() => loadArtifact(artifact)}>
                Load Artifact
              </Button>
            </div>
          </details>
          ))}
        </div>) : 
      <div>Compile a CashScript contract to get started!</div> }
    </div>
  )
}

export default ArtifactsInfo