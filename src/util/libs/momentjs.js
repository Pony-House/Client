// Module
import moment from 'moment-timezone';
import { getAppearance } from './appearance';
import { objType } from '../tools';

// Module Config
moment.locale('en');

export const calendarFormat = [
  { text: 'MM/DD/YYYY' },
  { text: 'DD/MM/YYYY' },
  { text: 'YYYY/MM/DD' },
  { text: 'YYYY/DD/MM' },
  { text: 'MM/YYYY/DD' },
  { text: 'DD/YYYY/MM' },
];

export const momentFormat = {
  calendar: () => {
    const tinyFormat = calendarFormat[Number(getAppearance().calendarFormat)];
    if (objType(tinyFormat, 'object') && typeof tinyFormat.text === 'string')
      return tinyFormat.text;
    return calendarFormat[0].text;
  },

  clock: () => (!getAppearance().is24hours ? 'hh:mm A' : 'HH:mm'),
  clock2: () => (!getAppearance().is24hours ? 'hh:mm:ss A' : 'HH:mm:ss'),
};

// Export Module
export default moment;

if (__ENV_APP__.MODE === 'development') {
  global.moment = moment;
}
