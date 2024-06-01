import React, { useState, useEffect } from 'react'
import { Artifact, Contract, Argument, Network, ElectrumNetworkProvider, Utxo } from 'cashscript'
import { InputGroup, Form, Button } from 'react-bootstrap'
// import { QRFunc } from 'react-qrbtf'
import { readAsType } from './shared'
import CopyText from './shared/CopyText'
import InfoUtxos from './InfoUtxos'

interface Props {
  artifact?: Artifact
  contract?: Contract
  setContract: (contract?: Contract) => void
  network: Network
  setNetwork: (network: Network) => void
  utxos: Utxo[] | undefined
  balance: bigint | undefined
  updateUtxosContract: () => void
}

const ContractCreation: React.FC<Props> = ({ artifact, contract, setContract, network, setNetwork, balance, utxos, updateUtxosContract}) => {
  const [args, setArgs] = useState<Argument[]>([])

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
    (<>
      <InputGroup size="sm">{inputFields}</InputGroup>
      <p style={{margin: "4px 0"}}>And select target Network:</p>
      <InputGroup style={{width:"350px"}}>
        {networkSelector}
        {createButton}
      </InputGroup>
    </>)

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
      height: 'calc(100vh - 170px)',
      border: '2px solid black',
      borderBottom: '1px solid black',
      fontSize: '100%',
      lineHeight: 'inherit',
      overflow: 'auto',
      background: '#fffffe',
      padding: '8px 16px',
      color: '#000'
    }}>
      <h2>{artifact?.contractName}</h2>
      <p>Initialise contract by providing contract arguments:</p>
      {constructorForm}
      {contract !== undefined &&
        <div style={{ margin: '5px', width: '100%' }}>
          <div style={{ float: 'left', width: '70%' }}>
            <strong>Contract address (p2sh32)</strong>
            <CopyText>{contract.address}</CopyText>
            <strong>Contract token address (p2sh32)</strong>
            <CopyText>{contract.tokenAddress}</CopyText>
            <strong>Contract utxos</strong>
            {utxos == undefined? 
              <p>loading ...</p>:
              (<>
              <p>{utxos.length} {utxos.length == 1 ? "utxo" : "utxos"}</p>
              {utxos.length ? 
                <details>
                  <summary>Show utxos</summary>
                  <div>
                    <InfoUtxos utxos={utxos}/>
                  </div>
              </details> : null}
              </>)
            }
            <strong>Total contract balance</strong>
            {balance == undefined? 
              <p>loading ...</p>:
              <p>{balance.toString()} satoshis</p>
            }
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
