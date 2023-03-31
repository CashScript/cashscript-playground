import React, { useState, useEffect } from 'react'
import { Artifact, Contract, Argument, Network, ElectrumNetworkProvider, Utxo } from 'cashscript'
import { InputGroup, Form, Button } from 'react-bootstrap'
// import { QRFunc } from 'react-qrbtf'
import { readAsType } from './shared'
import InfoUtxos from './InfoUtxos'

interface Props {
  artifact?: Artifact
  contract?: Contract
  setContract: (contract?: Contract) => void
  network: Network
  setNetwork: (network: Network) => void
  setShowWallets: (showWallets: boolean) => void
}

const ContractCreation: React.FC<Props> = ({ artifact, contract, setContract, network, setNetwork, setShowWallets }) => {
  const [args, setArgs] = useState<Argument[]>([])
  const [balance, setBalance] = useState<bigint | undefined>(undefined)
  const [utxos, setUtxos] = useState<Utxo[] | undefined>([])

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
      setUtxos(await contract.getUtxos())
    }
    updateBalance()
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
      const newContract = new Contract(artifact, args, { provider })
      setContract(newContract)
    } catch (e: any) {
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
      <h2>{artifact?.contractName} <button onClick={() => setShowWallets(true)} style={{ float: 'right', border: 'none', backgroundColor: 'transparent', outline: 'none' }}>⇆</button></h2>
      {constructorForm}
      {contract !== undefined && balance !== undefined &&
        <div style={{ margin: '5px', width: '100%' }}>
          <div style={{ float: 'left', width: '70%' }}>
            <strong>Contract address (p2sh32)</strong>
            <p>{contract.address}</p>
            <strong>Contract token address (p2sh32)</strong>
            <p>{contract.tokenAddress}</p>
            <strong>Contract utxos</strong>
            <p>{utxos?.length} {utxos?.length == 1 ? "utxo" : "utxos"}</p>
            <details>
              <summary>Show utxos</summary>
              <div>
                <InfoUtxos utxos={utxos}/>
              </div>
            </details>
            <strong>Total contract balance</strong>
            <p>{balance.toString()} satoshis</p>
            <strong>Contract size</strong>
            <p>{contract.bytesize} bytes (max 520), {contract.opcount} opcodes (max 201)</p>
          </div>
          {/* <div style={{ float: 'left', width: '30%', paddingTop: '4%' }}>
            <QRFunc value={contract.address} />
          </div> */}
        </div>
      }
    </div>
  )
}

export default ContractCreation
