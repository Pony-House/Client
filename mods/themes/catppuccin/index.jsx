import tinyAPI from '../../../src/util/mods';
import './theme.scss';

export default function startTheme() {

    // Insert Render UD
    tinyAPI.on('loadThemes', (data, themes) => {
        console.log(themes);
    });

};