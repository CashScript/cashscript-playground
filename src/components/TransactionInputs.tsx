import React, {useEffect, useState} from 'react'
import { Contract } from 'cashscript'
import { Form, } from 'react-bootstrap'
import { ContractInfo, ContractUtxo, Wallet, WalletUtxo } from './shared'
import ContractFunction from './ContractFunction'

interface Props {
  inputs: (WalletUtxo | ContractUtxo | undefined)[]
  setInputs: (inputs: (WalletUtxo | ContractUtxo | undefined)[]) => void
  wallets: Wallet[]
  contracts: ContractInfo[] | undefined
}

const TransactionInputs: React.FC<Props> = ({ inputs, setInputs, wallets, contracts }) => {

  const [inputTypes, setInputTypes] = useState<("walletInput" | "contractInput")[]>([])
  const [listWalletUtxos, setListWalletUtxos] = useState<WalletUtxo[]>([])
  const [listContractUtxos, setListContractUtxos] = useState<ContractUtxo[]>([])
  const [inputContractFunctions, setInputContractFunctions] = useState<(String | undefined)[]>([undefined])

  // update listWalletUtxos & listContractUtxos on initial render and on state changes
  useEffect(() => {
    async function updateUtxos() {
      const contractsWithUtxos = contracts?.filter(contractInfo =>contractInfo.utxos) ?? []
      const contractUtxos = contractsWithUtxos?.map(contractInfo => 
        contractInfo!.utxos!.map((utxo, index) => ({ 
          ...utxo,
          name: `${contractInfo.contract.name} UTXO ${index}`,
          contract: contractInfo.contract
        }))
      ) ?? []
      const namedUtxosContracts: ContractUtxo[] = contractUtxos.flat()
      let namedUtxosWallets: WalletUtxo[] = []
      const walletUtxos = wallets.map(wallet => wallet?.utxos ?? [])
      for (let i = 0; i < (walletUtxos?.length ?? 0); i++) {
        const utxosWallet = walletUtxos?.[i];
        if(!utxosWallet) continue
        const namedUtxosWallet: WalletUtxo[] = utxosWallet.map((utxo, index) => (
          { ...utxo, name: `${wallets[i].walletName} UTXO ${index}`, walletIndex: i }
        ))
        namedUtxosWallets = namedUtxosWallets.concat(namedUtxosWallet);
      }
      setListContractUtxos(namedUtxosContracts);
      setListWalletUtxos(namedUtxosWallets);
    }
    updateUtxos()
  }, [wallets, contracts])

  function setInputContractFunction(i: number, contractFunction: string) {
    const inputContractFunctionsCopy = [...inputContractFunctions]
    inputContractFunctionsCopy[i] = contractFunction !== "--- select ---" ? contractFunction : undefined
    setInputContractFunctions(inputContractFunctionsCopy)
  }

  const getAbiFunction = (inputIndex: number) => {
    const input = inputs?.[inputIndex];
    if (!input || !('contract' in input) || !inputContractFunctions[inputIndex]) throw new Error("No input or contract function selected")
    const abi = input.contract.artifact.abi.find(abifunction => abifunction.name === inputContractFunctions[inputIndex])
    if(!abi) throw new Error("No abi function found")
    return abi;
  };

  function setSelectedInputType(inputType: "walletInput" | "contractInput", inputIndex: number) {
    const inputTypesCopy = [...inputTypes];
    inputTypesCopy[inputIndex] = inputType
    setInputTypes(inputTypesCopy)
    selectInput(inputIndex, "NaN", inputType === "walletInput")
  }

  function selectInput(inputIndex: number, indexUtxoList: string, isWalletInput: boolean) {
    const inputsCopy = [...inputs];
    const inputContractFunctionsCopy = [...inputContractFunctions]
    // if no input is selected in select form
    if (isNaN(Number(indexUtxoList))){
      inputsCopy[inputIndex] = undefined;
      inputContractFunctionsCopy[inputIndex] = undefined
    }
    else {
      const utxoList = isWalletInput ? listWalletUtxos : listContractUtxos
      inputsCopy[inputIndex] = utxoList[Number(indexUtxoList)];
    }
    setInputs(inputsCopy);
    setInputContractFunctions(inputContractFunctionsCopy)
  }

  const functionSelector = (contract: Contract, inputIndex: number) =>(
    <Form.Control
      size="sm"
      id="artifact-selector"
      style={{width:"350px", display:"inline-block", marginTop: '10px', marginBottom: '5px'}}
      onChange={(event) => {
        setInputContractFunction(inputIndex, event.target.value)
      }}
      as="select"
    >
      <option>--- select ---</option> 
      {contract.artifact.abi.map((abi) => (
        <option key={abi.name} value={abi.name}>
          {abi.name}
        </option>
      ))}
    </Form.Control>
  )

  const inputFields = inputs.map((input, index) => (
    <div key={`input-${index}`} style={{marginBottom:"10px"}}>
      {`Input #${index}`}
      <div>
        <Form.Control size="sm" id="artifact-selector" style={{width:"200px", display:"inline-block"}}
          as="select"
          onChange={(event) => {
            setSelectedInputType(event.target.value as "walletInput" | "contractInput", index)
          }}
        >
          <option>--- select ---</option> 
          <option value={"walletInput"}>Wallet input</option>
          <option value={"contractInput"}>Contract input</option>
        </Form.Control>
        <Form.Control
          onChange={event => selectInput(index, event.target.value, inputTypes[index] === "walletInput")}
          as="select"
          style={{ width: 'calc(50% - 210px)', display: 'inline-block', marginLeft: '10px' }}
          size="sm"
        >
          <option className="text-center" value={`NaN`}>select UTXO</option>
          { inputTypes[index] === "walletInput" &&  listWalletUtxos.map((utxo, indexUtxoList) => (
            <option className="text-center" key={`${indexUtxoList + utxo.name}`} value={`${indexUtxoList}`}> {utxo.name} </option>
          ))}
          { inputTypes[index] === "contractInput" &&  listContractUtxos.map((utxo, indexUtxoList) => (
            <option className="text-center" key={`${indexUtxoList + utxo.name}`} value={`${indexUtxoList}`}> {utxo.name} </option>
          ))}
        </Form.Control>
      </div>
      { inputs?.[index] && 'contract' in inputs?.[index] && <div>
        <span style={{margin: "0px 4px"}}>Select Contract Function:</span> {functionSelector(inputs?.[index].contract, index)}
      </div>}
      { inputs?.[index] && 'contract' in inputs?.[index] && inputContractFunctions[index] && getAbiFunction(index) &&
        <ContractFunction contract={inputs?.[index].contract} abi={getAbiFunction(index)} wallets={wallets}/>
      }
    </div>
  ))
  return (<>{inputFields}</>)
}

export default TransactionInputs
