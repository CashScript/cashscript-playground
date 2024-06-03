import React, { useState, useEffect } from 'react'
import { Artifact, Contract, Argument, Network, ElectrumNetworkProvider } from 'cashscript'
import { InputGroup, Form, Button } from 'react-bootstrap'
import { readAsType, ContractInfo } from './shared'

interface Props {
  artifact?: Artifact
  contracts?: ContractInfo[]
  setContracts: (contracts?: ContractInfo[]) => void
  network: Network
  updateUtxosContract: (contractName: string) => void
}

const ContractCreation: React.FC<Props> = ({ artifact, contracts, setContracts, network, updateUtxosContract}) => {
  const [args, setArgs] = useState<Argument[]>([])
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
    setArgs(newArgs)
    setNameContract("")
  }

  const inputFields = artifact?.constructorInputs.map((input, i) => (
    <Form.Control key={`constructor-arg-${i}`} size="sm" id={`constructor-arg-${i}`}
      placeholder={`${input.type} ${input.name}`}
      aria-label={`${input.type} ${input.name}`}
      onChange={(event) => {
        const argsCopy = [...args]
        argsCopy[i] = readAsType(event.target.value, input.type)
        setArgs(argsCopy)
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
      const newContract = new Contract(artifact, args, { provider })
      newContract.name = nameContract
      const contractInfo = {contract: newContract, utxos: undefined}
      setContracts([contractInfo, ...contracts ?? []])
      alert("created contract!")
      setCreatedContract(true)
    } catch (e: any) {
      alert(e.message)
      console.error(e.message)
    }
  }

  useEffect(() => {
    if(!createdContract) return
    updateUtxosContract(nameContract)
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
