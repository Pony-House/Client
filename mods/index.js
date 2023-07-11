import { objType } from '../src/util/tools';

// Module Base
const tinyPlugins = {

    // Cache Functions
    cache: {},
    props: {}

};

// Create Cache
const createTinyCache = (event, data, callback) => {
    if (typeof event === 'string' && objType(data, 'object') && typeof callback === 'function') {

        // Check Exist Array
        if (!Array.isArray(tinyPlugins.cache[event])) {
            tinyPlugins.cache[event] = [];
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

    // Result
    let result = null;

    // Exist Data
    if (Array.isArray(tinyPlugins.cache[event])) {
        for (const item in tinyPlugins.cache[event]) {

        }
    }

    // Complete
    return result;

};

export async function emitAsync(event, data) {

    // Result
    let result = null;

    // Exist Data
    if (Array.isArray(tinyPlugins.cache[event])) {
        for (const item in tinyPlugins.cache[event]) {

        }
    }

    // Complete
    return result;

};