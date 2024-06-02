import React, { useState, useEffect } from 'react';
import { Artifact } from 'cashscript';
import { compileString } from 'cashc';
import { RowFlex } from './shared';
import Editor from './Editor';
import ArtifactsInfo from './ArtifactsInfo';

interface Props {
  code: string
  setCode: (code: string) => void
  artifacts: Artifact[] | undefined
  setArtifacts: (artifacts: Artifact[] | undefined) => void
}

const Main: React.FC<Props> = ({code, setCode, artifacts, setArtifacts}) => {

  const [needRecompile, setNeedRecompile] = useState<boolean>(true);
  /*
  useEffect(() => {
    const codeLocalStorage = localStorage.getItem("code");
    // If code exits in local storage, set it as new code
    if (codeLocalStorage){
      setCode(codeLocalStorage);
      try {
        const artifact = compileString(codeLocalStorage);
        setArtifact(artifact);
      } catch (e: any) {
        alert(e.message);
        console.error(e.message);
      }
    }
  }, [])

  useEffect(() => {
    if(!artifact) return
    const previousCode = localStorage.getItem("code");
    const changedCashScriptCode = previousCode!= code;
    setNeedRecompile(changedCashScriptCode);
  },[code, needRecompile, artifact])
  */

  function compile() {
    try {
      localStorage.setItem("code", code);
      const newArtifact = compileString(code);
      const nameNewArtifact = newArtifact.contractName
      const sameArifactExists = artifacts?.find(artifact => nameNewArtifact === artifact.contractName)
      if(sameArifactExists){
        const confirmOverwrite = confirm("About to overwite existing artifact with same name")
        if(!confirmOverwrite) return
      }
      const newArtifacts = artifacts?.filter(artifact => artifact.contractName !== nameNewArtifact)
      setArtifacts([newArtifact, ...newArtifacts ?? []]);
    } catch (e: any) {
      alert(e.message);
      console.error(e.message);
    }
  }

  return (
    <RowFlex style={{
      paddingTop: '0px',
      height: 'calc(100vh - 140px)'
    }}>
      <Editor code={code} setCode={setCode} compile={compile} needRecompile={needRecompile}/>
      <ArtifactsInfo setCode={setCode} artifacts={artifacts} setArtifacts={setArtifacts}/>
    </RowFlex>
  )
}

export default Main;
