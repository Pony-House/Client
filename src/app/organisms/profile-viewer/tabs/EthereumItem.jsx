import React, { useState, useEffect } from 'react';

import { getWeb3Cfg } from '@src/util/web3';
import TimeFromNow from '@src/app/atoms/time/TimeFromNow';
import { getUserBalance } from '@src/util/web3/utils';

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
            setUpdatedAt(new Date());
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
