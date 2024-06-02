import React, {useState} from 'react'
import { Artifact, Contract, Network, Utxo } from 'cashscript'
import ContractFunctions from './ContractFunctions';
import { Wallet } from './shared'
import { Form } from 'react-bootstrap'

interface Props {
  artifacts?: Artifact[]
  network: Network
  wallets: Wallet[]
  utxos: Utxo[] | undefined
  updateUtxosContract: () => void
  contracts: Contract[] | undefined
}

const TransactionBuilder: React.FC<Props> = ({ network, wallets, contracts, utxos, updateUtxosContract }) => {

  const [selectedContract, setSelectedContract] = useState<Contract | undefined>(undefined);

  const contractSelector = (
    <Form.Control size="sm" id="artifact-selector" style={{width:"350px", display:"inline-block"}}
      as="select"
      value={selectedContract?.address ?? "select"}
      onChange={(event) => {
        const contractAddress = event.target.value
        const newSelectedContract = contracts?.find(contract => contract?.address === contractAddress)
        setSelectedContract(newSelectedContract)
      }}
    >
      <option>--- select ---</option> 
      {contracts?.map(contract => (
        <option key={contract.address}>
          {contract.address}
        </option>
      ))}
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
      <h2>TransactionBuilder</h2>
      <div style={{margin: "10px 0"}}>
        <span>Select Contract:</span> {contractSelector}
      </div>
      {selectedContract !== undefined ?
        <ContractFunctions contract={selectedContract} network={network} wallets={wallets} contractUtxos={utxos} updateUtxosContract={updateUtxosContract} />
        : <div>No contract initialised yet...</div>
      }
    </div>
  )
}

export default TransactionBuilder
