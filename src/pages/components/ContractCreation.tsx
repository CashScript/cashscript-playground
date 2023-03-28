import React, { useState, useEffect } from 'react'
import { Artifact, Contract, Argument, Network, ElectrumNetworkProvider } from 'cashscript'
import { InputGroup, Form, Button } from 'react-bootstrap'
import { QRFunc } from 'react-qrbtf'
import { readAsType } from './shared'

interface Props {
  artifact?: Artifact
  contract?: Contract
  setContract: (contract?: Contract) => void
  network: Network
  setNetwork: (network: Network) => void
  setShowWallets:(showWallets: boolean) => void
}

const ContractCreation: React.FC<Props> = ({ artifact, contract, setContract, network, setNetwork, setShowWallets }) => {
  const [args, setArgs] = useState<Argument[]>([])
  const [balance, setBalance] = useState<number | undefined>(undefined)

  useEffect(() => {
    // This code is suuper ugly but I haven't found any other way to clear the value
    // of the input fields.
    artifact?.constructorInputs.forEach((input, i) => {
      const el = document.getElementById(`constructor-arg-${i}`)
      if (el) (el as any).value = ''
    })

    // Set empty strings as default values
    const newArgs = artifact?.constructorInputs.map(() => '') || []

    setArgs(newArgs)
  }, [artifact])

  useEffect(() => {
    async function updateBalance() {
      if (!contract) return
      setBalance(await contract.getBalance())
    }
    updateBalance()
  }, [contract])

  const inputFields = artifact?.constructorInputs.map((input, i) => (
    <Form.Control size="sm" id={`constructor-arg-${i}`}
      placeholder={`${input.type} ${input.name}`}
      aria-label={`${input.type} ${input.name}`}
      onChange={(event) => {
        const argsCopy = [...args]
        argsCopy[i] = readAsType(event.target.value, input.type)
        setArgs(argsCopy)
      }}
    />
  )) || []

  const networkSelector = (
    <Form.Control size="sm" id="network-selector"
      as="select"
      value={network}
      onChange={(event) => {
        setNetwork(event.target.value as Network)
      }}
    >
      <option>mainnet</option>
      <option>testnet3</option>
      <option>testnet4</option>
      <option>chipnet</option>
    </Form.Control>
  )

  const createButton = <Button variant="secondary" size="sm" onClick={() => createContract()}>Create</Button>

  const constructorForm = artifact &&
    (<InputGroup size="sm">
      {inputFields}
      {networkSelector}
      <InputGroup.Append>
        {createButton}
      </InputGroup.Append>
    </InputGroup>)

  function createContract() {
    if (!artifact) return
    try {
      const provider = new ElectrumNetworkProvider(network)
      const newContract = new Contract(artifact, args, provider)
      setContract(newContract)
    } catch (e) {
      alert(e.message)
      console.error(e.message)
    }
  }

  return (
    <div style={{
      height: '100%',
      border: '2px solid black',
      borderBottom: '1px solid black',
      fontSize: '100%',
      lineHeight: 'inherit',
      overflow: 'auto',
      background: '#fffffe',
      padding: '8px 16px',
      color: '#000'
    }}>
      <h2>{artifact?.contractName} <button onClick={() => setShowWallets(true)} style={{float:'right', border:'none', backgroundColor: 'transparent',outline: 'none'}}>⇆</button></h2>
      {constructorForm}
      {contract !==  undefined && balance !== undefined &&
        <div style={{ margin: '5px', width: '100%' }}>
          <div style={{ float: 'left', width: '70%' }}>
            <strong>Contract address</strong>
            <p>{contract.address}</p>
            <strong>Contract balance</strong>
            <p>{balance} satoshis</p>
            <strong>Bytecode size</strong>
            <p>{contract.bytesize} bytes (max 520)</p>
            <strong>Bytecode opcount</strong>
            <p>{contract.opcount} opcodes (max 201)</p>
          </div>
          <div style={{ float: 'left', width: '30%', paddingTop: '4%' }}>
            <QRFunc value={contract.address} />
          </div>
        </div>
      }
    </div>
  )
}

export default ContractCreation
