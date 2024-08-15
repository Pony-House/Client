import React, { useState, useEffect } from 'react';

import { ethers } from 'ethers';
import { objType } from 'for-promise/utils/lib.mjs';

import moment from '@src/util/libs/momentjs';
import { getWeb3Cfg } from '@src/util/web3';
import TimeFromNow from '@src/app/atoms/time/TimeFromNow';
import { chainBalance } from './Ethereum';

const getUserBalance = (chain, address) =>
  new Promise((resolve, reject) => {
    // Insert Chain
    if (!chainBalance[chain]) chainBalance[chain] = {};

    // Exist cache?
    if (
      chainBalance[chain][address] &&
      (typeof chainBalance[chain][address].value === 'string' ||
        typeof chainBalance[chain][address].value === 'number')
    ) {
      resolve({
        value: chainBalance[chain][address].value,
        date: chainBalance[chain][address].date,
      });
    }

    // Nope
    else if (objType(tinyCrypto.userProviders, 'object') && tinyCrypto.userProviders.ethereum) {
      tinyCrypto.userProviders[chain]
        .getBalance(address)
        .then((n) => {
          let balance = ethers.formatEther(n);
          if (balance.endsWith('.')) balance = `${balance}00`;

          chainBalance[chain][address] = { value: balance, timeout: 60, date: moment() };
          resolve({
            value: chainBalance[chain][address].value,
            date: chainBalance[chain][address].date,
          });
        })
        .catch(reject);
    } else {
      resolve(null);
    }
  });

export default function EthereumProfileTabItem({ chain, ethereum }) {
  const web3Cfg = getWeb3Cfg();
  const [balance, setBalance] = useState('?.??');
  const [updatedAt, setUpdatedAt] = useState(0);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!updatedAt) {
      getUserBalance(chain, ethereum.address)
        .then((data) => {
          if (data) {
            setUpdatedAt(moment());
            setBalance(data.value);
            setIsError(false);
          }
        })
        .catch((err) => {
          setIsError(true);
          console.error(err);
        });
    }
  });

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
          {!isError ? `${balance} ${web3Cfg.networks[chain]?.nativeCurrency?.symbol}` : 'ERROR!'}
        </a>
        {updatedAt ? (
          <div className="very-small text-bg-low">
            {`Updated at`} <TimeFromNow timestamp={updatedAt} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
