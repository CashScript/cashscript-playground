import React, {useState} from 'react'
import { Network } from 'cashscript'
import ContractFunctions from './ContractFunctions';
import { Wallet, ContractInfo } from './shared'
import { Form } from 'react-bootstrap'

interface Props {
  network: Network
  wallets: Wallet[]
  updateUtxosContract: (contractName: string) => void
  contracts: ContractInfo[] | undefined
}

const TransactionBuilder: React.FC<Props> = ({ network, wallets, contracts, updateUtxosContract }) => {

  const [selectedContract, setSelectedContract] = useState<ContractInfo | undefined>(undefined);

  const contractSelector = (
    <Form.Control size="sm" id="artifact-selector" style={{width:"350px", display:"inline-block"}}
      as="select"
      value={selectedContract?.contract.name ?? "select"}
      onChange={(event) => {
        const contractName = event.target?.value
        const newSelectedContract = contracts?.find(contractInfo => contractInfo.contract?.name === contractName)
        setSelectedContract(newSelectedContract)
      }}
    >
      <option>--- select ---</option> 
      {contracts?.map(contractInfo => (
        <option key={contractInfo.contract.name} value={contractInfo.contract.name}>
          {contractInfo.contract.name} {`(${contractInfo.contract.address.slice(0, 20)}...)`}
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
      {contracts?.length ?
        <><span>Select Contract:</span> {contractSelector}</>
        : <div>No contract initialised yet...</div>
      }
      </div>
      {selectedContract !== undefined ?
        <ContractFunctions contractInfo={selectedContract} network={network} wallets={wallets} updateUtxosContract={updateUtxosContract} />
        : null
      }
    </div>
  )
}

export default TransactionBuilder
