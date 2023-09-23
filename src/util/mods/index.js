/* eslint-disable no-await-in-loop */
import isDevMode from '../isDevMode';
import { objType } from '../tools';

const tinyAPI = {};

// Module Base
const tinyPlugins = {

    // Cache Functions
    cache: {},
    order: {},

    reorder: (event) => {
        if (Array.isArray(tinyPlugins.order[event])) {
            tinyPlugins.order[event].sort((a, b) => b.priority - a.priority);
        }
    },

};

// Create Cache
const createTinyCache = (event, data, callback, priorityItem = 0) => {
    if (typeof event === 'string' && objType(data, 'object') && typeof callback === 'function') {

        // Fix Priority
        let priority = priorityItem;
        if (typeof priority !== 'number' || Number.isNaN(priority) || !Number.isFinite(priority)) priority = 0;

        // Check Exist Array
        if (!Array.isArray(tinyPlugins.cache[event])) {
            tinyPlugins.cache[event] = [];
        }

        if (!Array.isArray(tinyPlugins.order[event])) {
            tinyPlugins.order[event] = [];
        }

        // Check Exist Callback
        let newIndex = -1;

        const oldIndex = tinyPlugins.cache[event].indexOf(callback);
        if (oldIndex < 0) {

            tinyPlugins.cache[event].push(callback);

            newIndex = tinyPlugins.cache[event].length - 1;
            tinyPlugins.order[event].push({ callback, priority, index: newIndex, type: data.type });

        } else {
            newIndex = oldIndex;
        }

        // Complete
        tinyPlugins.reorder(event);
        return newIndex;

    }
    return false;
}

tinyAPI.on = (event, callback, priority = 0) => createTinyCache(event, { type: 'on' }, callback, priority);

tinyAPI.once = (event, callback, priority = 0) => createTinyCache(event, { type: 'once' }, callback, priority);

// Delete Cache
const deleteTinyCache = (event, callback, tinyIndex) => {
    if (typeof event === 'string' && typeof callback === 'function') {

        // Result
        let result = false;

        // Check Event Path
        if (Array.isArray(tinyPlugins.cache[event])) {

            // Index
            let index;

            if (typeof tinyIndex !== 'number') {
                index = tinyPlugins.cache[event].indexOf(callback);
            } else {
                index = tinyIndex;
            }

            if (index > -1) {

                // Remove Function
                tinyPlugins.cache[event].splice(index, 1);
                result = true;

                if (Array.isArray(tinyPlugins.order[event])) {
                    const ti = tinyPlugins.order[event].findIndex(item => item.index === index);
                    if (ti > -1) {
                        tinyPlugins.order[event].splice(ti, 1);
                    }
                }

            }

        }

        // Complete
        tinyPlugins.reorder(event);
        return result;

    }
    return false;
};

tinyAPI.off = (event, callback, index) => deleteTinyCache(event, callback, index);
tinyAPI.resetAll = () => {

    delete tinyPlugins.order;
    delete tinyPlugins.cache;

    tinyPlugins.order = {};
    tinyPlugins.cache = {};

};


// Emit
const argumentsFix = (args, result) => {

    const newArgs = [result];
    for (const item in args) {
        if (Number(item) !== 0) newArgs.push(args[item]);
    }

    return newArgs;

};

tinyAPI.emit = function (event) {

    // Result
    let result = {};

    // Exist Data
    if (Array.isArray(tinyPlugins.order[event])) {
        for (const item in tinyPlugins.order[event]) {

            tinyPlugins.order[event][item].callback.apply({}, argumentsFix(arguments, result));
            if (!objType(result, 'object')) result = null;

            if (tinyPlugins.order[event][item].type === 'once') {
                deleteTinyCache(event, tinyPlugins.order[event][item].callback, tinyPlugins.order[event][item].index);
            }

        }
    }

    // Complete
    if (!result) result = {};
    return result;

};

tinyAPI.emitAsync = async function (event) {

    // Result
    let result = {};

    // Exist Data
    if (Array.isArray(tinyPlugins.order[event])) {
        for (const item in tinyPlugins.order[event]) {

            result = await tinyPlugins.order[event][item].callback.apply({}, argumentsFix(arguments, result));
            if (!objType(result, 'object')) result = null;

            if (tinyPlugins.order[event][item].type === 'once') {
                deleteTinyCache(event, tinyPlugins.order[event][item].callback, tinyPlugins.order[event][item].index);
            }

        }
    }

    // Complete
    if (!result) result = {};
    return result;

};

// API Insert
if (isDevMode) global.tinyAPI = { on: tinyAPI.on, off: tinyAPI.off, once: tinyAPI.once };
export default tinyAPI;