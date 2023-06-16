/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './EmojiBoard.scss';

import parse from 'html-react-parser';
import twemoji from 'twemoji';
import { emojiGroups, emojis, addDefaultEmojisToList, resetEmojisList, addEmojiToList } from './emoji';
import { getRelevantPacks } from './custom-emoji';
import initMatrix from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import AsyncSearch from '../../../util/AsyncSearch';
import { addRecentEmoji, getRecentEmojis } from './recent';
import { TWEMOJI_BASE_URL } from '../../../util/twemojify';
import { checkVisible } from '../../../util/tools';

import Text from '../../atoms/text/Text';
import IconButton from '../../atoms/button/IconButton';
import Input from '../../atoms/input/Input';
import ScrollView from '../../atoms/scroll/ScrollView';

// Emoji Config
let ROW_EMOJIS_COUNT = 7;
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
const EmojiGroup = React.memo(({ name, groupEmojis, className }) => {
    function getEmojiBoard() {
        const emojiBoard = [];
        const totalEmojis = groupEmojis.length;

        for (let r = 0; r < totalEmojis; r += ROW_EMOJIS_COUNT) {
            const emojiRow = [];
            for (let c = r; c < r + ROW_EMOJIS_COUNT; c += 1) {
                const emojiIndex = c;
                if (emojiIndex >= totalEmojis) break;
                const emoji = groupEmojis[emojiIndex];
                emojiRow.push(
                    <span key={emojiIndex}>
                        {emoji.hexcode ? (
                            // This is a unicode emoji, and should be rendered with twemoji
                            <emoji

                                className="emoji"
                                draggable="false"

                                alt={emoji.shortcodes?.toString()}
                                unicode={emoji.unicode}
                                shortcodes={emoji.shortcodes?.toString()}

                                hexcode={emoji.hexcode}
                                style={{ backgroundImage: `url("${TWEMOJI_BASE_URL}72x72/${emoji.hexcode.toLowerCase()}.png")` }}

                            />
                        ) : (
                            // This is a custom emoji, and should be render as an mxc
                            <emoji

                                className="emoji"
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
asyncSearch.setup(emojis, { keys: ['shortcode'], isContain: true, limit: 40 });
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
        if (scrollEmojisRef.current) {
            setTimeout(() => { scrollEmojisRef.current.dispatchEvent(new CustomEvent('scroll')); }, 500);
        }
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
    // let tinyTimeoutEmoji = null;
    const tinyTimeoutCollection = [];

    // Get Function
    const getFunctionEmoji = () => {

        if (emojiBoardRef.current) {
            const boardType = emojiBoardRef.current.getAttribute('board-type');
            if (boardType === 'emoji') {
                ROW_EMOJIS_COUNT = 7;
                return 'getEmojis';
            }

            if (boardType === 'sticker') {
                ROW_EMOJIS_COUNT = 3;
                return 'getStickers';
            }
        }

        return 'getEmojis';

    };

    // Check Emoji Visible
    function onScroll(event) {

        // Read Data
        // if (tinyTimeoutEmoji) clearTimeout(tinyTimeoutEmoji);

        for (let i = 0; i < tinyTimeoutCollection.length; i++) {
            if (tinyTimeoutCollection.length > 0) {
                const tinyTimeoutLoad = tinyTimeoutCollection.shift();
                clearTimeout(tinyTimeoutLoad);
            }
        }

        // tinyTimeoutEmoji = 

        // setTimeout(() => {

        const target = event.target.childNodes[0].querySelectorAll('.emoji-row');
        const elements = Array.from(target);

        if (document.getElementById('emoji-board')) {
            elements.map(emojiGroup => {

                tinyTimeoutCollection.push(setTimeout(() => {

                    // Is Visible
                    if (document.getElementById('emoji-board') && checkVisible(emojiGroup)) {
                        emojiGroup.classList.remove('hide-emoji');
                    }

                }, 500));

                return emojiGroup;

            });
        }

        // }, 500);


    }

    function isTargetNotEmoji(target) {
        return target.classList.contains('emoji') === false;
    }
    function getEmojiDataFromTarget(target) {
        const unicode = target.getAttribute('unicode');
        const hexcode = target.getAttribute('hexcode');
        const mxc = target.getAttribute('data-mx-emoticon');
        let shortcodes = target.getAttribute('shortcodes');
        if (typeof shortcodes === 'undefined') shortcodes = undefined;
        else shortcodes = shortcodes.split(',');
        return {
            unicode,
            hexcode,
            shortcodes,
            mxc,
        };
    }

    function selectEmoji(e) {
        if (isTargetNotEmoji(e.target)) return;

        const emoji = getEmojiDataFromTarget(e.target);
        onSelect(emoji);
        if (emoji.hexcode) {
            addRecentEmoji({ isCustom: false, unicode: emoji.unicode, mxc: null });
        } else {
            addRecentEmoji({ isCustom: true, unicode: null, mxc: emoji.getAttribute('data-mx-emoticon') });
        }
    }

    function setEmojiInfo(emoji) {
        const infoEmoji = emojiInfo.current.firstElementChild.firstElementChild;
        const infoShortcode = emojiInfo.current.lastElementChild;

        infoEmoji.src = emoji.src;
        infoEmoji.alt = emoji.unicode;
        infoShortcode.textContent = `:${emoji.shortcode}:`;
    }

    function hoverEmoji(e) {
        if (isTargetNotEmoji(e.target)) return;

        const emoji = e.target;
        const { shortcodes, unicode } = getEmojiDataFromTarget(emoji);

        let src;

        if (e.target.style.backgroundImage) {
            src = e.target.style.backgroundImage.substring(5, e.target.style.backgroundImage.length - 2);
        }

        if (!src || typeof shortcodes === 'undefined') {
            searchRef.current.placeholder = 'Search';
            setEmojiInfo({
                unicode: '🙂',
                shortcode: 'slight_smile',
                src: 'https://twemoji.maxcdn.com/v/13.1.0/72x72/1f642.png',
            });
            return;
        }
        if (searchRef.current.placeholder === shortcodes[0]) return;
        searchRef.current.setAttribute('placeholder', shortcodes[0]);
        setEmojiInfo({ shortcode: shortcodes[0], src, unicode });
    }

    function handleSearchChange() {
        const term = searchRef.current.value;
        asyncSearch.search(term);
        scrollEmojisRef.current.scrollTop = 0;
    }

    const [availableEmojis, setAvailableEmojis] = useState([]);
    const [recentEmojis, setRecentEmojis] = useState([]);

    const recentOffset = recentEmojis.length > 0 ? 1 : 0;

    useEffect(() => {
        const updateAvailableEmoji = (selectedRoomId) => {

            const boardType = getFunctionEmoji();

            if (!selectedRoomId) {
                setAvailableEmojis([]);
                return;
            }

            const mx = initMatrix.matrixClient;
            const room = mx.getRoom(selectedRoomId);
            const parentIds = initMatrix.roomList.getAllParentSpaces(room.roomId);
            const parentRooms = [...parentIds].map((id) => mx.getRoom(id));
            if (room) {

                const packs = getRelevantPacks(room.client, [room, ...parentRooms]).filter(
                    (pack) => pack[boardType]().length !== 0
                );

                // Set an index for each pack so that we know where to jump when the user uses the nav
                for (let i = 0; i < packs.length; i += 1) {
                    packs[i].packIndex = i;
                }
                setAvailableEmojis(packs);
            }

        };

        const onOpen = () => {
            searchRef.current.value = '';
            handleSearchChange();

            // only update when board is getting opened to prevent shifting UI
            setRecentEmojis(getRecentEmojis(3 * ROW_EMOJIS_COUNT));
        };

        navigation.on(cons.events.navigation.ROOM_SELECTED, updateAvailableEmoji);
        navigation.on(cons.events.navigation.EMOJIBOARD_OPENED, onOpen);
        return () => {
            navigation.removeListener(cons.events.navigation.ROOM_SELECTED, updateAvailableEmoji);
            navigation.removeListener(cons.events.navigation.EMOJIBOARD_OPENED, onOpen);
        };
    }, []);

    function openGroup(groupOrder) {
        let tabIndex = groupOrder;
        const $emojiContent = scrollEmojisRef.current.firstElementChild;
        const groupCount = $emojiContent.childElementCount;
        if (groupCount > emojiGroups.length) {
            tabIndex += groupCount - emojiGroups.length - availableEmojis.length - recentOffset;
        }
        $emojiContent.children[tabIndex].scrollIntoView();
    }

    const boardType = getFunctionEmoji();
    const categoryReader = ([indx, ico, name]) => (
        <IconButton
            onClick={() => openGroup(recentOffset + availableEmojis.length + indx)}
            key={indx}
            fa={ico}
            tooltip={name}
            tooltipPlacement="left"
        />
    );

    resetEmojisList();
    if (boardType === 'getEmojis') addDefaultEmojisToList();

    return (
        <div id="emoji-board" className="emoji-board" ref={emojiBoardRef}>
            <ScrollView invisible>
                <div className="emoji-board__nav">
                    {boardType === 'getEmojis' ? (recentEmojis.length > 0 && (
                        <IconButton
                            onClick={() => openGroup(0)}
                            fa='fa-solid fa-clock-rotate-left'
                            tooltip="Recent"
                            tooltipPlacement="left"
                        />
                    )) : ''}
                    <div className="emoji-board__nav-custom">
                        {availableEmojis.map((pack) => {

                            const packItems = pack[boardType]();
                            for (const item in packItems) {
                                addEmojiToList({
                                    group: null,
                                    hexcode: null,
                                    label: packItems[item].shortcode,
                                    order: null,
                                    shortcode: packItems[item].shortcode,
                                    shortcodes: [packItems[item].shortcode],
                                    tags: [packItems[item].shortcode, 'custom'],
                                    src: initMatrix.matrixClient.mxcUrlToHttp(packItems[item].mxc),
                                    mxc: packItems[item].mxc,
                                    unicode: null
                                });
                            }


                            const src = initMatrix.matrixClient.mxcUrlToHttp(
                                pack.avatarUrl ?? packItems[0].mxc
                            );

                            return (
                                <IconButton
                                    className='emoji-group-button'
                                    onClick={() => openGroup(recentOffset + pack.packIndex)}
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
                        {boardType === 'getEmojis' ? cateogoryList.map(categoryReader) : [].map(categoryReader)}
                    </div>
                </div>
            </ScrollView>
            <div className="emoji-board__content">
                <div className="emoji-board__content__search">
                    <Input onChange={handleSearchChange} forwardRef={searchRef} placeholder="Search" />
                </div>
                <div className="emoji-board__content__emojis">
                    <ScrollView ref={scrollEmojisRef} onScroll={onScroll} autoHide>
                        <div onMouseMove={hoverEmoji} onClick={selectEmoji}>
                            <SearchedEmoji scrollEmojisRef={scrollEmojisRef} />
                            {boardType === 'getEmojis' ? (recentEmojis.length > 0 && (
                                <EmojiGroup name="Recently used" groupEmojis={recentEmojis} />
                            )) : ''}
                            {availableEmojis.map((pack) => (
                                <EmojiGroup
                                    name={pack.displayName ?? 'Unknown'}
                                    key={pack.packIndex}
                                    groupEmojis={pack[boardType]()}
                                    className="custom-emoji-group"
                                />
                            ))}
                            {emojiGroups.map((group) => (
                                <EmojiGroup className={boardType === 'getStickers' ? 'd-none' : null} key={group.name} name={group.name} groupEmojis={group.emojis} />
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