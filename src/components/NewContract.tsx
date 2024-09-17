import React, { useState } from 'react'
import { Artifact, NetworkProvider, Network, MockNetworkProvider, ElectrumNetworkProvider } from 'cashscript'
import { Form } from 'react-bootstrap'
import ContractCreation from './ContractCreation';
import { ContractInfo } from './shared'

interface Props {
  artifacts?: Artifact[]
  provider: NetworkProvider
  setProvider: (provider: NetworkProvider) => void
  updateUtxosContract: (contractName: string) => void
  contracts: ContractInfo[] | undefined
  setContracts: (contract: ContractInfo[] | undefined) => void
}

const NewContract: React.FC<Props> = ({ artifacts, provider, setProvider, contracts, setContracts, updateUtxosContract }) => {

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

  function changeNetwork(newNetwork: Network){
    const newprovider = new ElectrumNetworkProvider(newNetwork)
    setProvider(newprovider)
  }

  const networkSelector = (
    <Form.Control size="sm" id="network-selector" style={{width: "350px", display:"inline-block"}}
      as="select"
      value={provider.network}
      onChange={(event) => {
        changeNetwork(event.target.value as Network)
      }}
    >
      <option>chipnet</option>
      <option>testnet3</option>
      <option>testnet4</option>
      <option>mainnet</option>
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
      <h2>New Contract</h2>
      {artifacts?.length ?
        <>
          <div style={{margin: "10px 0"}}>
            <span>Select target Network:</span> {networkSelector}
          </div>
          <p style={{margin: "10px 0"}}>Choose the contract Arifact to use:</p>
          <div style={{margin: "10px 0"}}>
            <span>Select Artifact:</span> {artifactSelector}
          </div>
          {selectedArifact !== undefined ?
            <ContractCreation artifact={selectedArifact} provider={provider} contracts={contracts} setContracts={setContracts} updateUtxosContract={updateUtxosContract} />
            : null
          }
        </>
        : <p> Create an Artifact first.</p>
      }
    </div>
  )
}

export default NewContract
