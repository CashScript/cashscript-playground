import React, { useState, useEffect } from 'react'
import { Artifact, Contract, Argument, Network, ElectrumNetworkProvider, Utxo } from 'cashscript'
import { InputGroup, Form, Button } from 'react-bootstrap'
import { readAsType } from './shared'

interface Props {
  artifact?: Artifact
  contracts?: Contract[]
  setContracts: (contract?: Contract[]) => void
  network: Network
  utxos: Utxo[] | undefined
  balance: bigint | undefined
  updateUtxosContract: () => void
}

const ContractCreation: React.FC<Props> = ({ artifact, contracts, setContracts, network, balance, utxos, updateUtxosContract}) => {
  const [args, setArgs] = useState<Argument[]>([])

  const contract = contracts?.[0] // TODO: delete this

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
  }

  useEffect(() => {
    updateUtxosContract()
  }, [contract])

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
      setContracts([newContract, ...contracts ?? []])
      alert("created contract!")
      resetInputFields()
    } catch (e: any) {
      alert(e.message)
      console.error(e.message)
    }
  }

  return (
    <div style={{
      marginTop: "15px"
    }}>
      <h5>{artifact?.contractName}</h5>
      <p>Initialise contract by providing contract arguments:</p>
      {constructorForm}
    </div>
  )
}

export default ContractCreation
