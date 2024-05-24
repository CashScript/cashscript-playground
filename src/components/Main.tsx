import React, { useState, useEffect } from 'react';
import { Artifact, Network } from 'cashscript';
import { compileString } from 'cashc';
import { RowFlex, Wallet } from './shared';
import Editor from './Editor';
import ContractInfo from './ContractInfo';
import WalletInfo from './Wallets';

interface Props {}

const Main: React.FC<Props> = () => {
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

  const [artifact, setArtifact] = useState<Artifact | undefined>(undefined);
  const [network, setNetwork] = useState<Network>('chipnet')
  const [showWallets, setShowWallets] = useState<boolean | undefined>(false);
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [needRecompile, setNeedRecompile] = useState<boolean>(true);

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

  function compile() {
    try {
      localStorage.setItem("code", code);
      const artifact = compileString(code);
      setArtifact(artifact);
    } catch (e: any) {
      alert(e.message);
      console.error(e.message);
      setArtifact(undefined);
    }
  }

  return (
    <RowFlex style={{
      padding: '32px',
      paddingTop: '0px',
      height: 'calc(100vh - 120px'
    }}>
      <Editor code={code} setCode={setCode} compile={compile} needRecompile={needRecompile}/>
      <WalletInfo style={!showWallets?{display:'none'}:{}} network={network} setShowWallets={setShowWallets} wallets={wallets} setWallets={setWallets}/>
      <ContractInfo style={showWallets?{display:'none'}:{}} artifact={artifact} network={network} setNetwork={setNetwork} setShowWallets={setShowWallets} wallets={wallets}/>
    </RowFlex>
  )
}

export default Main;
