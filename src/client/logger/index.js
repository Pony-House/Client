
import { logger as mxLogger } from 'matrix-js-sdk/lib/logger';
import tinyAPI from '../../util/mods';

const logCache = {

    data: [],
    add: (level, msg) => {

        logCache.data.push({
            level,
            msg
        });

        if (logCache.data.length > 500) {
            tinyAPI.emit('consoleRemoveData', logCache.data.shift());
        }

        tinyAPI.emit('consoleNewData', level, msg);
        tinyAPI.emit('consoleUpdate', logCache.data);

    }

};

// rewrite matrix logger
mxLogger.info = (...msg) => logCache.add('info', msg);
mxLogger.log = (...msg) => logCache.add('log', msg);
mxLogger.warn = (...msg) => logCache.add('warn', msg);
mxLogger.error = (...msg) => logCache.add('error', msg);
mxLogger.trace = (...msg) => logCache.add('trace', msg);
