import { tinyCrypto } from "../../../../util/web3";
import { btModal, objType, toast } from "../../../../util/tools";

import getUdManager from "../../../../util/web3/abi/polygon/0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f";
import getEnsManager from "../../../../util/web3/abi/ethereum/0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb";

import copyText from '../copyText';

const ud = {
    reverseName: {},
};

const ens = {
    reverseName: {},
};

const chainBalance = {};

// Clear cache
setInterval(() => {

    for (const address in ud.reverseName) {
        if (ud.reverseName[address].timeout < 1) {
            delete ud.reverseName[address];
        } else {
            ud.reverseName[address].timeout--;
        }
    }

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

// Get Domain
const getUdDomain = (address) => new Promise((resolve, reject) => {

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
            ud.polygon.reverseNameOf(address).call().then(domain => {
                ud.reverseName[address] = { value: domain, timeout: 60 };
                resolve(ud.reverseName[address].value);
            }).catch(reject);
        } else {
            resolve(null);
        }

    } else {
        resolve(null);
    }

});

const getEnsDomain = (address) => new Promise((resolve, reject) => {

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
            ens.ethereum.node(address).call().then(domain => {
                ens.reverseName[address] = { node: domain, timeout: 60 };
                resolve(ens.reverseName[address].node);
            }).catch(reject);
        } else {
            resolve(null);
        }

    } else {
        resolve(null);
    }

});

const getUserBalance = (chain, address) => new Promise((resolve, reject) => {

    // Insert Chain
    if (!chainBalance[chain]) chainBalance[chain] = {};

    // Exist cache?
    if (chainBalance[chain][address] && (
        typeof chainBalance[chain][address].value === 'string' ||
        typeof chainBalance[chain][address].value === 'number'
    )) {
        resolve(chainBalance[chain][address].value);
    }

    // Nope
    else if (objType(tinyCrypto.userProviders, 'object') && tinyCrypto.userProviders.ethereum) {

        // Provider
        const eth = tinyCrypto.userProviders[chain].eth;

        eth.getBalance(address).then(n => {

            let balance = tinyCrypto.userProviders[chain].utils.fromWei(n, 'ether');
            if (balance.endsWith('.')) balance = `${balance}00`;

            chainBalance[chain][address] = { value: balance, timeout: 60 };
            resolve(chainBalance[chain][address].value);

        }).catch(reject);

    } else {
        resolve(null);
    }

});

export { getEnsDomain, getUdDomain };
export default function renderEthereum(tinyPlace, user, presenceStatus) {
    if (user) {

        // Domain
        const udDomain = $('<div>', { class: 'small' });

        // Ethereum
        const ethereum = presenceStatus.ethereum;
        getUdDomain(ethereum.address).then(domain => {
            if (typeof domain === 'string' && domain.length > 0) {

                udDomain.append(
                    $('<strong>', { class: 'small' }).text('UD Domain: '),
                    $('<a>', { class: 'small text-click' }).text(domain).on('click', (event) => copyText(event, 'Ethereum domain successfully copied to the clipboard.'))
                );

            }
        }).catch(console.error);

        // Add Place
        tinyPlace.append(

            $('<strong>', { class: 'small' }).text('Address: '),
            $('<a>', { class: 'small text-click' }).text(ethereum.address).on('click', () => {

                const qrcodeCanvas = $('<canvas>');
                qrcode.toCanvas(qrcodeCanvas[0], ethereum.address, (error) => {
                    if (error) { toast(error) } else {

                        // Prepare Text
                        btModal({

                            title: 'Ethereum Address',

                            id: 'user-eth-address',
                            dialog: 'modal-lg modal-dialog-centered',

                            body: $('<center>', { class: 'small' }).append(

                                $('<h6>', { class: 'mb-4 noselect' }).text('Please enter the address correctly! Any type issue will be permanent loss of your funds!'),
                                $('<span>').text(user.displayName ? user.displayName : user.userId),
                                $('<br/>'),
                                $('<span>').text(ethereum.address),
                                $('<div>', { class: 'mt-3' }).append(qrcodeCanvas)

                            ),

                        });

                    }
                });

            }),

            udDomain,

        );

        // Ethereum Wallets
        for (const chain in tinyCrypto.userProviders) {
            getUserBalance(chain, ethereum.address).then(balance => {
                console.log(chain, balance);
            });
        }

    }
};