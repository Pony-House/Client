import { tinyCrypto } from "../../../../util/web3";
import getUdManager from "../../../../util/web3/abi/polygon/0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f";
import { objType, toast } from "../../../../util/tools";

import { getUdDomain } from './ethereum';
import getWallets from '../../../../../mods/ud';

const ud = {
    addressList: {},
};

// Get Domain
const getUdDomains = (address, domain) => new Promise((resolve, reject) => {

    // Exist cache?
    if (ud.addressList[address] && typeof ud.addressList[address].value === 'string') {
        resolve(ud.addressList[address].value);
    }

    // Nope
    else if (objType(tinyCrypto.userProviders, 'object') && tinyCrypto.userProviders.polygon) {

        if (!ud.polygon) {
            ud.polygon = getUdManager();
        }

        if (ud.polygon.getMany) {
            ud.polygon.namehash(domain.split('.')).call().then(tokenId => {
                ud.polygon.getMany(getWallets, tokenId).call().then(domains => {
                    ud.addressList[address] = { domains, timeout: 60 };
                    resolve(ud.addressList[address].domains);
                }).catch(reject);
            }).catch(reject);
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

}, 60000);

export default function renderUd(tinyPlace, user, presenceStatus) {
    if (user) {

        // Tiny Error
        const tinyError = (err) => {
            toast(err.message);
            console.error(err);
        };

        // Ethereum
        const ethereum = presenceStatus.ethereum;
        getUdDomain(ethereum.address).then(domain => {
            if (typeof domain === 'string' && domain.length > 0) {
                getUdDomains(ethereum.address, domain).then(addresses => {

                    // Address Base
                    const balances = $('<div>', { class: 'small row' });

                    // Check Wallets
                    for (const item in getWallets) {
                        const address = addresses[item];
                        const walletInfo = getWallets[item].split('.');
                        if (typeof address === 'string' && address.length > 0 && walletInfo[0] === 'crypto' && walletInfo[2] === 'address') {

                            // Insert Item
                            balances.append($('<div>', { class: 'col-md-6 mt-3' }).append($('<div>', { class: 'border border-bg p-3 ' }).append(
                                $('<div>', { class: 'fw-bold' }).text(walletInfo[1]).prepend($('<i>', { class: `me-2 cf cf-${walletInfo[1].toLowerCase()}` })),
                                $('<span>', { class: 'small' }).text(address),
                            )));

                        }
                    }

                    tinyPlace.append(balances);

                }).catch(tinyError)
            }
        }).catch(tinyError);


    }
};