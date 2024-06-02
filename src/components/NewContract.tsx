import React, { useState } from 'react'
import { Artifact, Contract, Network, Utxo } from 'cashscript'
import { Form } from 'react-bootstrap'
import ContractInfo from './ContractInfo';

interface Props {
  artifacts?: Artifact[]
  network: Network
  setNetwork: (network: Network) => void
  balance: bigint | undefined
  utxos: Utxo[] | undefined
  updateUtxosContract: () => void
  contract: Contract | undefined
  setContract: (contract: Contract | undefined) => void
}

const NewContract: React.FC<Props> = ({ artifacts, network, setNetwork, contract, setContract, utxos, balance, updateUtxosContract }) => {

  const [selectedArifact, setSelectedArtifact] = useState<Artifact | undefined>(undefined);

  const artifactSelector = (
    <Form.Control size="sm" id="artifact-selector" style={{width:"350px", display:"inline-block"}}
      as="select"
      value={selectedArifact?.contractName ?? "select"}
      onChange={(event) => {
        const artifactName = event.target.value
        const newSelectedArifact = artifacts?.find(artifact => artifact?.contractName === artifactName)
        setSelectedArtifact(newSelectedArifact)
      }}
    >
      <option>--- select ---</option> 
      {artifacts?.map(artifact => (
        <option key={artifact.contractName}>
          {artifact.contractName}
        </option>
      ))}
    </Form.Control>
  )

  const networkSelector = (
    <Form.Control size="sm" id="network-selector" style={{width: "350px", display:"inline-block"}}
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
      color: '#000',
      margin: "16px"
    }}>
      <p>Initialise new contract with Arifact and contract constructor arguments:</p>
      {artifacts?.length ?
        <>
          <div style={{margin: "10px 0"}}>
            <span>Select Artifact:</span> {artifactSelector}
          </div>
          <div style={{margin: "10px 0"}}>
            <span>Select target Network:</span> {networkSelector}
          </div>
          {selectedArifact !== undefined ?
            <ContractInfo artifact={selectedArifact} network={network} utxos={utxos} balance={balance} contract={contract} setContract={setContract} updateUtxosContract={updateUtxosContract} />
            : null
          }
        </>
        : <p> Create a Artifact first.</p>
      }
    </div>
  )
}

export default NewContract
