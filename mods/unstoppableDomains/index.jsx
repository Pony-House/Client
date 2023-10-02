import tinyAPI from '../../src/util/mods';
import renderUd from './tab';

export default function startMod() {

    // Insert Render UD
    tinyAPI.on('profileTabs', (data, actions) => {
        actions.ud = renderUd;
    });

    // Spawn UD Menu
    tinyAPI.on('profileTabsSpawnEthereumAfter', (data, tinyData, user, menuItem) => {
        menuItem('UD', 'ud');
    });

};