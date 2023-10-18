import tinyAPI from '../../../src/util/mods';
import './theme.scss';

export default function startTheme() {
    tinyAPI.on('loadThemes', (data, themes) => {
        themes.catppuccin = {

            data: {

                statusBar: {

                    backgroundColor: {

                        // --bg-surface
                        default: '#050505',

                        // --bg-surface-low
                        low: '#000000',

                    },

                    style: 'DARK'

                }

            },
            id: 'catppuccin-theme',
            type: 'dark'

        };
    });
};