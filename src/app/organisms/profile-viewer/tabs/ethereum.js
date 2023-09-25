import { objType } from "../../../../util/tools";

const unstoppableDomains = {
    reverseName: {}
};

export default function renderEthereum(tinyPlace, user, presenceStatus) {
    if (user) {

        // Ethereum
        const ethereum = presenceStatus.ethereum;

        tinyPlace.append(
            $('<span>', { class: 'small' }).text(ethereum.address)
        );

        console.log(presenceStatus);

    }
};