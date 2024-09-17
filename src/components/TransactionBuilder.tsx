import React, {useEffect, useState} from 'react'
import { AbiFunction, NetworkProvider } from 'cashscript'
import ContractFunction from './ContractFunction';
import { Wallet, ContractInfo } from './shared'
import { Form } from 'react-bootstrap'

interface Props {
  provider: NetworkProvider
  wallets: Wallet[]
  updateUtxosContract: (contractName: string) => void
  contracts: ContractInfo[] | undefined
}

const TransactionBuilder: React.FC<Props> = ({ provider, wallets, contracts, updateUtxosContract }) => {

  const [selectedContract, setSelectedContract] = useState<ContractInfo | undefined>(undefined);
  const [selectedFunction, setSelectedFunction] = useState<AbiFunction | undefined>(undefined);

  useEffect(() => {
    const contractName = selectedContract?.contract.name
    const updatedContract = contracts?.find(contractInfo => contractInfo.contract?.name === contractName)
    if(updatedContract != selectedContract) setSelectedContract(updatedContract)
  }, [contracts])

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

  const functionSelector = (
    <Form.Control size="sm" id="artifact-selector" style={{width:"350px", display:"inline-block"}}
      as="select"
      value={selectedFunction?.name ?? "select"}
      onChange={(event) => {
        if(!selectedContract) return
        const functionName = event.target?.value
        const contractFunction = selectedContract.contract.artifact.abi.find(abiFunction =>
          abiFunction.name == functionName
        )
        setSelectedFunction(contractFunction)
      }}
    >
      <option>--- select ---</option> 
      {selectedContract && selectedContract.contract.artifact.abi.map((abi) => (
        <option key={abi.name} value={abi.name}>
          {abi.name}
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

      <div style={{margin: "10px 0"}}>
      {selectedContract ?
        <><span>Select Contract Function:</span> {functionSelector}</>
        : null
      }
      </div>
      {selectedContract !== undefined && selectedFunction !== undefined ?
        <ContractFunction abi={selectedFunction} contractInfo={selectedContract} provider={provider} wallets={wallets} updateUtxosContract={updateUtxosContract} />
        : null
      }
    </div>
  )
}

export default TransactionBuilder
