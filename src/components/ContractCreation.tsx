import React, { useState, useEffect } from 'react'
import { Artifact, Contract, ConstructorArgument, NetworkProvider } from 'cashscript'
import { InputGroup, Form, Button } from 'react-bootstrap'
import { readAsConstructorType, ContractInfo, TinyContractObj } from './shared'

interface Props {
  artifact?: Artifact
  contracts?: ContractInfo[]
  setContracts: (contracts?: ContractInfo[]) => void
  provider: NetworkProvider
  updateUtxosContract: (contractName: string) => void
}

const ContractCreation: React.FC<Props> = ({ artifact, contracts, setContracts, provider, updateUtxosContract}) => {
  const [constructorArgs, setConstructorArgs] = useState<ConstructorArgument[]>([])
  const [nameContract, setNameContract] = useState<string>("");
  const [contractType, setContractType] = useState<"p2sh32" | "p2sh20">("p2sh32");
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
    if (nameContract == "") {
      alert("Please provide a name for the contract")
      return
    }
    const nameAlreadyExists = contracts?.some(contractInfo => contractInfo.contract.name == nameContract)
    if (nameAlreadyExists){
      alert("Contract with this name already exists!")
      return
    }
    try {
      const newContract = new Contract(artifact, constructorArgs, { provider, addressType: contractType })
      newContract.name = nameContract
      const contractInfo = {contract: newContract, utxos: undefined, args: constructorArgs}
      setContracts([contractInfo, ...contracts ?? []])
      alert("created contract!")
      // will trigger useEffect after setContracts
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
        contractType: contract.addressType,
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

  useEffect(() => {
    resetInputFields()
    setNameContract(artifact?.contractName ?? "")
 }, [artifact]);

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
          value={nameContract}
          onChange={(event) => setNameContract(event.target.value)}
        />
      </InputGroup>
      <p>Contract Type:</p>
      <Form.Control size="sm" id="network-selector" style={{width: "350px"}}
        as="select"
        value={provider.network}
        onChange={(event) => setContractType(event.target.value as "p2sh32" | "p2sh20")}
      >
        <option value="p2sh32">p2sh32 (default)</option>
        <option value="p2sh20">p2sh20</option>
      </Form.Control>
      <p>Initialise contract by providing contract arguments:</p>
      {constructorForm}
    </div>
  )
}

export default ContractCreation
