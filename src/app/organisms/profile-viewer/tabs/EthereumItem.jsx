import React, { useState, useEffect } from 'react';
import $ from 'jquery';

import { getWeb3Cfg } from '@src/util/web3';

// Ethereum Wallets
/* 
  const timeDiv = $('<div>', { class: 'very-small text-bg-low' }).text('Updated at...');

  getUserBalance(chain, ethereum.address)
    .then((data) => {
      if (data) {
        balanceDiv.text(`${data.value} ${web3Cfg.networks[chain]?.nativeCurrency?.symbol}`);
        timeDiv.text(`Updated at ${data.date.fromNow()}`);
      }
    })
    .catch((err) => {
      balanceDiv.text('ERROR!');
      console.error(err);
    });

    balanceDiv;
    timeDiv;
*/
export default function EthereumProfileTabItem({ chain, ethereum }) {
  const web3Cfg = getWeb3Cfg();

  return (
    <div className="col-md-6 mt-3">
      <div className="border border-bg p-3">
        <div className="fw-bold">
          <i
            className={`me-2 cf cf-${web3Cfg.networks[chain]?.nativeCurrency?.symbol ? web3Cfg.networks[chain]?.nativeCurrency?.symbol.toLowerCase() : ''}`}
          ></i>
          {web3Cfg.networks[chain]?.chainName}
        </div>

        <a
          href={`${web3Cfg.networks[chain]?.blockExplorerUrls[0]}address/${ethereum.address}`}
          target="_blank"
        >
          {`?.?? ${web3Cfg.networks[chain]?.nativeCurrency?.symbol}`}
        </a>
      </div>
    </div>
  );
}
