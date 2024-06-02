// Components
import React, { useState } from 'react';
import { Artifact, Network, Contract, Utxo } from 'cashscript';
import Header from './Header'
import Main from './Main'
import Footer from './Footer';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import WalletInfo from './Wallets';
import { Wallet } from './shared';
import NewContract from './NewContract';

function App() {
  const [network, setNetwork] = useState<Network>('chipnet')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[] | undefined>(undefined);
  const [contract, setContract] = useState<Contract | undefined>(undefined)
  const [utxos, setUtxos] = useState<Utxo[] | undefined>(undefined)
  const [balance, setBalance] = useState<bigint | undefined>(undefined)

  async function updateUtxosContract () {
    if (!contract) return
    setBalance(await contract.getBalance())
    setUtxos(await contract.getUtxos())
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
            <Main artifacts={artifacts} setArtifacts={setArtifacts} />
          </Tab>
          <Tab eventKey="newcontract" title="New Contract">
            <NewContract artifacts={artifacts} network={network} setNetwork={setNetwork} utxos={utxos} balance={balance} contract={contract} setContract={setContract} updateUtxosContract={updateUtxosContract} />
          </Tab>
          <Tab eventKey="contracts" title="Contracts">
          </Tab>
          <Tab eventKey="wallets" title="Wallets">
            <WalletInfo network={network} wallets={wallets} setWallets={setWallets}/>
          </Tab>
          <Tab eventKey="transactionBuilder" title="TransactionBuilder">
          </Tab>
        </Tabs>
      </div>
      <Footer />
    </>
  );
}

export default App;
