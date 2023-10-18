import tinyAPI from '../../../src/util/mods';
import './theme.scss';

export default function startTheme() {
    tinyAPI.on('loadThemes', (data, insertTheme) => {

        insertTheme(['Catppuccin Theme (Dark) (TEST)', {

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
            id: 'catppuccin-theme-dark',
            type: 'dark'

        }]);

        insertTheme(['Catppuccin Theme (Light) (TEST)', {

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
            id: 'catppuccin-theme-light',
            type: 'light'

        }]);

        insertTheme(['Catppuccin Theme (Silver) (TEST)', {

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
            id: 'catppuccin-theme-silver',
            type: 'silver'

        }]);

    });
};