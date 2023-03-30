import React from 'react';
import App from '../components/App';
import Head from 'next/head';

const IndexPage = () => {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <App />
    </>
  );
};

export default IndexPage;
