import tinyClipboard from '@src/util/libs/Clipboard';
import { toast } from '../../../util/tools';

export default function copyText(event, text) {
  try {
    const target = $(event.target);
    const tinyUsername = target.text().trim();

    if (tinyUsername.length > 0) {
      tinyClipboard.copyText(tinyUsername);
      toast(text);
    }
  } catch (err) {
    console.error(err);
    alert(err.message, 'CopyText Error');
  }
}
