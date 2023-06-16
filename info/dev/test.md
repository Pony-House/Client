```js
const ponyCfg = room.currentState.getStateEvents('pony.house.settings');
ponyCfg.map((data, index) => {
  const yayData = { content: data?.getContent(), id: data?.getId(), key: data.getStateKey() };
  ponyCfg[index] = yayData;
  return data;
});
// const ponyCfgData = ponyCfg?;
// mx.sendStateEvent(room.roomId, 'pony.house.settings', {}, 'yay');
```
