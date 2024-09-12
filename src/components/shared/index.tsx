import styled from '@emotion/styled'
import { Contract, SignatureTemplate, Utxo, ConstructorArgument, Network } from 'cashscript';
import { decodeCashAddress, decodeCashAddressFormatWithoutPrefix } from '@bitauth/libauth';

export const ColumnFlex = styled.div`
  display: flex;
  flex-direction: column;
`
export const RowFlex = styled.div`
  display: flex;
  flex-direction: row;
`

export interface Wallet {
  walletName: string
  privKey: Uint8Array
  privKeyHex: string
  pubKeyHex: string
  pubKeyHashHex: string
  address: string
  testnetAddress: string
  utxos: Utxo[]
}

export interface ContractInfo {
  contract: Contract
  utxos: Utxo[] | undefined
  args: Array<ConstructorArgument | string>
}

export interface NamedUtxo extends Utxo {
  name: string;
  isP2pkh: boolean;
  walletIndex?: number;
}

export interface TinyContractObj {
  contractName: string
  artifactName: string
  network: Network
  args: (string | ConstructorArgument)[]
}

export function readAsType(value: string, type: string) {
  if (type === 'int') {
    try{
      if(value == "-") return "" // don't error on minus sign
      return BigInt(value);
    } catch(error){ 
      alert("Should only have numbers in the integer field")
    }
    return ""
  } else if (type === 'bool') {
    return value === 'true';
  } else if (type === 'sig') {
    try {
      return new SignatureTemplate(value);
    } catch (e) {
      return value;
    }
  } else if (type === 'bytes20') {
    let addressInfo;

    if (value.startsWith('bitcoincash:') || value.startsWith('bchtest:')) {
      addressInfo = decodeCashAddress(value);
    } else if(value.startsWith('q') || value.startsWith('p')) {
      addressInfo = decodeCashAddressFormatWithoutPrefix(value, ['bitcoincash', 'bchtest']);
    }

    if (addressInfo === undefined || typeof addressInfo === 'string') {
      return value;
    }

    return addressInfo.payload;
  } else {
    return value;
  }
}

export function readAsConstructorType(value: string, type: string) {
  if (type === 'int') {
    try{
      if(value == "-") return "" // don't error on minus sign
      return BigInt(value);
    } catch(error){ 
      alert("Should only have numbers in the integer field")
    }
    return ""
  } else if (type === 'bool') {
    return value === 'true';
  } else if (type === 'bytes20') {
    let addressInfo;

    if (value.startsWith('bitcoincash:') || value.startsWith('bchtest:')) {
      addressInfo = decodeCashAddress(value);
    } else if(value.startsWith('q') || value.startsWith('p')) {
      addressInfo = decodeCashAddressFormatWithoutPrefix(value, ['bitcoincash', 'bchtest']);
    }

    if (addressInfo === undefined || typeof addressInfo === 'string') {
      return value;
    }

    return addressInfo.payload;
  } else {
    return value;
  }
}

export const ExplorerString = {
  mainnet: 'https://explorer.bitcoin.com/bch',
  testnet: 'http://testnet.imaginary.cash',
  staging: 'https://testnet4.imaginary.cash',
  testnet3: 'http://testnet.imaginary.cash',
  testnet4: 'https://testnet4.imaginary.cash',
  chipnet: 'https://chipnet.imaginary.cash',
  regtest: ''
}
