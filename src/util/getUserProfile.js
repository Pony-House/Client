import initMatrix from '../client/initMatrix';
import { getCurrentState } from './matrixUtil';

export function getUserProfile(content, profileRoom) {
  const mx = initMatrix.matrixClient;
  if (
    content &&
    content.presenceStatusMsg &&
    typeof content.presenceStatusMsg.roomId === 'string'
  ) {
    // Profile Room
    try {
      let room;
      if (!profileRoom) {
        room = mx.getRoom(content.presenceStatusMsg.roomId);
      } else {
        room = profileRoom;
      }

      if (room && room.roomId) {
        const roomTopic =
          getCurrentState(room).getStateEvents('m.room.topic')[0]?.getContent() ?? {};
        const bannerCfg =
          getCurrentState(room).getStateEvents('pony.house.settings', 'banner')?.getContent() ?? {};

        let bannerSrc = '';
        let topic = '';

        if (bannerCfg && typeof bannerCfg?.url === 'string' && bannerCfg?.url.length > 0) {
          bannerSrc = mx.mxcUrlToHttp(bannerCfg.url);
        }

        if (roomTopic && typeof roomTopic?.topic === 'string' && roomTopic?.topic.length > 0) {
          topic = roomTopic?.topic;
        }

        return { banner: bannerSrc, topic };
      }
    } catch (err) {
      console.error(err);
      return { banner: null, topic: null };
    }
  }

  return { banner: null, topic: null };
}

const getStateEvent = (roomId, where, path) =>
  new Promise((resolve) => {
    const mx = initMatrix.matrixClient;
    mx.getStateEvent(roomId, where, path)
      .then(resolve)
      .catch((err) => {
        console.error(err);
        resolve({});
      });
  });

export async function getUserProfileAsync(content) {
  if (
    content &&
    content.presenceStatusMsg &&
    typeof content.presenceStatusMsg.roomId === 'string'
  ) {
    // Profile Room
    try {
      const mx = initMatrix.matrixClient;
      const roomTopic = await getStateEvent(content.presenceStatusMsg.roomId, 'm.room.topic');
      const bannerCfg = await getStateEvent(
        content.presenceStatusMsg.roomId,
        'pony.house.settings',
        'banner',
      );

      let bannerSrc = '';
      let topic = '';

      if (bannerCfg && typeof bannerCfg?.url === 'string' && bannerCfg?.url.length > 0) {
        bannerSrc = mx.mxcUrlToHttp(bannerCfg.url);
      }

      if (roomTopic && typeof roomTopic?.topic === 'string' && roomTopic?.topic.length > 0) {
        topic = roomTopic?.topic;
      }

      return { banner: bannerSrc, topic };
    } catch (err) {
      console.error(err);
      return { banner: null, topic: null };
    }
  }

  return { banner: null, topic: null };
}
