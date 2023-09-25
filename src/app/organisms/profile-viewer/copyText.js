import { copyToClipboard } from '../../../util/common';
import { toast } from '../../../util/tools';

export default function copyText(event, text) {
    try {

        const target = $(event.target);
        const tinyUsername = target.text().trim();

        if (tinyUsername.length > 0) {
            copyToClipboard(tinyUsername);
            toast(text);
        }

    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};