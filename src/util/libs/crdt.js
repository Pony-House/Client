export function messageIsCrdt(mEvent) {
    const msgType = mEvent.getContent()?.msgtype;
    return (typeof msgType === 'string' && msgType.startsWith('matrix-crdt.'));
};