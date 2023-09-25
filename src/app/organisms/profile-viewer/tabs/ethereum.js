import { tinyCrypto } from "../../../../util/web3";
import { btModal, objType, toast } from "../../../../util/tools";
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

    }
};