// Module
import moment from 'moment-timezone';
import { getAppearance } from './appearance';

// Module Config
moment.locale('en');

const calendarFormat = [
    'MM/DD/YYYY',
    'DD/MM/YYYY',
    'YYYY/MM/DD',
    'YYYY/DD/MM',
    'MM/YYYY/DD',
    'DD/YYYY/MM',
];

const momentFormat = {

    calendar: () => {
        const tinyFormat = calendarFormat[Number(getAppearance().calendarFormat)];
        if (typeof tinyFormat === 'string') return tinyFormat;
        return calendarFormat[0];
    },

    clock: () => !getAppearance().is24hours ? 'hh:mm A' : 'HH:mm',
    clock2: () => !getAppearance().is24hours ? 'hh:mm:ss A' : 'HH:mm:ss',

};

// Export Module
export default moment;
export { momentFormat };