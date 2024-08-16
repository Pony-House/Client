import React, { useState } from 'react';
import tinyAPI from '@src/util/mods';
import initMatrix from '@src/client/initMatrix';

function UnstoppableDomainsTab({ userId, accountContent }) {
  // Prepare
  const [isLoading, setIsLoading] = useState(true);
  const [errMessage, setErrMessage] = useState(null);

  // Config
  const user = initMatrix.matrixClient.getUser(userId);

  // Ethereum
  const ethereum = accountContent.presenceStatusMsg.ethereum;

  if (isLoading)
    return (
      <strong className="small">
        <div className="me-2 spinner-border spinner-border-sm d-inline-block" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>{' '}
        Loading data...
      </strong>
    );

  return (
    <>
      <div className="very-small text-center mt-3">
        Powered by{` `}
        <a href="https://unstoppabledomains.com" target="_blank" className="text-bg-force">
          Unstoppable Domains
        </a>
      </div>
    </>
  );

  /*

// Tiny Error
const tinyError = (err) => {
if (err) {
  toast(err.message);
  console.error(err);
  tinyPlace
    .empty()
    .append($('<strong>', { class: 'small text-danger' }).text('ERROR LOADING!'));
} else {
  tinyPlace
    .empty()
    .append(
      $('<strong>', { class: 'small' }).text(
        'No reverse UD domains were found linked to this wallet.',
      ),
    );
}
};

// Ethereum
const ethereum = presenceStatus.ethereum;
getUdDomain(ethereum.address)
.then((domain) => {
  if (typeof domain === 'string' && domain.length > 0) {
    getUdDomains(ethereum.address, domain)
      .then((addresses) => {
        if (Array.isArray(addresses) && addresses.length > 0) {
          tinyPlace.empty().append(
            $('<strong>', { class: 'small' }).text('UD Domain: '),
            $('<a>', { class: 'small text-click' })
              .text(domain)
              .on('click', (event) =>
                copyText(event, 'Ethereum domain successfully copied to the clipboard.'),
              ),
          );

          // Address Base
          const balances = $('<div>', { class: 'small row' });

          // Check Wallets
          for (const item in getWallets) {
            const address = addresses[item];
            const walletInfo = getWallets[item].split('.');
            if (
              typeof address === 'string' &&
              address.length > 0 &&
              walletInfo[0] === 'crypto' &&
              walletInfo[2] === 'address'
            ) {
              // Insert Item
              balances.append(
                $('<div>', { class: 'col-md-6 mt-3' }).append(
                  $('<div>', { class: 'border border-bg p-3 ' }).append(
                    $('<div>', { class: 'fw-bold' })
                      .text(walletInfo[1])
                      .prepend(
                        $('<i>', { class: `me-2 cf cf-${walletInfo[1].toLowerCase()}` }),
                      ),
                    $('<span>', { class: 'small text-click' })
                      .text(address)
                      .on('click', () => {
                        const qrcodeCanvas = $('<canvas>');
                        qrcode.toCanvas(qrcodeCanvas[0], address, (error) => {
                          if (error) {
                            toast(error);
                          } else {
                            // Prepare Text
                            btModal({
                              title: `${walletInfo[1]} Address`,

                              id: 'user-eth-address',
                              dialog: 'modal-lg modal-dialog-centered',

                              body: $('<center>', { class: 'small' }).append(
                                $('<h6>', { class: 'mb-4 noselect' }).text(
                                  'Please enter the address correctly! Any type issue will be permanent loss of your funds!',
                                ),
                                $('<span>').text(
                                  user.displayName ? user.displayName : user.userId,
                                ),
                                $('<br/>'),
                                $('<span>').text(address),
                                $('<div>', { class: 'mt-3' }).append(qrcodeCanvas),
                              ),
                            });
                          }
                        });
                      }),
                  ),
                ),
              );
            }
          }

          tinyPlace.append(balances);
        } else {
          tinyError();
        }
      })
      .catch(tinyError);
  } else {
    tinyError();
  }
})
.catch(tinyError);
*/
}

export default function startMod() {
  tinyAPI.on('profileTabsSpawn', (data, menuBarItems, accountContent, existEthereum) => {
    if (existEthereum) {
      menuBarItems.push({
        menu: () => 'UD',
        render: ({ userId, accountContent }) => (
          <UnstoppableDomainsTab userId={userId} accountContent={accountContent} />
        ),
      });
    }
  });
}
