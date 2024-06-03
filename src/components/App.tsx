// Components
import React, { useState } from 'react';
import { Artifact, Network } from 'cashscript';
import Header from './Header'
import Main from './Main'
import Footer from './Footer';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import WalletInfo from './Wallets';
import { Wallet, ContractInfo } from './shared';
import NewContract from './NewContract';
import Contracts from './Contracts';
import TransactionBuilder from './TransactionBuilder';

function App() {
  const [network, setNetwork] = useState<Network>('chipnet')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[] | undefined>(undefined);
  const [contracts, setContracts] = useState<ContractInfo[] | undefined>(undefined)
  const [code, setCode] = useState<string>(
`pragma cashscript >= 0.8.0;
    
contract TransferWithTimeout(pubkey sender, pubkey recipient, int timeout) {
    // Require recipient's signature to match
    function transfer(sig recipientSig) {
        require(checkSig(recipientSig, recipient));
    }
    
    // Require timeout time to be reached and sender's signature to match
    function timeout(sig senderSig) {
        require(checkSig(senderSig, sender));
        require(tx.time >= timeout);
    }
}
`);

  async function updateUtxosContract (nameContract: string) {
    const contractIndex = contracts?.findIndex(contractInfo => contractInfo.contract.name == nameContract)
    if (contractIndex == undefined) return
    const currentContract = contracts?.[contractIndex].contract
    if (!currentContract) return
    // create a separate lists for utxos and mutate entry
    const utxosList = contracts.map(contract => contract.utxos ?? [])
    const contractUtxos = await currentContract.getUtxos();
    utxosList[contractIndex] = contractUtxos
    // map is the best way to deep clone array of complex objects
    const newContracts: ContractInfo[] = contracts.map((contractInfo,index) => (
      { ...contractInfo, utxos:utxosList[index] }
    ))
    setContracts(newContracts)
  }

  async function updateAllUtxosContracts () {
    if(!contracts) return

    const utxosPromises = contracts.map(contractInfo => {
      const contractUtxos = contractInfo.contract.getUtxos();
      return contractUtxos ?? []
    })
    const utxosContracts = await Promise.all(utxosPromises)
    // map is the best way to deep clone array of complex objects
    const newContracts: ContractInfo[] = contracts.map((contractInfo,index) => (
      { ...contractInfo, utxos:utxosContracts?.[index]}
    ))
    setContracts(newContracts)
  }

  return (
    <>
      <div className="App" style={{ backgroundColor: '#eee', color: '#000', padding: '0px 32px' }}>
        <Header />
        <Tabs
          defaultActiveKey="editor"
          id="uncontrolled-tab-example"
          className="mb-2 mt-4 justify-content-center"
          style={{ display: "inline-flex", marginLeft: "calc(100vw - 1100px)" }}
        >
          <Tab eventKey="editor" title="Editor">
            <Main code={code} setCode={setCode} artifacts={artifacts} setArtifacts={setArtifacts} setContracts={setContracts} updateAllUtxosContracts={updateAllUtxosContracts}/>
          </Tab>
          <Tab eventKey="newcontract" title="New Contract">
            <NewContract artifacts={artifacts} network={network} setNetwork={setNetwork} contracts={contracts} setContracts={setContracts} updateUtxosContract={updateUtxosContract} />
          </Tab>
          <Tab eventKey="contracts" title="Contracts">
            <Contracts contracts={contracts} setContracts={setContracts} updateUtxosContract={updateUtxosContract} />
          </Tab>
          <Tab eventKey="wallets" title="Wallets">
            <WalletInfo network={network} wallets={wallets} setWallets={setWallets}/>
          </Tab>
          <Tab eventKey="transactionBuilder" title="TransactionBuilder">
            <TransactionBuilder network={network} wallets={wallets} contracts={contracts} updateUtxosContract={updateUtxosContract}/>
          </Tab>
        </Tabs>
      </div>
      <Footer />
    </>
  );
}

export default App;
