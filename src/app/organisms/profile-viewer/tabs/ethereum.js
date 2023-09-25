import { tinyCrypto } from "../../../../util/web3";
import { objType } from "../../../../util/tools";
import udPolygonAbi from "../../../../util/web3/abi/polygon/0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f";
import copyText from '../copyText';

const unstoppableDomains = {
    reverseName: {},
};

// Clear cache
setInterval(() => {

    for (const address in unstoppableDomains.reverseName) {
        if (unstoppableDomains.reverseName[address].timeout < 1) {
            delete unstoppableDomains.reverseName[address];
        } else {
            unstoppableDomains.reverseName[address].timeout--;
        }
    }

}, 60000);

// Get Domain
const getDomain = (address) => new Promise((resolve, reject) => {

    // Exist cache?
    if (unstoppableDomains.reverseName[address] && typeof unstoppableDomains.reverseName[address].value === 'string') {
        resolve(unstoppableDomains.reverseName[address].value);
    }

    // Nope
    else if (objType(tinyCrypto.userProviders, 'object') && tinyCrypto.userProviders.polygon) {

        const eth = tinyCrypto.userProviders.polygon.eth;
        if (!unstoppableDomains.polygon) {
            unstoppableDomains.polygon = new eth.Contract(udPolygonAbi, '0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f');
        }

        unstoppableDomains.polygon.methods.reverseNameOf(address).call().then(domain => {
            unstoppableDomains.reverseName[address] = { value: domain, timeout: 60 };
            resolve(unstoppableDomains.reverseName[address].value);
        }).catch(reject);

    } else {
        resolve(null);
    }

});

export default function renderEthereum(tinyPlace, user, presenceStatus) {
    if (user) {

        // Domain
        const udDomain = $('<div>', { class: 'small' });

        // Ethereum
        const ethereum = presenceStatus.ethereum;
        getDomain(ethereum.address).then(domain => {
            if (typeof domain === 'string' && domain.length > 0) {

                udDomain.append(
                    $('<strong>', { class: 'small' }).text('UD Domain: '),
                    $('<a>', { class: 'small text-click' }).text(domain).on('click', (event) => copyText(event, 'Ethereum domain successfully copied to the clipboard.'))
                );

            }
        }).catch(console.error);

        tinyPlace.append(
            $('<strong>', { class: 'small' }).text('Address: '),
            $('<a>', { class: 'small text-click' }).text(ethereum.address).on('click', (event) => copyText(event, 'Ethereum address successfully copied to the clipboard.')),
            udDomain,
        );

    }
};