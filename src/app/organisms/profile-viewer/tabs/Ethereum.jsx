import React from 'react';
import $ from 'jquery';

import { objType } from 'for-promise/utils/lib.mjs';

import getEnsManager from '@src/util/web3/abi/ethereum/0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb';
import { tinyCrypto } from '@src/util/web3';
import initMatrix from '@src/client/initMatrix';

import { btModal, toast } from '@src/util/tools';
import EthereumProfileTabItem from './EthereumItem';

const ens = {
  reverseName: {},
};

export const chainBalance = {};

// Clear cache
setInterval(() => {
  for (const address in ens.reverseName) {
    if (ens.reverseName[address].timeout < 1) {
      delete ens.reverseName[address];
    } else {
      ens.reverseName[address].timeout--;
    }
  }

  for (const chain in chainBalance) {
    for (const address in chainBalance[chain]) {
      if (chainBalance[chain][address].timeout < 1) {
        delete chainBalance[chain][address];
      } else {
        chainBalance[chain][address].timeout--;
      }
    }
  }
}, 60000);

const getEnsDomain = (address) =>
  new Promise((resolve, reject) => {
    // Exist cache?
    if (ens.reverseName[address] && typeof ens.reverseName[address].value === 'string') {
      resolve(ens.reverseName[address].value);
    }

    // Nope
    else if (objType(tinyCrypto.userProviders, 'object') && tinyCrypto.userProviders.ethereum) {
      if (!ens.ethereum) {
        ens.ethereum = getEnsManager();
      }

      if (ens.ethereum.node) {
        ens.ethereum
          .node(address)
          .call()
          .then((domain) => {
            ens.reverseName[address] = { node: domain, timeout: 60 };
            resolve(ens.reverseName[address].node);
          })
          .catch(reject);
      } else {
        resolve(null);
      }
    } else {
      resolve(null);
    }
  });

export { getEnsDomain };

export default function EthereumProfileTab(menuBarItems, accountContent, existEthereum) {
  if (existEthereum) {
    menuBarItems.push({
      menu: () => 'Ethereum',
      render: ({ userId, accountContent }) => {
        // Config
        const user = initMatrix.matrixClient.getUser(userId);

        // Ethereum
        const ethereum = accountContent.presenceStatusMsg.ethereum;
        return (
          <>
            <strong className="small">Address:</strong>{' '}
            <a
              className="small text-click"
              onClick={(event) => {
                event.preventDefault();
                const qrcodeCanvas = $('<canvas>');
                qrcode.toCanvas(qrcodeCanvas[0], ethereum.address, (error) => {
                  if (error) {
                    toast(error);
                  } else {
                    // Prepare Text
                    btModal({
                      title: 'Ethereum Address',

                      id: 'user-eth-address',
                      dialog: 'modal-lg modal-dialog-centered',

                      body: $('<center>', { class: 'small' }).append(
                        $('<h6>', { class: 'mb-4 noselect' }).text(
                          'Please enter the address correctly! Any type issue will be permanent loss of your funds!',
                        ),
                        $('<span>').text(user.displayName ? user.displayName : user.userId),
                        $('<br/>'),
                        $('<span>').text(ethereum.address),
                        $('<div>', { class: 'mt-3' }).append(qrcodeCanvas),
                      ),
                    });
                  }
                });
              }}
            >
              {ethereum.address}
            </a>
            <div className="small row">
              {Object.keys(tinyCrypto.userProviders).map((chain) => (
                <EthereumProfileTabItem
                  key={`profile_ethereum_${chain}`}
                  chain={chain}
                  ethereum={ethereum}
                />
              ))}
            </div>
          </>
        );
      },
    });
  }
}
