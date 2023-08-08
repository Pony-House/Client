import { setFavicon } from '../../../util/common';

const LogoUnreadSVG = './img/png/cinny-unread.png';
const LogoHighlightSVG = './img/png/cinny-highlight.png';

class Notifications extends EventEmitter {

    async _updateFavicon() {

        if (!this.initialized) return;

        let unread = false;
        let highlight = false;

        [...this.roomIdToNoti.values()].find((noti) => {

            if (!unread) {
                unread = noti.total > 0 || noti.highlight > 0;
            }

            highlight = noti.highlight > 0;
            if (unread && highlight) return true;

            return false;

        });

        let newFavicon = LogoSVG;
        if (unread && !highlight) {
            newFavicon = LogoUnreadSVG;
        }

        if (unread && highlight) {
            newFavicon = LogoHighlightSVG;
        }

        if (newFavicon === this.favicon) return;
        this.favicon = newFavicon;

        setFavicon(this.favicon);

    }

};