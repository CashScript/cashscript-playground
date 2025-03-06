import React, {useEffect, useState} from 'react'
import { Contract, NetworkProvider, Recipient, SignatureTemplate, TransactionBuilder, Unlocker } from 'cashscript'
import ContractFunction from './ContractFunction'
import { Wallet, ContractInfo, ExplorerString, ContractUtxo, WalletUtxo } from './shared'
import { Button, Card, Form } from 'react-bootstrap'
import TransactionOutputs from './TransactionOutputs'

interface Props {
  provider: NetworkProvider
  wallets: Wallet[]
  updateUtxosContract: (contractName: string) => void
  contracts: ContractInfo[] | undefined
}

const TransactionBuilderPage: React.FC<Props> = ({ provider, wallets, contracts, updateUtxosContract }) => {

  const [enableLocktime, setEnableLocktime] = useState<Boolean>(false)
  const [locktime, setLocktime] = useState<String>("")

  // transaction inputs, not the same as abi.inputs
  const [inputTypes, setInputTypes] = useState<("walletInput" | "contractInput")[]>([])
  const [inputs, setInputs] = useState<(WalletUtxo | ContractUtxo | undefined)[]>([undefined])
  const [inputContractFunctions, setInputContractFunctions] = useState<(String | undefined)[]>([undefined])

  const [outputs, setOutputs] = useState<Recipient[]>([{ to: '', amount: 0n }])
  const [listWalletUtxos, setListWalletUtxos] = useState<WalletUtxo[]>([])
  const [listContractUtxos, setListContractUtxos] = useState<ContractUtxo[]>([])

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

  function addOutput() {
    const outputsCopy = [...outputs]
    outputsCopy.push({ to: '', amount: 0n })
    setOutputs(outputsCopy)
  }
  function removeOutput() {
    const outputsCopy = [...outputs]
    outputsCopy.splice(-1)
    setOutputs(outputsCopy)
  }

  function addInput() {
    const inputsCopy = [...inputs]
    inputsCopy.push(undefined)
    setInputs(inputsCopy)
  }
  function removeInput() {
    const inputsCopy = [...inputs]
    inputsCopy.splice(-1)
    setInputs(inputsCopy)
  }

  async function sendTransaction() {  
    // try to send transaction and alert result
    try {
      // start constructing transaction
      const transaction = new TransactionBuilder({provider})

      // add inputs to transaction in correct order
      for(const input of inputs){
        if(!input) throw new Error("Undefined input provided")
        if('walletIndex' in input){
          const walletIndex = input.walletIndex as number
          const sigTemplate = new SignatureTemplate(wallets[walletIndex].privKey)
          transaction.addInput(input, sigTemplate.unlockP2PKH())
        } else {
          const inputUnlocker = {} as Unlocker
          transaction.addInput(input, inputUnlocker)
        }
      }

      transaction.addOutputs(outputs)
      if(enableLocktime) transaction.setLocktime(Number(locktime))

      // check for mocknet
      if(provider.network == "mocknet"){
        try{
          await transaction.debug()
          alert(`Transaction evalution passed! see Bitauth IDE link in console`)
        } catch(error) {
          const errorMessage = typeof error == "string" ? error : (error as Error)?.message
          const cashscriptError = errorMessage.split("Bitauth")[0]
          console.error(errorMessage)
          alert(`Transaction evalution failed with the following message: \n\n${cashscriptError} See Bitauth IDE link in console`)
        }
        
        console.log(`Transaction evalution passed! Bitauth IDE link: ${await transaction.bitauthUri()}`)
      } else {
        const { txid } = await transaction.send()
        alert(`Transaction successfully sent! see explorer link in console`)
        console.log(`Transaction successfully sent: ${ExplorerString[provider.network]}/tx/${txid}`)
      }
      // TODO: update utxos if using real network
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
      color: '#000',
      margin: "16px"
    }}>
      <h2>TransactionBuilder</h2>
      <Form style={{ marginTop: '10px', marginBottom: '5px' }}>
        <Form.Check
          type="switch"
          id={"noAutomaticChange"}
          label="Enable Transansaction Locktime"
          className='primary'
          style={{ display: "inline-block" }}
          onChange={() => setEnableLocktime(!enableLocktime)}
        />
        
        { enableLocktime && <Form.Control size="sm"
          placeholder="locktime"
          aria-label="locktime"
          style={{ width: "350px", display: "inline-block", marginLeft: "10px" }}
          onChange={(event) => setLocktime(event.target.value)}
        />}
      </Form>

      <div style={{marginBottom: "10px"}}> Add Inputs and Outputs to build the transaction:</div>

      <Card style={{ marginBottom: '10px' }}>
          <Card.Header>Inputs{' '}
            <Button variant="outline-secondary" size="sm" disabled={inputs.length <= 1} onClick={removeInput}>-</Button>
              {' ' + inputs.length + ' '}
            <Button variant="outline-secondary" size="sm" onClick={addInput}>+</Button>
          </Card.Header>
          <Card.Body>
            {inputFields}
          </Card.Body>
      </Card>

      <Card style={{ marginBottom: '10px' }}>
          <Card.Header>Outputs{' '}
            <Button variant="outline-secondary" size="sm" disabled={outputs.length <= 1} onClick={removeOutput}>-</Button>
              {' ' + outputs.length + ' '}
            <Button variant="outline-secondary" size="sm" onClick={addOutput}>+</Button>
          </Card.Header>
          <Card.Body>
            <TransactionOutputs outputs={outputs} setOutputs={setOutputs}/>
          </Card.Body>
      </Card>

      <Button variant="secondary" style={{ display: "block" }} size="sm" onClick={sendTransaction}>
        { provider.network === "mocknet" ? "Evaluate" : "Send" }
      </Button>
    </div>
  )
}

export default TransactionBuilderPage
