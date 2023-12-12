// Module
import moment from 'moment-timezone';

// Module Config
moment.locale('en');

const momentFormat = {

    calendar: () => 'MM/DD/YYYY',
    clock: () => 'hh:mm A',
    clock2: () => 'hh:mm:ss A',

};


// Export Module
export default moment;
export { momentFormat };