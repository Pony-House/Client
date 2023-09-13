import { toast } from "../tools";

// Detect Meta to Update Icon
const checkConnection = function () {
    const existMetaEthereum = $('meta[name="user-ethereum-address"]');
    if (existMetaEthereum) {

        // jQuery values
        const header = $('#web3_header');

        if (window.ethereum) {

            if (window.ethereum._isUnlocked) {

                // Allow Actions
                global.tinyCrypto.allowActions = true;

                // Update Data
                if (!global.tinyCrypto.matrixEthereum) {
                    global.tinyCrypto.matrixEthereum = existMetaEthereum.attr('content').toLowerCase();
                }

                // Check Data and Insert Warn
                if (global.tinyCrypto.matrixEthereum !== global.tinyCrypto.address) {

                    header.css('opacity', 0.7);

                    if (global.tinyCrypto.accounts.length > 0) {

                        header.css('color', 'red');
                        header.attr('title', 'Your ethereum wallet is not the same as your Derpibooru account.');
                        toast('Your ethereum wallet is not the same as your Derpibooru account!', 'Ethereum Wallet');

                        // connectWallet.html(`${ethIcon} Your wallet does not share the same value as your Derpibooru account. You can click here to try to reconnect a new address.`);

                    }

                    else {

                        const tinyMessage = 'Please reconnect your crypto wallet! A new window will open to redo this.';
                        header.css('color', 'yellow');
                        header.attr('title', tinyMessage);
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
                toast('Please unlock your crypto wallet to use the ethereum features.', 'Ethereum Wallet');
                global.tinyCrypto.allowActions = false;
                header.css('color', 'yellow');
                header.css('opacity', 0.7);
                header.attr('title', 'Please unlock your crypto wallet.');
            }

        }

        else {
            toast('You don\'t have a ethereum Wallet installed in your browser!', 'Ethereum Wallet');
            global.tinyCrypto.allowActions = false;
            header.css('color', 'red');
            header.css('opacity', 0.7);
            header.attr('title', 'No wallet was detected.');
        }

    }
    else {
        global.tinyCrypto.allowActions = false;
    }
};

if (window.ethereum) {
    global.tinyCrypto.on('readyProvider', checkConnection);
    global.tinyCrypto.on('checkConnection', checkConnection);
    global.tinyCrypto.on('accountsChanged', checkConnection);
}