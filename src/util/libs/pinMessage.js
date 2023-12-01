import initMatrix from '../../client/initMatrix';
import { getCurrentState } from "../matrixUtil";
import { objType } from '../tools';

const eventName = 'm.room.pinned_events';

export function getPinnedMessages(room) {

    const mx = initMatrix.matrixClient;

    const pinEvent = typeof room !== 'string' ?
        getCurrentState(room).getStateEvents(eventName) :
        getCurrentState(mx.getRoom(room)).getStateEvents(eventName) ?? [];

    if (Array.isArray(pinEvent) && pinEvent[0]) {

        const pinData = pinEvent[0].getContent();
        if (objType(pinData, 'object') && Array.isArray(pinData.pinned)) {
            return pinData.pinned;
        }

        return [];

    }

    return [];

};

export function setPinMessage(room, eventId) {

    // const content = getPinnedMessages(room);

};

global.getPinnedMessages = getPinnedMessages;