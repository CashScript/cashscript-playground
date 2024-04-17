import React, { useState, useEffect } from 'react'
import { Contract, AbiFunction, Argument, Network, Recipient, SignatureTemplate, ElectrumNetworkProvider, Utxo } from 'cashscript'
import { Form, InputGroup, Button, Card } from 'react-bootstrap'
import { readAsType, ExplorerString, Wallet, NamedUtxo } from './shared'

interface Props {
  contract?: Contract
  abi?: AbiFunction
  network: Network
  wallets: Wallet[]
  updateUtxosContract: () => void
}

const ContractFunction: React.FC<Props> = ({ contract, abi, network, wallets, updateUtxosContract }) => {
  const [args, setArgs] = useState<Argument[]>([])
  const [outputs, setOutputs] = useState<Recipient[]>([{ to: '', amount: 0n }])
  // transaction inputs, not the same as abi.inputs
  const [inputs, setInputs] = useState<NamedUtxo[]>([{ txid: '', vout: 0, satoshis: 0n, name: ``, isP2pkh: false }])
  const [manualSelection, setManualSelection] = useState<boolean>(false)
  const [outputHasFT, setOutputHasFT] = useState<boolean[]>([])
  const [outputHasNFT, setOutputHasNFT] = useState<boolean[]>([])
  const [noAutomaticChange, setNoAutomaticChange] = useState<boolean>(false)
  const [utxoList, setUtxoList] = useState<NamedUtxo[]>([])

  useEffect(() => {
    // Set empty strings as default values
    const newArgs = abi?.inputs.map(() => '') || [];
    setArgs(newArgs);
  }, [abi])

  useEffect(() => {
    if (!manualSelection) return;
    async function updateUtxos() {
      if (contract === undefined) return
      const utxosContract = await contract.getUtxos()
      console.log(utxosContract)
      const namedUtxosContract: NamedUtxo[] = utxosContract.map((utxo, index) => ({ ...utxo, name: `Contract UTXO ${index}`, isP2pkh: false }))
      let newUtxoList = namedUtxosContract
      for (let i = 0; i < wallets.length; i++) {
        const utxosWallet = await new ElectrumNetworkProvider(network).getUtxos(wallets[i].address);
        const namedUtxosWallet: NamedUtxo[] = utxosWallet.map((utxo, index) => ({ ...utxo, name: `${wallets[i].walletName} UTXO ${index}`, isP2pkh: true, walletIndex: i }))
        newUtxoList = newUtxoList.concat(namedUtxosWallet)
      }
      setUtxoList(newUtxoList);
    }
    updateUtxos()
  }, [manualSelection])

  function fillPrivKey(i: number, walletIndex: string) {
    const argsCopy = [...args];
    // if no wallet is selected in select form
    if (isNaN(Number(walletIndex))) argsCopy[i] = ''
    else {
      argsCopy[i] = new SignatureTemplate(wallets[Number(walletIndex)].privKey);
    }
    setArgs(argsCopy);
  }

  function selectInput(i: number, inputIndex: string) {
    const inputsCopy = [...inputs];
    // if no input is selected in select form
    if (isNaN(Number(inputIndex))) inputsCopy[i] = { txid: '', vout: 0, satoshis: 0n, name: ``, isP2pkh: false }
    else {
      inputsCopy[i] = utxoList[Number(inputIndex)];
    }
    setInputs(inputsCopy);
  }

  const argumentFields = abi?.inputs.map((input, i) => (
    <InputGroup key={`${input.name}-parameter-${i}`}>
      {input.type === 'sig' ? (
        <><Form.Control size="sm" id={`${input.name}-parameter-${i}`} disabled
          placeholder={`${input.type} ${input.name}`}
          aria-label={`${input.type} ${input.name}`}
        />
          <Form.Control as="select" size="sm" onChange={event => fillPrivKey(i, event.target.value)}>
            <option className="text-center" key={`NaN`} value={`NaN`}>select wallet</option>
            {wallets.map((wallet, walletIndex) => (
              <option className="text-center" key={`${walletIndex + wallet.walletName}`} value={`${walletIndex}`}>{wallet.walletName}</option>
            ))}
          </Form.Control></>
      ) : (
        <Form.Control size="sm" id={`${input.name}-parameter-${i}`}
          placeholder={`${input.type} ${input.name}`}
          aria-label={`${input.type} ${input.name}`}
          onChange={(event) => {
            const argsCopy = [...args];
            argsCopy[i] = readAsType(event.target.value, input.type);
            setArgs(argsCopy);
          }}
        />
      )}
    </InputGroup>
  )) || []

  const inputFields = [...Array(inputs.length)].map((element, i) => (
    <div key={`${abi?.name}-input-${i}`}>
      {`Input #${i}`}
      <InputGroup>
        <Form.Control size="sm"
          placeholder={i === 0 ? "contract UTXO" : "Add input"}
          aria-label={i === 0 ? "contract UTXO" : "Add input"}
          disabled
        />
        <Form.Control onChange={event => selectInput(i, event.target.value)} as="select" size="sm" >
          <option className="text-center" key='Nan' value={`NaN`}>select UTXO</option>
          {utxoList.map((utxo, inputIndex) => (
            <option className="text-center" key={`${inputIndex + utxo.name}`} value={`${inputIndex}`}> {utxo.name} </option>
          ))}
        </Form.Control>
      </InputGroup>
    </div>
  ))

  const tokenFields = (index: number) => (
    <>
    <InputGroup key={`output-${index}-tokens`}>
      <Form.Control size="sm"
        placeholder="Token Category"
        aria-label="Token Category"
        onChange={(event) => {
          const outputsCopy = [...outputs]
          const output = outputsCopy[index]
          const amount = output.token?.amount || 0n
          const category = event.target.value
          output.token = {...output.token, amount, category}
          outputsCopy[index] = output
          setOutputs(outputsCopy)
        }}
      />
      <Form.Control size="sm"
        placeholder="Amount Fungible Tokens"
        aria-label="Amount Fungible Tokens"
        onChange={(event) => {
          const outputsCopy = [...outputs]
          const output = outputsCopy[index]
          const category = output.token?.category || ""
          const amount = BigInt(event.target.value)
          output.token = {...output.token, amount, category}
          outputsCopy[index] = output
          setOutputs(outputsCopy)
        }}
      />
    </InputGroup>
    {outputHasNFT[index] ? (
        <div>
          <InputGroup key={`output-${index}-NFT`}>
            <Form.Control size="sm"
              placeholder="Token Commitment"
              aria-label="Token Commitment"
              onChange={(event) => {
                const outputsCopy = [...outputs]
                const output = outputsCopy[index]
                const capability = output.token?.nft?.capability || "none"
                const commitment = event.target.value
                if(!output.token) output.token = {amount: 0n , category:""}
                output.token.nft = {capability, commitment}
                outputsCopy[index] = output
                setOutputs(outputsCopy)
              }}
            />
            <Form.Control size="sm" id="capability-selector"
              key={`output-${index}-capability-selector`}
              as="select"
              onChange={(event) => {
                const outputsCopy = [...outputs]
                const output = outputsCopy[index]
                const commitment = output.token?.nft?.commitment || ""
                const capability= event.target.value
                if(capability != "none" && capability != "minting" && capability != "mutable") return
                if(!output.token) output.token = {amount: 0n , category:""}
                output.token.nft = {capability, commitment}
                outputsCopy[index] = output
                setOutputs(outputsCopy)
              }}
            >
              <option>Select Capability</option>
              <option value={"none"}>none</option>
              <option value={"minting"}>minting</option>
              <option value={"mutable"}>mutable</option>
            </Form.Control>
          </InputGroup>
        </div>)
        : null}
    </>
  )
  
  // Set outputHasNFT to false for an output if outputHasFT is false for that output
  useEffect(() => {
    outputHasNFT.forEach((hasNFT, index) => {
      if(hasNFT && !outputHasFT[index]) {
        const arrayCopy = [...outputHasNFT]
          arrayCopy[index] = false
          setOutputHasNFT(arrayCopy)
      }
    })
  }, [outputHasFT])

  const outputFields = outputs.map((output, index) => (
    <div  key={`${abi?.name}-output-${index}`}>
      {`Output #${index}`}
      <div>
        <InputGroup>
          <Form.Control size="sm"
            placeholder="Receiver address"
            aria-label="Receiver address"
            onChange={(event) => {
              const outputsCopy = [...outputs]
              const output = outputsCopy[index]
              output.to = event.target.value
              outputsCopy[index] = output
              setOutputs(outputsCopy)
            }}
          />
          <Form.Control size="sm"
            placeholder="Satoshi amount"
            aria-label="Satoshi amount"
            onChange={(event) => {
              const outputsCopy = [...outputs]
              const output = outputsCopy[index]
              output.amount = BigInt(event.target.value)
              outputsCopy[index] = output
              setOutputs(outputsCopy)
            }}
          />
        </InputGroup>
      </div>
      <Form style={{ marginTop: '5px', marginBottom: '5px', display: "inline-block" }}>
        <Form.Check
          type="switch"
          id={"outputHasFT" + abi?.name + "index" + index}
          label="add tokens to output"
          onChange={() => {
            const oldValue = outputHasFT[index]
            const arrayCopy = [...outputHasFT]
            arrayCopy[index] = !oldValue
            setOutputHasFT(arrayCopy)
          }}
        />
      </Form>
      {outputHasFT[index] ? (
        <Form style={{ marginLeft: '25px', display: "inline-block" }}>
          <Form.Check
            type="switch"
            id={"outputHasNFT" + abi?.name + "index" + index}
            label="add NFT to output"
            onChange={() => {
              const oldValue = outputHasNFT[index]
              const arrayCopy = [...outputHasNFT]
              arrayCopy[index] = !oldValue
              setOutputHasNFT(arrayCopy)
            }}
          />
        </Form>)
        : null}
      {outputHasFT[index] ? (
        <div style={{marginBottom:"10px"}}>
          {tokenFields(index)}
        </div>)
        : null}
    </div>
  ))

  async function sendTransaction() {
    if (!contract || !abi) return

    // try to send transaction and alert result
    try {
      // first step of constructing transaction
      const transaction = contract.functions[abi.name](...args)

      // if manualSelection is enabled, add the selected inputs
      const contractInputs = inputs.filter(input => !input.isP2pkh)
      let p2pkhInputs = inputs.filter(input => input.isP2pkh)
      if (manualSelection) {
        transaction.from(contractInputs)
        p2pkhInputs.forEach(p2pkhInput => {
          if(p2pkhInput !== undefined && p2pkhInput.walletIndex !== undefined){
            transaction.fromP2PKH(p2pkhInput, new SignatureTemplate(wallets[p2pkhInput.walletIndex].privKey))
          }
        })
      }

      // if noAutomaticChange is enabled, add this to the transaction in construction
      if (noAutomaticChange) transaction.withoutChange().withoutTokenChange()
      transaction.to(outputs)
      const { txid } = await transaction.send()

      alert(`Transaction successfully sent: ${ExplorerString[network]}/tx/${txid}`)
      console.log(`Transaction successfully sent: ${ExplorerString[network]}/tx/${txid}`)
      updateUtxosContract()
    } catch (e: any) {
      alert(e.message)
      console.error(e.message)
    }
  }

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
    inputsCopy.push({ txid: '', vout: 0, satoshis: 0n, name: ``, isP2pkh: false })
    setInputs(inputsCopy)
  }
  function removeInput() {
    const inputsCopy = [...inputs]
    inputsCopy.splice(-1)
    setInputs(inputsCopy)
  }

  return (
    <div>
      {contract &&
        <Card style={{ marginBottom: '10px' }}>
          <Card.Header>{abi?.name}</Card.Header>
          <Card.Body>
            <Card.Subtitle style={{ marginBottom: '5px' }}>Arguments</Card.Subtitle>
            <div>
              {argumentFields}
            </div>
            <Form style={{ marginTop: '10px', marginBottom: '5px' }}>
              <Form.Check
                type="switch"
                id={abi?.name}
                label="manual UTXO selection"
                onChange={() => setManualSelection(!manualSelection)}
              />
            </Form>
            {manualSelection ? (
              <><Card.Subtitle style={{ marginTop: '10px', marginBottom: '5px' }}>
                Transaction inputs{' '}
                <Button variant="outline-secondary" size="sm" disabled={inputs.length <= 1} onClick={removeInput}>-</Button>
                {' ' + inputs.length + ' '}
                <Button variant="outline-secondary" size="sm" onClick={addInput}>+</Button>
              </Card.Subtitle>
              {inputFields}</>
            ) : null}
            <Form style={{ marginTop: '10px', marginBottom: '5px' }}>
              <Form.Check
                type="switch"
                id={"noAutomaticChange" + abi?.name}
                label="disable automatic change output"
                onChange={() => setNoAutomaticChange(!noAutomaticChange)}
              />
            </Form>
            <Card.Subtitle style={{ marginTop: '10px', marginBottom: '5px' }}>
              Transaction outputs{' '}
              <Button variant="outline-secondary" size="sm" disabled={outputs.length <= 1} onClick={removeOutput}>-</Button>
              {' ' + outputs.length + ' '}
              <Button variant="outline-secondary" size="sm" onClick={addOutput}>+</Button>
            </Card.Subtitle>
            {outputFields}
            <Button variant="secondary" style={{ display: "block" }} size="sm" onClick={sendTransaction}>Send</Button>
          </Card.Body>
        </Card>
      }
    </div>
  )
}

export default ContractFunction
