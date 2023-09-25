import { Resolution } from '@unstoppabledomains/resolution';
import { toast } from '../../../../util/tools';
import { getUdDomain } from './ethereum';

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