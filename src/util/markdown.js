/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
import moment, { momentFormat } from '@src/util/libs/momentjs';
import SimpleMarkdown from '@khanacademy/simple-markdown';
import { idRegex, parseIdUri } from './common';
import rainbowText from './libs/rainbowText';
import { tinyFixScrollChat } from '../app/molecules/media/mediaFix';

// const discordRegex = /((`){1,3}|(\*){1,3}|(~){2}|(\|){2}|^(>){1,3}|(_){1,2})+/gm;

// Alternative syntax using RegExp constructor
// const discordRegex = new RegExp('((`){1,3}|(\\*){1,3}|(~){2}|(\\|){2}|^(>){1,3}|(_){1,2})+', 'gm')

/**
 * https://github.com/discordjs/discord-api-types/blob/main/globals.ts
 * https://discord.com/developers/docs/reference#message-formatting-formats
 */
export const DiscordFormattingPatterns = {
  /**
   * Regular expression for matching a user mention, strictly without a nickname
   *
   * The `id` group property is present on the `exec` result of this expression
   */
  User: /<@(?<id>\d{17,20})>/,
  /**
   * Regular expression for matching a user mention, strictly with a nickname
   *
   * The `id` group property is present on the `exec` result of this expression
   *
   * @deprecated Passing `!` in user mentions is no longer necessary / supported, and future message contents won't have it
   */
  UserWithNickname: /<@!(?<id>\d{17,20})>/,
  /**
   * Regular expression for matching a user mention, with or without a nickname
   *
   * The `id` group property is present on the `exec` result of this expression
   *
   * @deprecated Passing `!` in user mentions is no longer necessary / supported, and future message contents won't have it
   */
  UserWithOptionalNickname: /<@!?(?<id>\d{17,20})>/,
  /**
   * Regular expression for matching a channel mention
   *
   * The `id` group property is present on the `exec` result of this expression
   */
  Channel: /<#(?<id>\d{17,20})>/,
  /**
   * Regular expression for matching a role mention
   *
   * The `id` group property is present on the `exec` result of this expression
   */
  Role: /<@&(?<id>\d{17,20})>/,
  /**
   * Regular expression for matching a application command mention
   *
   * The `fullName` (possibly including `name`, `subcommandOrGroup` and `subcommand`) and `id` group properties are present on the `exec` result of this expression
   */
  SlashCommand:
    /<\/(?<fullName>(?<name>[-_\p{Letter}\p{Number}\p{sc=Deva}\p{sc=Thai}]{1,32})(?: (?<subcommandOrGroup>[-_\p{Letter}\p{Number}\p{sc=Deva}\p{sc=Thai}]{1,32}))?(?: (?<subcommand>[-_\p{Letter}\p{Number}\p{sc=Deva}\p{sc=Thai}]{1,32}))?):(?<id>\d{17,20})>/u,
  /**
   * Regular expression for matching a custom emoji, either static or animated
   *
   * The `animated`, `name` and `id` group properties are present on the `exec` result of this expression
   */
  Emoji: /<(?<animated>a)?:(?<name>\w{2,32}):(?<id>\d{17,20})>/,
  /**
   * Regular expression for matching strictly an animated custom emoji
   *
   * The `animated`, `name` and `id` group properties are present on the `exec` result of this expression
   */
  AnimatedEmoji: /<(?<animated>a):(?<name>\w{2,32}):(?<id>\d{17,20})>/,
  /**
   * Regular expression for matching strictly a static custom emoji
   *
   * The `name` and `id` group properties are present on the `exec` result of this expression
   */
  StaticEmoji: /<:(?<name>\w{2,32}):(?<id>\d{17,20})>/,
  /**
   * Regular expression for matching a timestamp, either default or custom styled
   *
   * The `timestamp` and `style` group properties are present on the `exec` result of this expression
   */
  // eslint-disable-next-line prefer-named-capture-group
  Timestamp: /<t:(?<timestamp>-?\d{1,13})(:(?<style>[DFRTdft]))?>/,
  /**
   * Regular expression for matching strictly default styled timestamps
   *
   * The `timestamp` group property is present on the `exec` result of this expression
   */
  DefaultStyledTimestamp: /<t:(?<timestamp>-?\d{1,13})>/,
  /**
   * Regular expression for matching strictly custom styled timestamps
   *
   * The `timestamp` and `style` group properties are present on the `exec` result of this expression
   */
  StyledTimestamp: /<t:(?<timestamp>-?\d{1,13}):(?<style>[DFRTdft])>/,
};

const timestampFormats = {};

export const startTimestamp = () => {
  timestampFormats.t = momentFormat.clock;
  timestampFormats.T = momentFormat.clock2;

  timestampFormats.d = momentFormat.calendar;
  timestampFormats.D = `MMMM DD, YYYY`;

  timestampFormats.f = () => `MMMM DD, YYYY ${momentFormat.clock()}`;
  timestampFormats.F = () => `dddd MMMM DD, YYYY ${momentFormat.clock()}`;
};

timestampFormats.validated = [];

timestampFormats.html = (item, fromNow = false) => {
  timestampFormats.validated.push(item);

  return {
    order: defaultRules.inlineCode.order + 0.1,
    match: inlineRegex(new RegExp(`^{t:(?<timestamp>-?\\d{1,13})(:${item})?}`, 'g')),

    parse: (capture, parse, state) => ({
      content: parse(capture[1], state),
    }),

    plain: (node, output, state) =>
      `{t:${!node.state ? output(node.content, state) : String(Number(node.content) / 1000)}:${item}}`,
    html: (node, output, state) => {
      const timestamp = Number(output(node.content, node.state || state)) * 1000;

      return htmlTag(
        'span',
        !fromNow
          ? moment(timestamp).format(
              typeof timestampFormats[item] === 'function'
                ? timestampFormats[item]()
                : timestampFormats[item],
            )
          : moment(timestamp).fromNow(),
        { 'data-mx-timestamp': String(timestamp), 'timestamp-type': item },
      );
    },
  };
};

setInterval(() => {
  const timestamps = Array.from(document.querySelectorAll('[data-mx-timestamp]'));
  if (timestamps.length > 0) {
    timestamps.map((item) => {
      const tinyItem = $(item);
      const type = item.getAttribute('timestamp-type');
      const timestamp = Number(item.getAttribute('data-mx-timestamp'));

      if (!Number.isNaN(timestamp) && typeof type === 'string') {
        if (type !== 'R') {
          tinyItem.text(
            moment(timestamp).format(
              typeof timestampFormats[type] === 'function'
                ? timestampFormats[type]()
                : timestampFormats[type],
            ),
          );
        } else {
          tinyItem.text(moment(timestamp).fromNow());
        }
      }

      if (!tinyItem.hasClass('with-tooltip')) {
        tinyItem.attr('title', moment(timestamp).format(timestampFormats.F()));
        tinyItem.addClass('with-tooltip');
        tinyItem.tooltip();
      }

      return item;
    });
  }

  tinyFixScrollChat(50);
}, 1000);

const {
  defaultRules,
  parserFor,
  outputFor,
  anyScopeRegex,
  blockRegex,
  inlineRegex,
  sanitizeText,
  sanitizeUrl,
} = SimpleMarkdown;

function htmlTag(tagName, content, attributes, isClosed) {
  let s = '';
  Object.entries(attributes ?? {}).forEach(([k, v]) => {
    if (v !== undefined) {
      s += ` ${sanitizeText(k)}`;
      if (v !== null) s += `="${sanitizeText(v)}"`;
    }
  });

  s = `<${tagName}${s}>`;

  if (isClosed === false) {
    return s;
  }
  return `${s}${content}</${tagName}>`;
}

function mathHtml(wrap, node) {
  return htmlTag(wrap, htmlTag('code', sanitizeText(node.content)), {
    'data-mx-maths': node.content,
  });
}

const emojiRegex = /^:([\w-]+):/;

const plainRules = {
  Array: {
    ...defaultRules.Array,
    plain: defaultRules.Array.html,
  },
  userMention: {
    order: defaultRules.em.order - 0.9,
    match: inlineRegex(idRegex('@', undefined, '^')),
    parse: (capture, _, state) => ({
      type: 'mention',
      content: state.userNames?.[capture[1]] ? `@${state.userNames[capture[1]]}` : capture[1],
      id: capture[1],
    }),
  },
  roomMention: {
    order: defaultRules.em.order - 0.8,
    match: inlineRegex(idRegex('#', undefined, '^')),
    parse: (capture) => ({ type: 'mention', content: capture[1], id: capture[1] }),
  },
  mention: {
    plain: (node, _, state) => (state.kind === 'edit' ? node.id : node.content),
    html: (node) =>
      htmlTag('a', sanitizeText(node.content), {
        href: `https://matrix.to/#/${encodeURIComponent(node.id)}`,
      }),
  },
  emoji: {
    order: defaultRules.em.order - 0.1,
    match: (source, state) => {
      if (!state.inline) return null;
      const capture = emojiRegex.exec(source);
      if (!capture) return null;
      const emoji = state.emojis?.get?.(capture[1]);
      if (emoji) return capture;
      return null;
    },
    parse: (capture, _, state) => ({ content: capture[1], emoji: state.emojis?.get?.(capture[1]) }),
    plain: ({ emoji }) => (emoji.mxc ? `:${emoji.shortcode}:` : emoji.unicode),
    html: ({ emoji }) =>
      emoji.mxc
        ? htmlTag(
            'img',
            null,
            {
              'data-mx-emoticon': null,
              src: emoji.mxc,
              alt: `:${emoji.shortcode}:`,
              title: `:${emoji.shortcode}:`,
              height: 32,
            },
            false,
          )
        : emoji.unicode,
  },
  newline: {
    ...defaultRules.newline,
    match: blockRegex(/^ *\n/),
    plain: () => '\n',
    html: () => '<br>',
  },
  paragraph: {
    ...defaultRules.paragraph,
    match: blockRegex(/^([^\n]*)\n?/),
    plain: (node, output, state) => `${output(node.content, state)}\n`,
    html: (node, output, state) => `${output(node.content, state)}<br>`,
  },
  escape: {
    ...defaultRules.escape,
    plain: (node, output, state) => `\\${output(node.content, state)}`,
  },
  br: {
    ...defaultRules.br,
    match: anyScopeRegex(/^ *\n/),
    plain: () => '\n',
  },
  text: {
    ...defaultRules.text,
    match: anyScopeRegex(/^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff]| *\n|\w+:\S|$)/),
    plain: (node) => node.content,
  },
};

const markdownRules = {
  // Default
  ...defaultRules,
  ...plainRules,

  // Heading
  heading: {
    ...defaultRules.heading,
    match: blockRegex(/^(#{1,6}) ([^\n]+?)(\n|$)/),
    plain: (node, output, state) => {
      const out = output(node.content, state);
      if (state.kind === 'edit' || state.kind === 'notification' || node.level > 2) {
        return `${'#'.repeat(node.level)} ${out}\n`;
      }
      return `${out}\n${(node.level === 1 ? '=' : '-').repeat(out.length)}\n`;
    },
  },
  hr: {
    ...defaultRules.hr,
    match: blockRegex(/^---\n/),
    plain: () => '---\n',
  },

  // Code Block
  codeBlock: {
    ...defaultRules.codeBlock,
    // match: blockRegex(/^(`{3}.*[\n\r][^]*?^`{3})$/gm),
    /*
        html: (node) => {

      const autoCode = () => {
        resizeWindowChecker();
        const tinyCode = hljs.highlightAuto(node.content);
        return `<pre><code class='chatbox-size-fix language-${tinyCode.language} hljs'>${tinyCode.value}</code></pre>`;
      };

      if (!node.lang) { return autoCode(); }

      const langs = hljs.listLanguages();
      if (langs.indexOf(node.lang) > -1) {
        resizeWindowChecker();
        return `<pre><code class='chatbox-size-fix language-${node.lang} hljs'>${hljs.highlight(node.content, { language: node.lang }).value}</code></pre>`;
      }

      return autoCode();

    },
    */
    plain: (node) => `\`\`\`${node.lang || ''}\n${node.content}\n\`\`\``,
    html: (node) =>
      htmlTag(
        'pre',
        htmlTag('code', sanitizeText(node.content), {
          class: node.lang ? `language-${node.lang}` : undefined,
        }),
      ),
  },

  // Fence
  fence: {
    ...defaultRules.fence,
    match: blockRegex(/^ *(```) *(?:(\S+) *)?\n([\s\S]+?)\n?\1/),
  },

  // Block Quote
  blockQuote: {
    ...defaultRules.blockQuote,
    match: blockRegex(/^(> [^\n]+(\n> [^\n]+)*\n?)+/),
    parse: (capture, parse, state) => {
      const content = capture[0].replace(/^> /gm, '');
      return {
        content: parse(`${content}`, state),
      };
    },
    plain: (node, output, state) =>
      `> ${output(node.content, state).trim().replace(/\n/g, '\n> ')}\n`,
    html: (node, output, state) => htmlTag('blockquote', output(node.content, state)),
  },

  // List
  list: {
    ...defaultRules.list,
    match: (source, state) => {
      // only - is a valid bullet point
      const LIST_BULLET = '(?:-|\\d+\\.)';
      const LIST_R = new RegExp(
        `^( *)(${LIST_BULLET}) ` +
          `[\\s\\S]+?(?:\n{2,}(?! )` +
          `(?!\\1${LIST_BULLET} )\\n*` +
          // the \\s*$ here is so that we can parse the inside of nested
          // lists, where our content might end before we receive two `\n`s
          `|\\s*\n*$)`,
      );
      const prevCaptureStr = state.prevCapture == null ? '' : state.prevCapture[0];
      const isStartOfLineCapture = /(?:^|\n)( *)$/.exec(prevCaptureStr);
      const isListBlock = state._list || !state.inline;

      if (isStartOfLineCapture && isListBlock) {
        source = isStartOfLineCapture[1] + source;
        return LIST_R.exec(source);
      }
      return null;
    },
    plain: (node, output, state) => {
      const oldList = state._list;
      state._list = true;

      let items = node.items
        .map((item, i) => {
          const prefix = node.ordered ? `${node.start + i}. ` : '* ';
          return prefix + output(item, state).replace(/\n/g, `\n${' '.repeat(prefix.length)}`);
        })
        .join('\n');

      state._list = oldList;

      if (!state._list) {
        items += '\n\n';
      }

      return items;
    },
  },

  // ???
  def: undefined,

  // Table
  table: {
    ...defaultRules.table,
    plain: (node, output, state) => {
      const header = node.header.map((content) => output(content, state));

      const colWidth = node.align.map((align) => {
        switch (align) {
          case 'left':
          case 'right':
            return 2;
          case 'center':
            return 3;
          default:
            return 1;
        }
      });
      header.forEach((s, i) => {
        if (s.length > colWidth[i]) colWidth[i] = s.length;
      });

      const cells = node.cells.map((row) =>
        row.map((content, i) => {
          const s = output(content, state);
          if (colWidth[i] === undefined || s.length > colWidth[i]) {
            colWidth[i] = s.length;
          }
          return s;
        }),
      );

      function pad(s, i) {
        switch (node.align[i]) {
          case 'right':
            return s.padStart(colWidth[i]);
          case 'center':
            return s
              .padStart(s.length + Math.floor((colWidth[i] - s.length) / 2))
              .padEnd(colWidth[i]);
          default:
            return s.padEnd(colWidth[i]);
        }
      }

      const line = colWidth.map((len, i) => {
        switch (node.align[i]) {
          case 'left':
            return `:${'-'.repeat(len - 1)}`;
          case 'center':
            return `:${'-'.repeat(len - 2)}:`;
          case 'right':
            return `${'-'.repeat(len - 1)}:`;
          default:
            return '-'.repeat(len);
        }
      });

      const table = [header.map(pad), line, ...cells.map((row) => row.map(pad))];

      return table.map((row) => `| ${row.join(' | ')} |\n`).join('');
    },
  },

  // Display Math
  displayMath: {
    order: defaultRules.table.order + 0.1,
    match: blockRegex(/^ *\$\$ *\n?([\s\S]+?)\n?\$\$ *(?:\n *)*\n/),
    parse: (capture) => ({ content: capture[1] }),
    plain: (node) =>
      node.content.includes('\n') ? `$$\n${node.content}\n$$\n` : `$$${node.content}$$\n`,
    html: (node) => mathHtml('div', node),
  },

  // Shrug
  shrug: {
    order: defaultRules.escape.order - 0.1,
    match: inlineRegex(/^¯\\_\(ツ\)_\/¯/),
    parse: (capture) => ({ type: 'text', content: capture[0] }),
  },

  // Table Separator
  tableSeparator: {
    ...defaultRules.tableSeparator,
    plain: () => ' | ',
  },

  // Link
  link: {
    ...defaultRules.link,
    plain: (node, output, state) => {
      const out = output(node.content, state);
      const target = sanitizeUrl(node.target) || '';

      if (out !== target || node.title) {
        return `[${out}](${target}${node.title ? ` "${node.title}"` : ''})`;
      }

      return out;
    },
    html: (node, output, state) => {
      const out = output(node.content, state);
      const target = sanitizeUrl(node.target) || '';

      if (out !== target || node.title) {
        return htmlTag('a', out, {
          href: target,
          title: node.title,
        });
      }

      return target;
    },
  },
  image: {
    ...defaultRules.image,
    plain: (node) =>
      `![${node.alt}](${sanitizeUrl(node.target) || ''}${node.title ? ` "${node.title}"` : ''})`,
    html: (node) =>
      htmlTag(
        'img',
        '',
        {
          src: sanitizeUrl(node.target) || '',
          alt: node.alt,
          title: node.title,
        },
        false,
      ),
  },

  // Ref
  reflink: undefined,
  refimage: undefined,

  // Others
  em: {
    ...defaultRules.em,
    match: inlineRegex(
      new RegExp(
        // only match _s surrounding words.
        '^\\b_' +
          '((?:__|\\\\[\\s\\S]|[^\\\\_])+?)_' +
          '\\b' +
          // Or match *s:
          '|' +
          // Only match *s that are followed by a non-space:
          '^\\*(?=\\S)(' +
          // Match at least one of:
          '(?:' +
          //  - `**`: so that bolds inside italics don't close the
          //          italics
          '\\*\\*|' +
          //  - escape sequence: so escaped *s don't close us
          '\\\\[\\s\\S]|' +
          //  - whitespace: followed by a non-* (we don't
          //          want ' *' to close an italics--it might
          //          start a list)
          '\\s+(?:\\\\[\\s\\S]|[^\\s\\*\\\\]|\\*\\*)|' +
          //  - non-whitespace, non-*, non-backslash characters
          '[^\\s\\*\\\\]' +
          ')+?' +
          // followed by a non-space, non-* then *
          ')\\*(?!\\*)',
      ),
    ),
    plain: (node, output, state) => `_${output(node.content, state)}_`,
  },
  strong: {
    ...defaultRules.strong,
    plain: (node, output, state) => `**${output(node.content, state)}**`,
  },
  u: {
    ...defaultRules.u,
    plain: (node, output, state) => `__${output(node.content, state)}__`,
  },
  del: {
    ...defaultRules.del,
    plain: (node, output, state) => `~~${output(node.content, state)}~~`,
  },

  // Rainbow
  rainbow: {
    order: defaultRules.inlineCode.order + 0.1,
    match: inlineRegex(/\[rainbow\]([\s\S]+?)\[\/rainbow\]/g),
    parse: (capture, parse, state) => ({
      content: parse(capture[1], state),
    }),
    plain: (node, output, state) => output(node.content, state),
    html: (node, output, state) => rainbowText(output(node.content, state)),
  },

  fixprotection: {
    order: defaultRules.inlineCode.order + 0.1,
    match: inlineRegex(/^\<([\s\S]+?)\>/g),
    parse: (capture, parse, state) => ({
      content: parse(capture[1], state),
    }),
    plain: (node, output, state) => `<${output(node.content, state)}>`,
    html: (node, output, state) => htmlTag('span', output(node.content, state)),
  },

  // Inline Code
  inlineCode: {
    ...defaultRules.inlineCode,
    match: inlineRegex(/^(`+)([^\n]*?[^`\n])\1(?!`)/),
    plain: (node) => `\`${node.content}\``,
  },

  // Spoiler
  spoiler: {
    order: defaultRules.inlineCode.order + 0.1,
    match: inlineRegex(/^\|\|([\s\S]+?)\|\|(?:\(([\s\S]+?)\))?/),
    parse: (capture, parse, state) => ({
      content: parse(capture[1], state),
      reason: capture[2],
    }),
    plain: (node, output, state) => {
      const warning = `spoiler${node.reason ? `: ${node.reason}` : ''}`;

      switch (state.kind) {
        case 'edit':
          return `||${output(node.content, state)}||${node.reason ? `(${node.reason})` : ''}`;
        case 'notification':
          return `<${warning}>`;
        default:
          return `[${warning}](${output(node.content, state)})`;
      }
    },
    html: (node, output, state) =>
      htmlTag('span', output(node.content, state), { 'data-mx-spoiler': node.reason || null }),
  },

  // Timestamp
  timestamp_t: timestampFormats.html('t'),
  timestamp_T: timestampFormats.html('T'),
  timestamp_d: timestampFormats.html('d'),
  timestamp_D: timestampFormats.html('D'),
  timestamp_f: timestampFormats.html('f'),
  timestamp_F: timestampFormats.html('F'),
  timestamp_R: timestampFormats.html('R', true),

  // Math
  inlineMath: {
    order: defaultRules.del.order + 0.2,
    match: inlineRegex(/^\$(\S[\s\S]+?\S|\S)\$(?!\d)/),
    parse: (capture) => ({ content: capture[1] }),
    plain: (node) => `$${node.content}$`,
    html: (node) => mathHtml('span', node),
  },
};

// Convert Code back to script
function mapElement(el) {
  switch (el.tagName) {
    case 'MX-REPLY':
      return [];

    case 'P':
      return [{ type: 'paragraph', content: mapChildren(el) }];
    case 'BR':
      return [{ type: 'br' }];

    case 'H1':
    case 'H2':
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6':
      return [{ type: 'heading', level: Number(el.tagName[1]), content: mapChildren(el) }];
    case 'HR':
      return [{ type: 'hr' }];
    case 'PRE': {
      let lang;
      const firstChild = el.firstChild;
      if (firstChild) {
        Array.from(firstChild.classList).some((c) => {
          const langPrefix = 'language-';
          if (c.startsWith(langPrefix)) {
            lang = c.slice(langPrefix.length);
            return true;
          }
          return false;
        });
      }
      return [{ type: 'codeBlock', lang, content: el.innerText }];
    }
    case 'BLOCKQUOTE':
      return [{ type: 'blockQuote', content: mapChildren(el) }];
    case 'UL':
      return [{ type: 'list', items: Array.from(el.childNodes).map(mapNode) }];
    case 'OL':
      return [
        {
          type: 'list',
          ordered: true,
          start: Number(el.getAttribute('start')),
          items: Array.from(el.childNodes).map(mapNode),
        },
      ];
    case 'TABLE': {
      const headerEl = Array.from(el.querySelector('thead > tr').childNodes);
      const align = headerEl.map((childE) => childE.style['text-align']);
      return [
        {
          type: 'table',
          header: headerEl.map(mapChildren),
          align,
          cells: Array.from(el.querySelectorAll('tbody > tr')).map((rowEl) =>
            Array.from(rowEl.childNodes).map((childEl, i) => {
              if (align[i] === undefined) align[i] = childEl.style['text-align'];
              return mapChildren(childEl);
            }),
          ),
        },
      ];
    }
    case 'A': {
      const href = el.getAttribute('href');

      const id = parseIdUri(href);
      if (id) return [{ type: 'mention', content: el.innerText, id }];

      return [
        {
          type: 'link',
          target: el.getAttribute('href'),
          title: el.getAttribute('title'),
          content: mapChildren(el),
        },
      ];
    }
    case 'IMG': {
      const src = el.getAttribute('src');
      let title = el.getAttribute('title');

      if (el.hasAttribute('data-mx-emoticon')) {
        if (title.length > 2 && title.startsWith(':') && title.endsWith(':')) {
          title = title.slice(1, -1);
        }
        return [
          {
            type: 'emoji',
            content: title,
            emoji: {
              mxc: src,
              shortcode: title,
            },
          },
        ];
      }

      return [
        {
          type: 'image',
          alt: el.getAttribute('alt'),
          target: src,
          title,
        },
      ];
    }
    case 'EM':
    case 'I':
      return [{ type: 'em', content: mapChildren(el) }];
    case 'STRONG':
    case 'B':
      return [{ type: 'strong', content: mapChildren(el) }];
    case 'U':
      return [{ type: 'u', content: mapChildren(el) }];
    case 'DEL':
    case 'STRIKE':
      return [{ type: 'del', content: mapChildren(el) }];
    case 'CODE':
      return [{ type: 'inlineCode', content: el.innerText }];

    case 'DIV':
      if (el.hasAttribute('data-mx-maths')) {
        return [{ type: 'displayMath', content: el.getAttribute('data-mx-maths') }];
      }
      return mapChildren(el);
    case 'SPAN':
      if (el.hasAttribute('data-mx-spoiler')) {
        return [
          { type: 'spoiler', reason: el.getAttribute('data-mx-spoiler'), content: mapChildren(el) },
        ];
      }

      if (el.hasAttribute('data-mx-maths')) {
        return [{ type: 'inlineMath', content: el.getAttribute('data-mx-maths') }];
      }

      if (el.hasAttribute('data-mx-timestamp')) {
        const type = el.getAttribute('timestamp-type');
        if (typeof type === 'string' && timestampFormats.validated.indexOf(type) > -1) {
          return [
            {
              type: `timestamp_${type}`,
              content: el.getAttribute('data-mx-timestamp'),
              state: type,
            },
          ];
        }
      }

      return mapChildren(el);

    default:
      return mapChildren(el);
  }
}

function mapNode(n) {
  switch (n.nodeType) {
    case Node.TEXT_NODE:
      return [{ type: 'text', content: n.textContent }];
    case Node.ELEMENT_NODE:
      return mapElement(n);
    default:
      return [];
  }
}

function mapChildren(n) {
  return Array.from(n.childNodes).reduce((ast, childN) => {
    ast.push(...mapNode(childN));
    return ast;
  }, []);
}

function render(content, state, plainOut, htmlOut) {
  let c = content;
  if (content.length === 1 && content[0].type === 'paragraph') {
    c = c[0].content;
  }

  const plainStr = plainOut(c, state).trim();
  if (state.onlyPlain) return { plain: plainStr };

  const htmlStr = htmlOut(c, state);

  const plainHtml = htmlStr
    .replace(/<br>/g, '\n')
    .replace(/<\/p><p>/g, '\n\n')
    .replace(/<\/?p>/g, '');
  const onlyPlain = sanitizeText(plainStr) === plainHtml;

  return {
    onlyPlain,
    plain: plainStr,
    html: htmlStr,
  };
}

const plainParser = parserFor(plainRules, { disableAutoBlockNewlines: true });
const plainPlainOut = outputFor(plainRules, 'plain');
const plainHtmlOut = outputFor(plainRules, 'html');

export const mdParser = parserFor(markdownRules, { disableAutoBlockNewlines: true });
const mdPlainOut = outputFor(markdownRules, 'plain');
const mdHtmlOut = outputFor(markdownRules, 'html');

export function plain(source, state) {
  return render(plainParser(source, state), state, plainPlainOut, plainHtmlOut);
}

export function markdown(source, state) {
  return render(mdParser(source, state), state, mdPlainOut, mdHtmlOut);
}

export function html(source, state) {
  const el = document.createElement('template');
  el.innerHTML = source;
  return render(mapChildren(el.content), state, mdPlainOut, mdHtmlOut);
}
