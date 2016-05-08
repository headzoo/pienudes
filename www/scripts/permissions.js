'use strict';

module.exports = {
    SEE_PLAYLIST: "seeplaylist",          // SEE THE PLAYLIST
    PLAYLIST_ADD: "playlistadd",         // ADD VIDEO TO THE PLAYLIST
    PLAYLIST_NEXT: "playlistnext",        // ADD A VIDEO NEXT ON THE PLAYLIST
    PLAYLIST_MOVE: "playlistmove",        // MOVE A VIDEO ON THE PLAYLIST
    PLAYLIST_DELETE: "playlistdelete",        // DELETE A VIDEO FROM THE PLAYLIST
    PLAYLIST_JUMP: "playlistjump",        // START A DIFFERENT VIDEO ON THE PLAYLIST
    PLAYLIST_ADD_LIST: "playlistaddlist",     // ADD A LIST OF VIDEOS TO THE PLAYLIST
    PLAYLIST_SHUFFLE: "playlistshuffle",       // SHUFFLE THE PLAYLIST
    PLAYLIST_CLEAR: "playlistclear",         // CLEAR THE PLAYLIST
    PLAYLIST_LOCK: "playlistlock",          // LOCK/UNLOCK THE PLAYLIST
    O_PLAYLIST_ADD: "oplaylistadd",         // SAME AS ABOVE, BUT FOR OPEN (UNLOCKED) PLAYLIST
    O_PLAYLIST_NEXT: "oplaylistnext",
    O_PLAYLIST_MOVE: "oplaylistmove",
    O_PLAYLIST_DELETE: "oplaylistdelete",
    O_PLAYLIST_JUMP: "oplaylistjump",
    O_PLAYLIST_ADD_LIST: "oplaylistaddlist",
    PLAYLIST_ADD_CUSTOM: "playlistaddcustom",     // ADD CUSTOM EMBED TO THE PLAYLIST
    PLAYLIST_ADD_RAW_FILE: "playlistaddrawfile",    // ADD RAW FILE TO THE PLAYLIST
    PLAYLIST_ADD_LIVE: "playlistaddlive",     // ADD A LIVESTREAM TO THE PLAYLIST
    EXCEED_MAX_LENGTH: "exceedmaxlength",       // ADD A VIDEO LONGER THAN THE MAXIMUM LENGTH SET
    ADD_NON_TEMP: "addnontemp",            // ADD A PERMANENT VIDEO TO THE PLAYLIST
    SET_TEMP: "settemp",               // TOGGLE TEMPORARY STATUS OF A PLAYLIST ITEM
    POLL_CTL: "pollctl",             // OPEN/CLOSE POLLS
    POLL_VOTE: "pollvote",             // VOTE IN POLLS
    VIEW_HIDDEN_POLL: "viewhiddenpoll",      // VIEW RESULTS OF HIDDEN POLLS
    VOTE_SKIP: "voteskip",             // VOTE TO SKIP THE CURRENT VIDEO
    VOTE_VIDEO: "votevideo",             // UP/DOWN VOTE A VIDEO
    VIEW_VOTE_SKIP: "viewvoteskip",        // VIEW VOTESKIP RESULTS
    MUTE: "mute",                // MUTE OTHER USERS
    KICK: "kick",                // KICK OTHER USERS
    BAN: "ban",                   // BAN OTHER USERS
    MOTD_EDIT: "motdedit",              // EDIT THE MOTD
    BIO_EDIT: "bioedit",               // EDIT THE BIO
    FILTER_EDIT: "filteredit",            // CONTROL CHAT FILTERS
    FILTER_IMPORT: "filterimport",          // IMPORT CHAT FILTER LIST
    EMOTE_EDIT: "emoteedit",             // CONTROL EMOTES
    EMOTE_IMPORT: "emoteimport",           // IMPORT EMOTE LIST
    UPLOAD: "upload",                // UPLOAD CHANNEL IMAGE
    LEADER_CTL: "leaderctl",             // GIVE/TAKE LEADER
    DRINK: "drink",               // USE THE /D COMMAND
    CHAT: "chat",                  // SEND CHAT MESSAGES
    CHAT_CLEAR: "chatclear",             // USE THE /CLEAR COMMAND
    EXCEED_MAX_ITEMS: "exceedmaxitems"         // EXCEED MAXIMUM ITEMS PER USER LIMIT
};