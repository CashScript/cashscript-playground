import React, { useState, useEffect } from 'react';
import { Artifact, Utxo } from 'cashscript';
import { compileString } from 'cashc';
import { RowFlex } from './shared';
import Editor from './Editor';
import ArtifactsInfo from './ArtifactsInfo';

interface Props {
  artifacts: Artifact[] | undefined
  setArtifacts: (artifacts: Artifact[] | undefined) => void
}

const Main: React.FC<Props> = ({artifacts, setArtifacts}) => {
  const [code, setCode] = useState<string>(
`pragma cashscript >= 0.8.0;

contract TransferWithTimeout(pubkey sender, pubkey recipient, int timeout) {
    // Require recipient's signature to match
    function transfer(sig recipientSig) {
        require(checkSig(recipientSig, recipient));
    }

    // Require timeout time to be reached and sender's signature to match
    function timeout(sig senderSig) {
        require(checkSig(senderSig, sender));
        require(tx.time >= timeout);
    }
}
`);

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
      const newArtifacts = artifacts?.filter(artifact => artifact.contractName !== nameNewArtifact)
      setArtifacts([newArtifact, ...newArtifacts ?? []]);
    } catch (e: any) {
      alert(e.message);
      console.error(e.message);
      setArtifacts(undefined);
    }
  }

  return (
    <RowFlex style={{
      paddingTop: '0px',
      height: 'calc(100vh - 140px)'
    }}>
      <Editor code={code} setCode={setCode} compile={compile} needRecompile={needRecompile}/>
      <ArtifactsInfo artifacts={artifacts} setArtifacts={setArtifacts}/>
    </RowFlex>
  )
}

export default Main;
