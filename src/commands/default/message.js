const rainbowCommand = {
  category: 'default',
  sub_category: 'message',
  type: 'msg',
  name: 'rainbowme',
  description: 'Send a rainbow message',
  exe: (roomId, data, onSuccess) => {
    const body = data.trim();
    if (body === '') return;
    onSuccess(`[rainbow]${body}[/rainbow]`, { msgType: 'm.text' });
  },
};

const messageCommands = {
  rainbow: rainbowCommand,
  rainbowme: rainbowCommand,

  me: {
    category: 'default',
    sub_category: 'message',
    type: 'msg',
    name: 'me',
    description: 'Display action',
    exe: (roomId, data, onSuccess) => {
      const body = data.trim();
      if (body === '') return;
      onSuccess(body, { msgType: 'm.emote' });
    },
  },

  tableflip: {
    category: 'default',
    sub_category: 'message',
    type: 'msg',
    name: 'tableflip',
    description: 'Send (╯°□°)╯︵ ┻━┻ as message',
    exe: (roomId, data, onSuccess) =>
      onSuccess(`(╯°□°)╯︵ ┻━┻${data.trim() !== '' ? ` ${data}` : ''}`, { msgType: 'm.text' }),
  },

  unflip: {
    category: 'default',
    sub_category: 'message',
    type: 'msg',
    name: 'unflip',
    description: 'Send ┬─┬ノ( º _ ºノ) as message',
    exe: (roomId, data, onSuccess) =>
      onSuccess(`┬─┬ノ( º _ ºノ)${data.trim() !== '' ? ` ${data}` : ''}`, { msgType: 'm.text' }),
  },

  shrug: {
    category: 'default',
    sub_category: 'message',
    type: 'msg',
    name: 'shrug',
    description: 'Send ¯\\_(ツ)_/¯ as message',
    exe: (roomId, data, onSuccess) =>
      onSuccess(`¯\\_(ツ)_/¯${data.trim() !== '' ? ` ${data}` : ''}`, { msgType: 'm.text' }),
  },

  plain: {
    sub_category: 'message',
    name: 'plain',
    type: 'msg',
    description: 'Send plain text message',
    exe: (roomId, data, onSuccess) => {
      const body = data.trim();
      if (body === '') return;
      onSuccess(body, { msgType: 'm.text', autoMarkdown: false });
    },
  },
};

export default messageCommands;
