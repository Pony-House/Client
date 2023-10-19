import tinyAPI from '../../../src/util/mods';
import './theme.scss';

export default function startTheme() {
    tinyAPI.on('loadThemes', (data, insertTheme) => {

        insertTheme(['Catppuccin Theme (Latte)', {

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
            id: 'catppuccin-theme-latte',
            type: 'silver'

        }]);

        insertTheme(['Catppuccin Theme (Frappe)', {

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
            id: 'catppuccin-theme-frappe',
            type: 'dark'

        }]);

        insertTheme(['Catppuccin Theme (Macchiato)', {

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
            id: 'catppuccin-theme-macchiato',
            type: 'dark'

        }]);

        insertTheme(['Catppuccin Theme (Mocha)', {

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
            id: 'catppuccin-theme-mocha',
            type: 'dark'

        }]);

    });
};