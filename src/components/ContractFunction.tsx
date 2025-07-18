import React, { useState, useEffect } from 'react'
import { AbiFunction, FunctionArgument, SignatureTemplate, Contract, Unlocker } from 'cashscript'
import { Form, InputGroup, Card } from 'react-bootstrap'
import { readAsType, Wallet } from './shared'

interface Props {
  contract: Contract
  abi: AbiFunction
  wallets: Wallet[]
  setInputUnlocker: (unlocker: Unlocker) => void
}

const ContractFunction: React.FC<Props> = ({ contract, abi, wallets, setInputUnlocker }) => {
  const [functionArgs, setFunctionArgs] = useState<FunctionArgument[]>([])

  useEffect(() => {
    // Set default placeholder values for function arguments
    const newArgs = abi?.inputs.map((functionArg) => functionArg.type == 'int' ? 0n : (
      functionArg.type == 'bool' ? false :'')) || [];
    setFunctionArgs(newArgs);
    setInputUnlocker(contract.unlock[abi.name](...newArgs));
  }, [abi])


  function fillPrivKey(i: number, walletIndex: string) {
    const argsCopy = [...functionArgs];
    // if no wallet is selected in select form
    if (isNaN(Number(walletIndex))) argsCopy[i] = ''
    else {
      argsCopy[i] = new SignatureTemplate(wallets[Number(walletIndex)].privKey);
    }
    setFunctionArgs(argsCopy);
    setInputUnlocker(contract.unlock[abi.name](...argsCopy));
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
            const argsCopy = [...functionArgs];
            argsCopy[i] = readAsType(event.target.value, input.type);
            setFunctionArgs(argsCopy);
            setInputUnlocker(contract.unlock[abi.name](...argsCopy))
          }}
        />
      )}
    </InputGroup>
  )) || []


  return (
    <div>
      {contract &&
        <Card style={{ marginBottom: '10px' }}>
          <Card.Body>
            <div style={{ marginBottom: '5px' }}>
              Unlocking Arguments ({contract.artifact.contractName + ' - ' + abi?.name})
              </div>
            <div>
              {argumentFields}
            </div>
          </Card.Body>
        </Card>
      }
    </div>
  )
}

export default ContractFunction
