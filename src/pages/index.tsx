import React from 'react';
import App from '../components/App';
import Head from 'next/head';
// pages/_app.js
import { Roboto_Mono } from 'next/font/google'

// If loading a variable font, you don't need to specify the font weight
const roboto_Mono = Roboto_Mono({ subsets: ['latin'] })

const IndexPage = () => {
  return (
    <div className={roboto_Mono.className}>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>Next-Cashscript-Playground </title>
      </Head>
      <App/>
    </div>
  );
};

export default IndexPage;
