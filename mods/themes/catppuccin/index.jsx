import tinyAPI from '../../../src/util/mods';
import './theme.scss';

export default function startTheme() {
    tinyAPI.on('loadThemes', (data, insertTheme) => {

        insertTheme(['Catppuccin Theme (Latte)', {

            data: {

                statusBar: {

                    backgroundColor: {

                        // --bg-surface
                        default: '#eff1f5',

                        // --bg-surface-low
                        low: '#e6e9ef',

                    },

                    style: 'LIGHT'

                }

            },
            id: 'catppuccin-theme-latte',
            type: 'silver-solid'

        }]);

        insertTheme(['Catppuccin Theme (Frappe)', {

            data: {

                statusBar: {

                    backgroundColor: {

                        // --bg-surface
                        default: '#303446',

                        // --bg-surface-low
                        low: '#292c3c',

                    },

                    style: 'DARK'

                }

            },
            id: 'catppuccin-theme-frappe',
            type: 'dark-solid'

        }]);

        insertTheme(['Catppuccin Theme (Macchiato)', {

            data: {

                statusBar: {

                    backgroundColor: {

                        // --bg-surface
                        default: '#24273a',

                        // --bg-surface-low
                        low: '#1e2030',

                    },

                    style: 'DARK'

                }

            },
            id: 'catppuccin-theme-macchiato',
            type: 'dark-solid'

        }]);

        insertTheme(['Catppuccin Theme (Mocha)', {

            data: {

                statusBar: {

                    backgroundColor: {

                        // --bg-surface
                        default: '#1e1e2e',

                        // --bg-surface-low
                        low: '#181825',

                    },

                    style: 'DARK'

                }

            },
            id: 'catppuccin-theme-mocha',
            type: 'dark-solid'

        }]);

    });
};