import React, { useState, useEffect } from 'react';
import { Artifact, Contract, ElectrumNetworkProvider } from 'cashscript';
import { compileString } from 'cashc';
import { RowFlex, ContractInfo, TinyContractObj } from './shared';
import Editor from './Editor';
import ArtifactsInfo from './ArtifactsInfo';

interface Props {
  code: string
  setCode: (code: string) => void
  artifacts: Artifact[] | undefined
  setArtifacts: (artifacts: Artifact[] | undefined) => void
  setContracts: (contracts?: ContractInfo[]) => void
  updateAllUtxosContracts: () => void
}

const Main: React.FC<Props> = ({code, setCode, artifacts, setArtifacts, setContracts, updateAllUtxosContracts}) => {

  const [initializeContracts, setInitializeContracts] = useState<number>(0);

  useEffect(() => {
    const codeLocalStorage = localStorage.getItem("code");
    const artifactsLocalStorage = localStorage.getItem("artifacts");
    const contractsLocalStorage = localStorage.getItem("contracts");
    // If code exits in local storage, set it as new code
    if (codeLocalStorage) setCode(codeLocalStorage);
    if (artifactsLocalStorage){
      try{
         setArtifacts(JSON.parse(artifactsLocalStorage));
      } catch(error){ console.log(error) }
    }
    if (contractsLocalStorage) setInitializeContracts(1)
  }, [])

  useEffect(() => {
    if(initializeContracts != 1) return
    const contractsStringLocalStorage = localStorage.getItem("contracts");
    if(!contractsStringLocalStorage) return
    const contractsLocalStorage: TinyContractObj[] = JSON.parse(contractsStringLocalStorage)
    const newContracts = contractsLocalStorage.map(tinyContractObj => {
      const {contractName, artifactName, network, args} = tinyContractObj
      const matchingArtifact = artifacts?.find(artifact => artifact.contractName == artifactName)
      if(!matchingArtifact) return
      const unstringifiedArgs = args.map(arg => {
        if(typeof arg == "string" && arg.startsWith("bigint")) return BigInt(arg.slice(6))
          return arg
      })
      const provider = new ElectrumNetworkProvider(network)
      const newContract = new Contract(matchingArtifact, unstringifiedArgs, {provider})
      newContract.name = contractName
      const contractInfo: ContractInfo = {
        contract: newContract,
        utxos: undefined,
        args: unstringifiedArgs
      }
      return contractInfo
    }).filter(item => item != undefined) as ContractInfo[]
    setContracts(newContracts);
    setInitializeContracts(2)
  },[initializeContracts])

  useEffect(() => {
    if(initializeContracts != 2) return
    updateAllUtxosContracts()
    setInitializeContracts(0)
  })

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
      const otherArtifacts = artifacts?.filter(artifact => artifact.contractName !== nameNewArtifact)
      const newArtifacts = [newArtifact, ...otherArtifacts ?? []]
      localStorage.setItem("artifacts", JSON.stringify(newArtifacts , null, 2));
      setArtifacts(newArtifacts);
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
      <Editor code={code} setCode={setCode} compile={compile}/>
      <ArtifactsInfo setCode={setCode} artifacts={artifacts} setArtifacts={setArtifacts}/>
    </RowFlex>
  )
}

export default Main;
