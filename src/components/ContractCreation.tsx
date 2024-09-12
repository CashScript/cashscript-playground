import React, { useState, useEffect } from 'react'
import { Artifact, Contract, ConstructorArgument, Network, ElectrumNetworkProvider } from 'cashscript'
import { InputGroup, Form, Button } from 'react-bootstrap'
import { readAsConstructorType, ContractInfo, TinyContractObj } from './shared'

interface Props {
  artifact?: Artifact
  contracts?: ContractInfo[]
  setContracts: (contracts?: ContractInfo[]) => void
  network: Network
  updateUtxosContract: (contractName: string) => void
}

const ContractCreation: React.FC<Props> = ({ artifact, contracts, setContracts, network, updateUtxosContract}) => {
  const [constructorArgs, setConstructorArgs] = useState<ConstructorArgument[]>([])
  const [nameContract, setNameContract] = useState<string>("");
  const [createdContract, setCreatedContract] = useState(false);

  const resetInputFields = () => {
    // This code is suuper ugly but I haven't found any other way to clear the value
    // of the input fields.
    artifact?.constructorInputs.forEach((input, i) => {
      const el = document.getElementById(`constructor-arg-${i}`)
      if (el) (el as any).value = ''
    })
    // Set empty strings as default values
    const newArgs = artifact?.constructorInputs.map(() => '') || []
    setConstructorArgs(newArgs)
    setNameContract("")
  }

  const inputFields = artifact?.constructorInputs.map((input, i) => (
    <Form.Control key={`constructor-arg-${i}`} size="sm" id={`constructor-arg-${i}`}
      placeholder={`${input.type} ${input.name}`}
      aria-label={`${input.type} ${input.name}`}
      onChange={(event) => {
        const argsCopy = [...constructorArgs]
        argsCopy[i] = readAsConstructorType(event.target.value, input.type)
        setConstructorArgs(argsCopy)
      }}
    />
  )) || []

  const createButton = <Button variant="secondary" size="sm" onClick={() => createContract()}>Create</Button>

  const constructorForm = artifact &&
    (<>
      <InputGroup size="sm">{inputFields}</InputGroup>
      <div style={{ margin: "10px 0px"}}>{ createButton }</div>
    </>)

  function createContract() {
    if (!artifact) return
    try {
      const provider = new ElectrumNetworkProvider(network)
      const newContract = new Contract(artifact, constructorArgs, { provider })
      newContract.name = nameContract
      const contractInfo = {contract: newContract, utxos: undefined, args: constructorArgs}
      setContracts([contractInfo, ...contracts ?? []])
      alert("created contract!")
      setCreatedContract(true)
    } catch (e: any) {
      alert(e.message)
      console.error(e.message)
    }
  }

  function addContractInfoToLocalStorage(){
    if(!contracts) return
    const contractListlocalStorage = contracts.map(contractInfo => {
      const { contract } = contractInfo;
      const strifiedArgs = contractInfo.args.map(arg => 
        typeof arg == "bigint" ? "bigint"+arg.toString() : arg
      )
      const tinyContractObj: TinyContractObj = {
        contractName: contract.name,
        artifactName: contract.artifact.contractName,
        network: contract.provider.network,
        args: strifiedArgs
      }
      return tinyContractObj
    })
    localStorage.setItem("contracts", JSON.stringify(contractListlocalStorage));
  }

  useEffect(() => {
    if(!createdContract) return
    updateUtxosContract(nameContract)
    addContractInfoToLocalStorage()
    resetInputFields()
    setCreatedContract(false)
 }, [createdContract]);

  return (
    <div style={{
      marginTop: "15px"
    }}>
      <h5>{artifact?.contractName}</h5>
      <p>Contract Name:</p>
      <InputGroup size="sm" style={{width:"350px"}}>
        <Form.Control key={`contractName`} size="sm" id={nameContract}
          placeholder={`contractName`}
          aria-label={`contractName`}
          onChange={(event) => setNameContract(event.target.value)}
        />
      </InputGroup>
      <p>Initialise contract by providing contract arguments:</p>
      {constructorForm}
    </div>
  )
}

export default ContractCreation
