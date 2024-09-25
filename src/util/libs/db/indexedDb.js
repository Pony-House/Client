import { Connection } from 'jsstore';

export const startDb = async (tinyThis) => {
  // Prepare script
  tinyThis.storeConnection = new Connection(new Worker('jsstore.worker.min.js'));

  // Complete
  const isDbCreated = await tinyThis.storeConnection.initDb({
    name: tinyThis.dbName,
    version: tinyThis._dbVersion,
    tables: [
      {
        name: 'timeline',
        columns: {
          event_id: { primaryKey: true, autoIncrement: false },

          type: { notNull: false, dataType: 'string' },
          sender: { notNull: false, dataType: 'string' },
          room_id: { notNull: false, dataType: 'string' },
          thread_id: { notNull: false, dataType: 'string' },

          content: { notNull: false, dataType: 'object' },
          unsigned: { notNull: false, dataType: 'object' },
          embeds: { notNull: false, dataType: 'array' },

          redaction: { notNull: true, dataType: 'boolean' },
          origin_server_ts: { notNull: true, dataType: 'number' },
        },
      },

      {
        name: 'members',
        columns: {
          id: { primaryKey: true, autoIncrement: false },
          type: { notNull: false, dataType: 'string' },

          user_id: { notNull: false, dataType: 'string' },
          room_id: { notNull: false, dataType: 'string' },
          origin_server_ts: { notNull: true, dataType: 'number' },
        },
      },
    ],
  });
  return isDbCreated;
};
