import { tinyCrypto } from '@src/util/web3';
import copyText from '@src/app/organisms/profile-viewer/copyText';

import getUdManager from './abi/polygon/0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f';
import { objType, toast, btModal } from '../../../src/util/tools';

import getWallets from '../../ud';

const ud = {
  addressList: {},
  reverseName: {},
};

// Get Domain
const getUdDomain = (address) =>
  new Promise((resolve, reject) => {
    // Exist cache?
    if (ud.reverseName[address] && typeof ud.reverseName[address].value === 'string') {
      resolve(ud.reverseName[address].value);
    }

    // Nope
    else if (objType(tinyCrypto.userProviders, 'object') && tinyCrypto.userProviders.polygon) {
      if (!ud.polygon) {
        ud.polygon = getUdManager();
      }

      if (ud.polygon.reverseNameOf) {
        ud.polygon
          .reverseNameOf(address)
          .call()
          .then((domain) => {
            ud.reverseName[address] = { value: domain, timeout: 60 };
            resolve(ud.reverseName[address].value);
          })
          .catch(reject);
      } else {
        resolve(null);
      }
    } else {
      resolve(null);
    }
  });

// Get Domain
const getUdDomains = (address, domain) =>
  new Promise((resolve, reject) => {
    // Exist cache?
    if (ud.addressList[address] && Array.isArray(ud.addressList[address].domains)) {
      resolve(ud.addressList[address].domains);
    }

    // Nope
    else if (objType(tinyCrypto.userProviders, 'object') && tinyCrypto.userProviders.polygon) {
      if (!ud.polygon) {
        ud.polygon = getUdManager();
      }

      if (ud.polygon.getMany) {
        ud.polygon
          .namehash(domain.split('.'))
          .call()
          .then((tokenId) => {
            ud.polygon
              .getMany(getWallets, tokenId)
              .call()
              .then((domains) => {
                ud.addressList[address] = { domains, timeout: 60 };
                resolve(ud.addressList[address].domains);
              })
              .catch(reject);
          })
          .catch(reject);
      } else {
        resolve(null);
      }
    } else {
      resolve(null);
    }
  });

// Clear cache
setInterval(() => {
  for (const address in ud.addressList) {
    if (ud.addressList[address].timeout < 1) {
      delete ud.addressList[address];
    } else {
      ud.addressList[address].timeout--;
    }
  }

  for (const address in ud.reverseName) {
    if (ud.reverseName[address].timeout < 1) {
      delete ud.reverseName[address];
    } else {
      ud.reverseName[address].timeout--;
    }
  }
}, 60000);

export default function renderUd(tinyPlace, user, presenceStatus) {
  if (user) {
    // Powered by
    const poweredBy = $('<div>', { class: 'very-small text-center mt-3' })
      .text('Powered by ')
      .append(
        $('<a>', {
          href: 'https://unstoppabledomains.com',
          target: '_blank',
          class: 'text-bg-force',
        }).text('Unstoppable Domains'),
      );

    // Loading Message
    tinyPlace.append(
      $('<strong>', { class: 'small' })
        .text('Loading data...')
        .prepend(
          $('<div>', {
            class: 'me-2 spinner-border spinner-border-sm d-inline-block',
            role: 'status',
          }).append($('<span>', { class: 'visually-hidden' }).text('Loading...')),
        ),
    );

    // Tiny Error
    const tinyError = (err) => {
      if (err) {
        toast(err.message);
        console.error(err);
        tinyPlace
          .empty()
          .append($('<strong>', { class: 'small text-danger' }).text('ERROR LOADING!'), poweredBy);
      } else {
        tinyPlace
          .empty()
          .append(
            $('<strong>', { class: 'small' }).text(
              'No reverse UD domains were found linked to this wallet.',
            ),
            poweredBy,
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

                tinyPlace.append(balances, poweredBy);
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
  }
}
