import clone from 'clone';
import { logger as mxLogger } from 'matrix-js-sdk/lib/logger';
import { consoleRemoveData, consoleNewData, consoleUpdate } from '../action/navigation';
import tinyAPI from '../../util/mods';

const logCache = {

    data: [],
    add: (level, msg) => {
        if (typeof level === 'string' && (Array.isArray(msg) || typeof msg === 'string')) {

            logCache.data.push({
                level,
                msg
            });

            if (logCache.data.length > 1000) {

                const tinyData = logCache.data.shift();

                consoleRemoveData(tinyData);
                tinyAPI.emit('consoleRemoveData', tinyData);

            }

            const tinyData = { level, msg };
            consoleNewData(tinyData);
            tinyAPI.emit('consoleNewData', tinyData);

            consoleUpdate(logCache.data);
            tinyAPI.emit('consoleUpdate', logCache.data);

        }
    }

};

// rewrite matrix logger
mxLogger.info = (...msg) => logCache.add('info', msg);
mxLogger.log = (...msg) => logCache.add('log', msg);
mxLogger.warn = (...msg) => logCache.add('warn', msg);
mxLogger.error = (...msg) => logCache.add('error', msg);
mxLogger.trace = (...msg) => logCache.add('trace', msg);

export function isLogString(value) {

    for (const item in value) {
        if (typeof value[item] !== 'string') {
            return false;
        }
    }

    return true;

};

const createLogArgs = (type, args) => {

    const tinyArgs = [type];
    for (const item in args) {
        tinyArgs.push(args[item]);
    }

    return tinyArgs;

};

global.logger = {

    getData: () => clone(logCache.data),
    debug() { logCache.add.apply(this, createLogArgs('debug', arguments)) },
    log() { logCache.add.apply(this, createLogArgs('log', arguments)) },
    info() { logCache.add.apply(this, createLogArgs('info', arguments)) },
    warn() { logCache.add.apply(this, createLogArgs('warn', arguments)) },
    error() { logCache.add.apply(this, createLogArgs('error', arguments)) },
    trace() { logCache.add.apply(this, createLogArgs('trace', arguments)) },

    play: () => {
        for (const item in logCache.data) {
            if (Array.isArray(logCache.data[item].msg) && isLogString(logCache.data[item].msg)) {
                console[logCache.data[item].level](logCache.data[item].msg.join(' '));
            } else if (typeof logCache.data[item].msg === 'string') {
                console[logCache.data[item].level](logCache.data[item].msg);
            }
        }
    }

};

export default {
    getData: () => logCache.data,
    debug() { logCache.add.apply(this, createLogArgs('debug', arguments)) },
    log() { logCache.add.apply(this, createLogArgs('log', arguments)) },
    info() { logCache.add.apply(this, createLogArgs('info', arguments)) },
    warn() { logCache.add.apply(this, createLogArgs('warn', arguments)) },
    error() { logCache.add.apply(this, createLogArgs('error', arguments)) },
    trace() { logCache.add.apply(this, createLogArgs('trace', arguments)) },
};