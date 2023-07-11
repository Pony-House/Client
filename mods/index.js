/* eslint-disable no-await-in-loop */
import { objType } from '../src/util/tools';

// Module Base
const tinyPlugins = {

    // Cache Functions
    cache: {},
    order: {},
    props: {},

    reorder: (event) => {
        tinyPlugins.order[event].sort((a, b) => b.priority - a.priority);
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

        if (!objType(tinyPlugins.props[event], 'object')) {
            tinyPlugins.props[event] = {};
        }

        // Check Exist Callback
        let newIndex = -1;
        let result = false;

        const oldIndex = tinyPlugins.cache[event].indexOf(callback);
        if (oldIndex < 0) {

            tinyPlugins.cache[event].push(callback);

            newIndex = tinyPlugins.cache[event].length - 1;
            tinyPlugins.order[event].push({ callback, priority, index: newIndex });
            result = true;

        } else {
            newIndex = oldIndex;
        }

        // Delete Old Values
        if (objType(tinyPlugins.props[event][oldIndex], 'object')) {
            delete tinyPlugins.props[event][oldIndex];
        }

        // Create New Values
        tinyPlugins.props[event][newIndex] = { type: data.type };

        // Complete
        return result;

    }
    return false;
}

export function on(event, callback) {
    return createTinyCache(event, 'on', callback);
};

export function once(event, callback) {
    return createTinyCache(event, 'once', callback);
};

// Delete Cache
const deleteTinyCache = (event, callback) => {
    if (typeof event === 'string' && typeof callback === 'function') {

        // Result
        let result = false;

        // Check Event Path
        if (Array.isArray(tinyPlugins.cache[event])) {

            // Index
            const index = tinyPlugins.cache[event].indexOf(callback);
            if (index > -1) {

                // Remove Function
                tinyPlugins.cache[event].splice(index, 1);
                result = true;

                // Delete props
                if (objType(tinyPlugins.props[event], 'object') && objType(tinyPlugins.props[event][index], 'object')) {
                    delete tinyPlugins.props[event][index];
                }

                if (Array.isArray(tinyPlugins.order[event])) {
                    const ti = tinyPlugins.order[event].findIndex(item => item.index === index);
                    if (ti > -1) {
                        tinyPlugins.order[event].splice(ti, 1);
                    }
                }

            }

        }

        // Complete
        return result;

    }
    return false;
};

export function off(event, callback) {
    return deleteTinyCache(event, callback);
};

// Emit
export function emit(event, data) {

    // Exist Data
    if (Array.isArray(tinyPlugins.order[event])) {
        for (const item in tinyPlugins.order[event]) {
            tinyPlugins.order[event][item].callback(data);
        }
    }

    // Complete
    return data;

};

export async function emitAsync(event, data) {

    // Exist Data
    if (Array.isArray(tinyPlugins.order[event])) {
        for (const item in tinyPlugins.order[event]) {
            await tinyPlugins.order[event][item].callback(data);
        }
    }

    // Complete
    return data;

};