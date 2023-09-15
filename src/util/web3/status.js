import { toast } from "../tools";

let header;

export function setEthereumMeta(newHeader) { header = newHeader; };
export default function startStatus() {

    // Detect Meta to Update Icon
    const checkConnection = function () {
        if (header) {

            if (global.tinyCrypto.existEthereum()) {

                // Allow Actions
                global.tinyCrypto.allowActions = true;

                // Update Data
                if (!global.tinyCrypto.matrixEthereum) {
                    global.tinyCrypto.matrixEthereum = $('meta[name="user-ethereum-address"]').attr('content')?.toLowerCase();
                }

                // Check Data and Insert Warn
                if (global.tinyCrypto.matrixEthereum !== global.tinyCrypto.address) {

                    if (header) header.css('opacity', 0.7);

                    if (global.tinyCrypto.accounts.length > 0) {

                        if (header) header.css('color', 'red');
                        if (header) header.attr('title', 'Your ethereum wallet is not the same as your matrix account.');
                        toast('Your ethereum wallet is not the same as your matrix account!', 'Ethereum Wallet');

                        // connectWallet.html(`${ethIcon} Your wallet does not share the same value as your matrix account. You can click here to try to reconnect a new address.`);

                    }

                    else {

                        const tinyMessage = 'Please reconnect your crypto wallet! A new window will open to redo this.';
                        if (header) header.css('color', 'yellow');
                        if (header) header.attr('title', tinyMessage);
                        toast(tinyMessage, 'Ethereum Wallet');

                        // connectWallet.eth(`${ethIcon} ${tinyMessage}`);

                        global.tinyCrypto.call.requestAccounts().then(() => { global.location.reload(); }).catch(err => {
                            console.error(err);
                            alert(err.message);
                        });

                    }

                }

            }

            else {
                toast('You don\'t have a ethereum Wallet installed in your browser!', 'Ethereum Wallet');
                global.tinyCrypto.allowActions = false;
                if (header) header.css('color', 'red');
                if (header) header.css('opacity', 0.7);
                if (header) header.attr('title', 'No wallet was detected.');
            }

        }
    };

    if (global.tinyCrypto.existEthereum()) {
        global.tinyCrypto.on('readyProvider', checkConnection);
        global.tinyCrypto.on('checkConnection', checkConnection);
        global.tinyCrypto.on('accountsChanged', checkConnection);
    }

};