/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import parse from 'html-react-parser';
import twemoji from 'twemoji';
import { emojiGroups, emojis, } from './emoji';
import { loadEmojiData, getEmojiData, ROW_EMOJIS_COUNT, ROW_STICKERS_COUNT } from './emojiData';

import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import AsyncSearch from '../../../util/AsyncSearch';
import { addToEmojiList, removeFromEmojiList } from './recent';
import { TWEMOJI_BASE_URL } from '../../../util/twemojify';
import { checkVisible } from '../../../util/tools';

import Text from '../../atoms/text/Text';
import IconButton from '../../atoms/button/IconButton';
import Input from '../../atoms/input/Input';
import ScrollView from '../../atoms/scroll/ScrollView';

// Emoji Config
let ROW_COUNT;
const cateogoryList = [
    [0, 'fa-solid fa-face-smile', 'Smilies'],
    [1, 'fa-solid fa-dog', 'Animals'],
    [2, 'fa-solid fa-mug-saucer', 'Food'],
    [3, 'fa-solid fa-futbol', 'Activities'],
    [4, 'fa-solid fa-camera', 'Travel'],
    [5, 'fa-solid fa-building', 'Objects'],
    [6, 'fa-solid fa-peace', 'Symbols'],
    [7, 'fa-solid fa-flag', 'Flags'],
];

// Emoji Groups
const EmojiGroup = React.memo(({ name, groupEmojis, className, isFav, }) => {
    function getEmojiBoard() {
        const emojiBoard = [];
        const totalEmojis = groupEmojis.length;

        for (let r = 0; r < totalEmojis; r += ROW_COUNT) {
            const emojiRow = [];
            for (let c = r; c < r + ROW_COUNT; c += 1) {
                const emojiIndex = c;
                if (emojiIndex >= totalEmojis) break;
                const emoji = groupEmojis[emojiIndex];
                emojiRow.push(
                    <span key={emojiIndex}>
                        {emoji.hexcode ? (
                            // This is a unicode emoji, and should be rendered with twemoji
                            <span

                                className={`emoji${emoji.isFav || isFav ? ' fav-emoji' : ''}`}
                                draggable="false"

                                alt={emoji.shortcodes?.toString()}
                                unicode={emoji.unicode}
                                shortcodes={emoji.shortcodes?.toString()}
                                tags={emoji.tags?.toString()}
                                label={emoji.label?.toString()}

                                hexcode={emoji.hexcode}
                                style={{ backgroundImage: `url("${TWEMOJI_BASE_URL}72x72/${emoji.hexcode.toLowerCase()}.png")` }}

                            />
                        ) : (
                            // This is a custom emoji, and should be render as an mxc
                            <span

                                className={`emoji${emoji.isFav || isFav ? ' fav-emoji' : ''}`}
                                draggable="false"


                                alt={emoji.shortcode}
                                unicode={`:${emoji.shortcode}:`}
                                shortcodes={emoji.shortcode}

                                style={{ backgroundImage: `url("${initMatrix.matrixClient.mxcUrlToHttp(emoji.mxc)}")` }}

                                data-mx-emoticon={emoji.mxc}

                            />
                        )}
                    </span>
                );
            }
            emojiBoard.push(
                <div key={r} className="emoji-row hide-emoji">
                    {emojiRow}
                </div>
            );
        }
        return emojiBoard;
    }

    return (
        <div className={`emoji-group${className ? ` ${className}` : ''}`}>
            <Text className="emoji-group__header" variant="b2" weight="bold">
                {name}
            </Text>
            {groupEmojis.length !== 0 && <div className="emoji-set noselect">{getEmojiBoard()}</div>}
        </div>
    );
});

EmojiGroup.propTypes = {
    isFav: PropTypes.bool,
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    groupEmojis: PropTypes.arrayOf(
        PropTypes.shape({
            length: PropTypes.number,
            unicode: PropTypes.string,
            hexcode: PropTypes.string,
            mxc: PropTypes.string,
            shortcode: PropTypes.string,
            shortcodes: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
        })
    ).isRequired,
};

// Search Emoji
const asyncSearch = new AsyncSearch();
asyncSearch.setup(emojis, { keys: ['shortcode', 'shortcodes', 'label', 'tags'], isContain: true, limit: 40 });
function SearchedEmoji({ scrollEmojisRef }) {

    // Searched
    const [searchedEmojis, setSearchedEmojis] = useState(null);

    // Set Search
    function handleSearchEmoji(resultEmojis, term) {

        if (term === '' || resultEmojis.length === 0) {
            if (term === '') setSearchedEmojis(null);
            else setSearchedEmojis({ emojis: [] });
            return;
        }

        setSearchedEmojis({ emojis: resultEmojis });
        setTimeout(() => { $(scrollEmojisRef.current).trigger('scroll'); }, 500);

    }

    // Effect
    useEffect(() => {
        asyncSearch.on(asyncSearch.RESULT_SENT, handleSearchEmoji);
        return () => {
            asyncSearch.removeListener(asyncSearch.RESULT_SENT, handleSearchEmoji);
        };
    }, []);

    // Nothing
    if (searchedEmojis === null) return false;

    // Complete
    return (
        <EmojiGroup
            key="-1"
            name={searchedEmojis.emojis.length === 0 ? 'No search result found' : 'Search results'}
            groupEmojis={searchedEmojis.emojis}
        />
    );

}

SearchedEmoji.propTypes = {
    scrollEmojisRef: PropTypes.shape({}).isRequired,
};

// Board
function EmojiBoard({ onSelect, searchRef, emojiBoardRef, scrollEmojisRef }) {

    // First Values
    const emojiInfo = useRef(null);
    const [boardType, setBoardType] = useState('emoji');
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const tinyTimeoutCollection = [];

    const [emojiFav, setEmojiFav] = useState([]);
    const [emojiData, setEmojiData] = useState([]);
    const [emojiRecent, setEmojiRecent] = useState([]);

    ROW_COUNT = (boardType !== 'sticker' ? ROW_EMOJIS_COUNT : ROW_STICKERS_COUNT);
    loadEmojiData(selectedRoomId);
    getEmojiData(boardType, emojiRecent, emojiFav, emojiData, setEmojiRecent, setEmojiFav, setEmojiData);

    // Check Emoji Visible
    function onScroll(event) {

        // Read Data
        for (let i = 0; i < tinyTimeoutCollection.length; i++) {
            if (tinyTimeoutCollection.length > 0) {
                const tinyTimeoutLoad = tinyTimeoutCollection.shift();
                clearTimeout(tinyTimeoutLoad);
            }
        }

        const target = $(event.target.childNodes[0]).find('.emoji-row');
        const existEmojiBoard = ($('#emoji-board').length > 0);

        if (existEmojiBoard) {
            target.each((index, element) => {

                const emojiGroup = $(element);
                tinyTimeoutCollection.push(setTimeout(() => {

                    // Is Visible
                    if (existEmojiBoard && checkVisible(element)) {
                        emojiGroup.removeClass('hide-emoji');
                    }

                }, 500));

            });
        }

    }

    function isTargetNotEmoji(target) {
        return target.hasClass('emoji') === false;
    }

    function getEmojiDataFromTarget(target) {

        const unicode = target.attr('unicode');
        const hexcode = target.attr('hexcode');
        const mxc = target.attr('data-mx-emoticon');
        const label = target.attr('label');
        let tags = target.attr('tags');
        let shortcodes = target.attr('shortcodes');

        if (typeof shortcodes === 'undefined') shortcodes = undefined;
        else shortcodes = shortcodes.split(',');

        if (typeof tags === 'undefined') tags = undefined;
        else tags = tags.split(',');

        return {
            unicode,
            hexcode,
            shortcodes,
            mxc,
            tags,
            label,
        };

    }

    function selectEmoji(e) {

        const el = $(e.target);
        if (isTargetNotEmoji(el)) return;

        const emoji = getEmojiDataFromTarget(el);
        onSelect(emoji);

        if (emoji.hexcode) {
            addToEmojiList({ isCustom: false, unicode: emoji.unicode, mxc: null }, 'recent_emoji', $(emojiBoardRef.current).attr('board-type'));
        } else {
            addToEmojiList({ isCustom: true, unicode: null, mxc: el.attr('data-mx-emoticon') }, 'recent_emoji', $(emojiBoardRef.current).attr('board-type'));
        }

    }

    function contextEmoji(e) {

        e.preventDefault();

        const el = $(e.target);
        if (isTargetNotEmoji(el)) return false;

        const emoji = getEmojiDataFromTarget(el);

        const typesAdd = {
            custom: { isCustom: true, unicode: null, mxc: el.attr('data-mx-emoticon') },
            noCustom: { isCustom: false, unicode: emoji.unicode, mxc: null }
        };

        if (!el.hasClass('fav-emoji')) {

            el.addClass('fav-emoji');

            if (emoji.hexcode) {
                addToEmojiList(typesAdd.noCustom, 'fav_emoji', $(emojiBoardRef.current).attr('board-type'));
            } else {
                addToEmojiList(typesAdd.custom, 'fav_emoji', $(emojiBoardRef.current).attr('board-type'));
            }

        } else {

            el.removeClass('fav-emoji');

            if (emoji.hexcode) {
                removeFromEmojiList(typesAdd.noCustom, 'fav_emoji', $(emojiBoardRef.current).attr('board-type'));
            } else {
                removeFromEmojiList(typesAdd.custom, 'fav_emoji', $(emojiBoardRef.current).attr('board-type'));
            }

        }

        return false;

    }

    function setEmojiInfo(emoji) {

        const el = $(emojiInfo.current);
        const infoEmoji = el.find('>:first-child >:first-child');
        const infoShortcode = el.find('>:last-child');

        infoEmoji.attr('src', emoji.src);
        infoEmoji.attr('alt', emoji.unicode);

        if (typeof emoji.label !== 'string' || emoji.label.trim().length < 1) {
            infoShortcode.text(`:${emoji.shortcode}:`);
        } else {
            infoShortcode.text(emoji.label);
        }

    }

    function hoverEmoji(e) {

        const el = $(e.target);
        const searchEl = $(searchRef.current);
        if (isTargetNotEmoji(el)) return;

        const { shortcodes, unicode, label, tags } = getEmojiDataFromTarget(el);

        let src;

        if (el.css('background-image')) {
            src = el.css('background-image').substring(5, el.css('background-image').length - 2);
        }

        if (!src || typeof shortcodes === 'undefined') {
            searchEl.attr('placeholder', 'Search');
            setEmojiInfo({
                unicode: '🙂',
                shortcode: 'slight_smile',
                src: 'https://twemoji.maxcdn.com/v/13.1.0/72x72/1f642.png',
            });
            return;
        }

        if (searchEl.attr('placeholder') === shortcodes[0]) return;
        searchEl.attr('placeholder', shortcodes[0]);
        setEmojiInfo({ shortcode: shortcodes[0], src, unicode, label, tags });

    }

    function handleSearchChange() {
        const term = $(searchRef.current).val();
        asyncSearch.search(term);
        $(scrollEmojisRef.current).scrollTop(0);
    }

    if (emojiBoardRef.current) {

        if (boardType === 'emoji') {
            ROW_COUNT = ROW_EMOJIS_COUNT;
        }

        if (boardType === 'sticker') {
            ROW_COUNT = ROW_STICKERS_COUNT;
        }

    }

    const recentOffset = emojiRecent.length > 0 ? 1 : 0;
    const favOffset = emojiFav.length > 0 ? 1 : 0;

    useEffect(() => {
        const updateAvailableEmoji = async (newRoomId) => {
            setSelectedRoomId(newRoomId);
        };

        const onOpen = (roomId, cords, requestEmojiCallback, dom) => {
            $(searchRef.current).val('');
            handleSearchChange();
            setBoardType(dom);
        };

        navigation.on(cons.events.navigation.ROOM_SELECTED, updateAvailableEmoji);
        navigation.on(cons.events.navigation.EMOJIBOARD_OPENED, onOpen);
        $(scrollEmojisRef.current).on('scroll', onScroll);
        return () => {
            $(scrollEmojisRef.current).off('scroll', onScroll);
            navigation.removeListener(cons.events.navigation.ROOM_SELECTED, updateAvailableEmoji);
            navigation.removeListener(cons.events.navigation.EMOJIBOARD_OPENED, onOpen);
        };

    }, []);

    function openGroup(groupOrder) {

        let tabIndex = groupOrder;
        const $emojiContent = $(scrollEmojisRef.current).find('>:first-child');

        const groupCount = $emojiContent.length;
        if (groupCount > emojiGroups.length) {
            tabIndex += groupCount - emojiGroups.length - emojiData.length - recentOffset - favOffset;
        }

        $emojiContent.children().get(tabIndex).scrollIntoView();

    }

    const categoryReader = ([indx, ico, name]) => (
        <IconButton
            onClick={() => openGroup(recentOffset + favOffset + emojiData.length + indx)}
            key={indx}
            fa={ico}
            tooltip={name}
            tooltipPlacement="left"
        />
    );

    setTimeout(() => {
        $('#emoji-board').parent().parent().parent().parent().parent()
            .addClass('emoji-board-tippy');
    }, 500);

    return (
        <div id="emoji-board" className="emoji-board" ref={emojiBoardRef}>
            <ScrollView invisible>
                <div className="emoji-board__nav">

                    {emojiFav.length > 0 && (
                        <IconButton
                            onClick={() => openGroup(0)}
                            fa='fa-solid fa-star'
                            tooltip="Favorites"
                            tooltipPlacement="left"
                        />
                    )}

                    {emojiRecent.length > 0 && (
                        <IconButton
                            onClick={() => openGroup(1)}
                            fa='fa-solid fa-clock-rotate-left'
                            tooltip="Recent"
                            tooltipPlacement="left"
                        />
                    )}

                    <div className="emoji-board__nav-custom">
                        {emojiData.map((pack) => {

                            const packItems = pack[boardType !== 'sticker' ? 'getEmojis' : 'getStickers']();
                            const src = initMatrix.matrixClient.mxcUrlToHttp(
                                pack.avatarUrl ?? packItems[0].mxc
                            );

                            return (
                                <IconButton
                                    className='emoji-group-button'
                                    onClick={() => openGroup(recentOffset + favOffset + pack.packIndex)}
                                    src={src}
                                    key={pack.packIndex}
                                    tooltip={pack.displayName ?? 'Unknown'}
                                    tooltipPlacement="left"
                                    isImage
                                />
                            );

                        })}
                    </div>
                    <div className="emoji-board__nav-twemoji">
                        {boardType === 'emoji' ? cateogoryList.map(categoryReader) : [].map(categoryReader)}
                    </div>
                </div>
            </ScrollView>
            <div className="emoji-board__content">
                <div className="emoji-board__content__search">
                    <Input onChange={handleSearchChange} forwardRef={searchRef} placeholder="Search" />
                </div>
                <div className="emoji-board__content__emojis">
                    <ScrollView ref={scrollEmojisRef} autoHide>
                        <div onMouseMove={hoverEmoji} onContextMenu={contextEmoji} onClick={selectEmoji}>

                            <SearchedEmoji scrollEmojisRef={scrollEmojisRef} />

                            {emojiFav.length > 0 && (
                                <EmojiGroup name="Favorites" groupEmojis={emojiFav} isFav />
                            )}

                            {emojiRecent.length > 0 && (
                                <EmojiGroup name="Recently used" groupEmojis={emojiRecent} />
                            )}

                            {emojiData.map((pack) => (
                                <EmojiGroup
                                    name={pack.displayName ?? 'Unknown'}
                                    key={pack.packIndex}
                                    groupEmojis={pack[boardType !== 'sticker' ? 'getEmojis' : 'getStickers']()}
                                    className="custom-emoji-group"
                                />
                            ))}

                            {emojiGroups.map((group) => (
                                <EmojiGroup className={boardType === 'sticker' ? 'd-none' : null} key={group.name} name={group.name} groupEmojis={group.emojis} />
                            ))}

                        </div>
                    </ScrollView>
                </div>
                <div ref={emojiInfo} className="emoji-board__content__info">
                    <div>{parse(twemoji.parse('🙂', { base: TWEMOJI_BASE_URL }))}</div>
                    <Text>:slight_smile:</Text>
                </div>
            </div>
        </div>
    );
}

EmojiBoard.propTypes = {
    onSelect: PropTypes.func.isRequired,
    searchRef: PropTypes.shape({}).isRequired,
    emojiBoardRef: PropTypes.shape({}).isRequired,
    scrollEmojisRef: PropTypes.shape({}).isRequired,
};

export default EmojiBoard;