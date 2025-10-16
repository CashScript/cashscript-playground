import React, {useState} from 'react'
import { NetworkProvider, Recipient, SignatureTemplate, TransactionBuilder, Unlocker } from 'cashscript'
import { Wallet, ContractInfo, ExplorerString, ContractUtxo, WalletUtxo } from './shared'
import { Button, Card, Form } from 'react-bootstrap'
import TransactionOutputs from './TransactionOutputs'
import TransactionInputs from './TransactionInputs'

interface Props {
  provider: NetworkProvider
  wallets: Wallet[]
  updateUtxosContract: (contractName: string) => void
  contracts: ContractInfo[] | undefined
}

const TransactionBuilderPage: React.FC<Props> = ({ provider, wallets, contracts, updateUtxosContract }) => {

  const [enableLocktime, setEnableLocktime] = useState<Boolean>(false)
  const [locktime, setLocktime] = useState<String>("")

  const [inputs, setInputs] = useState<(WalletUtxo | ContractUtxo | undefined)[]>([undefined])
  const [inputUnlockers, setInputUnlockers] = useState<Unlocker[]>([])
  const [outputs, setOutputs] = useState<Recipient[]>([{ to: '', amount: 0n }])

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

      // add inputs to transaction in the user-defined order
      inputs.forEach((input, inputIndex) => {
        if(!input) throw new Error("Undefined input provided")
        if('walletIndex' in input){
          const walletIndex = input.walletIndex
          const sigTemplate = new SignatureTemplate(wallets[walletIndex].privKey)
          transaction.addInput(input, sigTemplate.unlockP2PKH())
        } else {
          const inputUnlocker = inputUnlockers[inputIndex]
          transaction.addInput(input, inputUnlocker)
        }
      })

      transaction.addOutputs(outputs)
      if(enableLocktime) transaction.setLocktime(Number(locktime))

      // check for mocknet
      if(provider.network == "mocknet"){
        try{
          transaction.debug()
          alert(`Transaction evalution passed! see Bitauth IDE link in console`)
        } catch(error) {
          const errorMessage = typeof error == "string" ? error : (error as Error)?.message
          const cashscriptError = errorMessage.split("Bitauth")[0]
          console.error(errorMessage)
          alert(`Transaction evalution failed with the following message: \n\n${cashscriptError} See Bitauth IDE link in console`)
        }
        console.log(`Bitauth IDE link: ${transaction.getBitauthUri()}`)
      } else {
        const { txid } = await transaction.send()
        alert(`Transaction successfully sent! see explorer link in console`)
        console.log(`Transaction successfully sent: ${ExplorerString[provider.network]}/tx/${txid}`)
      }
      if(provider.network !== "mocknet"){
        inputs.forEach((input) => {
          if(input && 'contract' in input) updateUtxosContract(input.contract.name)
        })
      }
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
          <TransactionInputs inputs={inputs} setInputs={setInputs} wallets={wallets} contracts={contracts} inputUnlockers={inputUnlockers} setInputUnlockers={setInputUnlockers} />
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
