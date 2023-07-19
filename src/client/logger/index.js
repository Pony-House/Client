
import { logger as mxLogger } from 'matrix-js-sdk/lib/logger';
import { consoleRemoveData, consoleNewData, consoleUpdate } from '../action/navigation';
import tinyAPI from '../../util/mods';

const logCache = {

    data: [],
    add: (level, msg) => {

        logCache.data.push({
            level,
            msg
        });

        if (logCache.data.length > 500) {

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

};

// rewrite matrix logger
mxLogger.info = (...msg) => logCache.add('info', msg);
mxLogger.log = (...msg) => logCache.add('log', msg);
mxLogger.warn = (...msg) => logCache.add('warn', msg);
mxLogger.error = (...msg) => logCache.add('error', msg);
mxLogger.trace = (...msg) => logCache.add('trace', msg);
