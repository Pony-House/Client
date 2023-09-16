import { toast } from "../tools";

let header;

export function setEthereumStatusButton(newHeader) { header = newHeader; };
export default function startStatus() {

    // Detect Meta to Update Icon
    const checkConnection = function () {
        if (header) {

            if (!global.tinyCrypto.existEthereum()) {

                if (!__ENV_APP__.electron_mode) toast('You don\'t have a ethereum Wallet installed in your browser!', 'Ethereum Wallet');

                if (header) header.addClass('ethereum-none');
                global.tinyCrypto.allowActions = false;

            } else {
                if (header) header.removeClass('ethereum-none');
                global.tinyCrypto.allowActions = true;
            }

        }
    };

    if (global.tinyCrypto.existEthereum()) {
        global.tinyCrypto.on('readyProvider', checkConnection);
        global.tinyCrypto.on('checkConnection', checkConnection);
        global.tinyCrypto.on('accountsChanged', checkConnection);
    }

};