import { Resolution } from '@unstoppabledomains/resolution';
import { toast } from '../../../../util/tools';
import { getUdDomain } from './ethereum';

const getWallets = [
    'crypto.ETH.address',
    'crypto.BTC.address',
    'crypto.BCH.address',
    'crypto.DOGE.address',
    'crypto.ETC.address',
    'crypto.LTC.address',
    'crypto.LUNA.address',
    'crypto.XLM.address',
    'crypto.BTG.address',
    'crypto.XMR.address',
];

// getMany(keys, tokenId)

const resolution = new Resolution();
export default function renderUd(tinyPlace, user, presenceStatus) {
    if (user) {

        // Ethereum
        const ethereum = presenceStatus.ethereum;

        getUdDomain(ethereum.address).then(domain => {
            resolution.addr(domain, 'ETH').then(data => console.log(data)).catch(err => {
                toast(err.message);
                console.error(err);
            });
        }).catch(err => {
            toast(err.message);
            console.error(err);
        });


    }
};