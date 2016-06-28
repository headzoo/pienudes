const TBL_USERS = "" +
    "CREATE TABLE IF NOT EXISTS `users` (" +
        "`id` INT NOT NULL AUTO_INCREMENT," +
        "`name` VARCHAR(20) NOT NULL," +
        "`password` VARCHAR(64) NOT NULL," +
        "`global_rank` INT NOT NULL," +
        "`email` VARCHAR(255) NOT NULL," +
        "`profile` TEXT CHARACTER SET utf8mb4 NOT NULL," +
        "`ip` VARCHAR(39) NOT NULL," +
        "`scripting_enabled` TINYINT(1) NOT NULL DEFAULT 1," +
        "`time` BIGINT NOT NULL," +
        "`time_login` BIGINT NOT NULL, " +
        "PRIMARY KEY(`id`)," +
        "UNIQUE(`name`)) " +
    "CHARACTER SET utf8";

const TBL_USER_SCRIPTS = "" +
    "CREATE TABLE IF NOT EXISTS `user_scripts` (" +
    "`id` INT NOT NULL AUTO_INCREMENT," +
    "`user_id` INT NOT NULL," +
    "`name` VARCHAR(20) NOT NULL, " +
    "`script` TEXT NOT NULL DEFAULT ''," +
    "PRIMARY KEY (`id`)," +
    "UNIQUE INDEX (`user_id`, `name`)," +
    "FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE" +
    ") CHARACTER SET utf8";

const TBL_CHANNELS = "" +
    "CREATE TABLE IF NOT EXISTS `channels` (" +
        "`id` INT NOT NULL AUTO_INCREMENT," +
        "`name` VARCHAR(30) NOT NULL," +
        "`owner` VARCHAR(20) NOT NULL," +
        "`time` BIGINT NOT NULL," +
        "PRIMARY KEY (`id`), UNIQUE(`name`), INDEX(`owner`))" +
    "CHARACTER SET utf8";

const TBL_GLOBAL_BANS = "" +
    "CREATE TABLE IF NOT EXISTS `global_bans` (" +
        "`ip` VARCHAR(39) NOT NULL," +
        "`reason` VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL," +
    "PRIMARY KEY (`ip`)) " +
    "CHARACTER SET utf8";

const TBL_PASSWORD_RESET = "" +
    "CREATE TABLE IF NOT EXISTS `password_reset` (" +
        "`ip` VARCHAR(39) NOT NULL," +
        "`name` VARCHAR(20) NOT NULL," +
        "`hash` VARCHAR(64) NOT NULL," +
        "`email` VARCHAR(255) NOT NULL," +
        "`expire` BIGINT NOT NULL," +
        "PRIMARY KEY (`name`))" +
    "CHARACTER SET utf8";

const TBL_USER_PLAYLISTS = "" +
    "CREATE TABLE IF NOT EXISTS `user_playlists` (" +
        "`user` VARCHAR(20) NOT NULL," +
        "`name` VARCHAR(255) NOT NULL," +
        "`contents` MEDIUMTEXT NOT NULL," +
        "`count` INT NOT NULL," +
        "`duration` INT NOT NULL," +
        "PRIMARY KEY (`user`, `name`))" +
    "CHARACTER SET utf8";

const TBL_ALIASES = "" +
    "CREATE TABLE IF NOT EXISTS `aliases` (" +
        "`visit_id` INT NOT NULL AUTO_INCREMENT," +
        "`ip` VARCHAR(39) NOT NULL," +
        "`name` VARCHAR(20) NOT NULL," +
        "`time` BIGINT NOT NULL," +
        "PRIMARY KEY (`visit_id`), INDEX (`ip`)" +
    ")";

const TBL_STATS = "" +
    "CREATE TABLE IF NOT EXISTS `stats` (" +
        "`time` BIGINT NOT NULL," +
        "`usercount` INT NOT NULL," +
        "`chancount` INT NOT NULL," +
        "`mem` INT NOT NULL," +
        "PRIMARY KEY (`time`))" +
    "CHARACTER SET utf8";

const TBL_META = "" +
    "CREATE TABLE IF NOT EXISTS `meta` (" +
        "`key` VARCHAR(255) NOT NULL," +
        "`value` TEXT NOT NULL," +
        "PRIMARY KEY (`key`))" +
    "CHARACTER SET utf8";

const TBL_LIBRARIES = "" +
    "CREATE TABLE IF NOT EXISTS `channel_libraries` (" +
        "`id` VARCHAR(255) NOT NULL," +
        "`title` VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL," +
        "`seconds` INT NOT NULL," +
        "`type` VARCHAR(2) NOT NULL," +
        "`meta` TEXT NOT NULL," +
        "`channel` VARCHAR(30) NOT NULL," +
        "PRIMARY KEY(`id`, `channel`), INDEX(`channel`, `title`(227))" +
    ") CHARACTER SET utf8";

const TBL_RANKS = "" +
    "CREATE TABLE IF NOT EXISTS `channel_ranks` (" +
        "`name` VARCHAR(20) NOT NULL," +
        "`rank` INT NOT NULL," +
        "`channel` VARCHAR(30) NOT NULL," +
        "PRIMARY KEY(`name`, `channel`)" +
    ") CHARACTER SET utf8";

const TBL_BANS = "" +
    "CREATE TABLE IF NOT EXISTS `channel_bans` (" +
        "`id` INT NOT NULL AUTO_INCREMENT," +
        "`ip` VARCHAR(39) NOT NULL," +
        "`name` VARCHAR(20) NOT NULL," +
        "`bannedby` VARCHAR(20) NOT NULL," +
        "`reason` VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL," +
        "`channel` VARCHAR(30) NOT NULL," +
    "PRIMARY KEY (`id`, `channel`), UNIQUE (`name`, `ip`, `channel`), " +
    "INDEX (`ip`, `channel`), INDEX (`name`, `channel`)" +
    ") CHARACTER SET utf8";

const TBL_CHANNEL_DATA = "" +
    "CREATE TABLE IF NOT EXISTS `channel_data` (" +
        "`channel_id` INT NOT NULL," +
        "`key` VARCHAR(20) NOT NULL," +
        "`value` MEDIUMTEXT CHARACTER SET utf8mb4 NOT NULL," +
    "PRIMARY KEY (`channel_id`, `key`)," +
    "FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON DELETE CASCADE" +
    ") CHARACTER SET utf8";

const TBL_MEDIA = "" +
    "CREATE TABLE IF NOT EXISTS `media` (" +
        "`id` BIGINT NOT NULL AUTO_INCREMENT," +
        "`uid` VARCHAR(120) NOT NULL," +
        "`type` VARCHAR(2) NOT NULL," +
        "`title` VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL," +
        "`seconds` INT NOT NULL," +
        "`time` BIGINT NOT NULL," +
    "PRIMARY KEY (`id`)," +
    "UNIQUE INDEX(`uid`, `type`)" +
    ") CHARACTER SET utf8";
    
const TBL_PLAYLIST_HISTORY = "" +
    "CREATE TABLE IF NOT EXISTS `playlist_history` (" +
        "`id` BIGINT NOT NULL AUTO_INCREMENT," +
        "`media_id` BIGINT NOT NULL," +
        "`channel` VARCHAR(30) NOT NULL," +
        "`user` VARCHAR(20) NOT NULL," +
        "`time` BIGINT NOT NULL," +
    "PRIMARY KEY (`id`)," +
    "FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE CASCADE" +
    ") CHARACTER SET utf8";

const TBL_UPLOADS = "" +
    "CREATE TABLE IF NOT EXISTS `uploads` (" +
        "`id` INT NOT NULL AUTO_INCREMENT," +
        "`channel` VARCHAR(30) NOT NULL," +
        "`path` VARCHAR(255) NOT NULL," +
        "`size` INT NOT NULL," +
        "`time` BIGINT NOT NULL," +
    "PRIMARY KEY (`id`)" +
    ") CHARACTER SET utf8";

const TBL_EMOTES = "" +
    "CREATE TABLE IF NOT EXISTS `emotes` (" +
    "`id` INT NOT NULL AUTO_INCREMENT," +
    "`user_id` VARCHAR(30) NOT NULL," +
    "`path` VARCHAR(255) NOT NULL," +
    "`text` VARCHAR(20) NOT NULL," +
    "`time` BIGINT NOT NULL," +
    "PRIMARY KEY (`id`)," +
    "UNIQUE INDEX(`user_id`, `text`) " +
    ") CHARACTER SET utf8";

const TBL_ATTACHMENTS = "" +
    "CREATE TABLE IF NOT EXISTS `attachments` (" +
    "`id` INT NOT NULL AUTO_INCREMENT," +
    "`user_id` VARCHAR(30) NOT NULL," +
    "`channel` VARCHAR(30) NOT NULL," +
    "`path` VARCHAR(255) NOT NULL," +
    "`size` INT NOT NULL," +
    "`type` VARCHAR(20) NOT NULL, " +
    "`md5` CHAR(32) NOT NULL, " +
    "`time` BIGINT NOT NULL," +
    "PRIMARY KEY (`id`)" +
    ") CHARACTER SET utf8";
    
const TBL_CHAT_LOGS = "" +
    "CREATE TABLE IF NOT EXISTS `chat_logs` (" +
        "`id`         BIGINT NOT NULL AUTO_INCREMENT," +
        "`channel_id` INT NOT NULL," +
        "`user`       VARCHAR(20) NOT NULL," +
        "`type`       ENUM('message', 'media') NOT NULL," +
        "`version`    VARCHAR(10) NOT NULL," +
        "`time`       BIGINT NOT NULL," +
        "`msg`        TEXT NOT NULL," +
        "`meta`       TEXT NOT NULL," +
    "PRIMARY KEY(`id`)," +
    "INDEX(`user`)," +
    "FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON DELETE CASCADE" +
    ") CHARACTER SET utf8";

const TBL_VOTES = "" +
    "CREATE TABLE IF NOT EXISTS `votes` (" +
        "`id` BIGINT NOT NULL AUTO_INCREMENT," +
        "`user_id` INT NOT NULL," +
        "`media_id` BIGINT NOT NULL," +
        "`value` SMALLINT NOT NULL," +
        "`time` BIGINT NOT NULL," +
    "PRIMARY KEY (`id`)," +
    "FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE," +
    "FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE CASCADE" +
    ") CHARACTER SET utf8";
    
const TBL_FAVORITES = "" +
    "CREATE TABLE IF NOT EXISTS `favorites` (" +
        "`id` INT NOT NULL AUTO_INCREMENT, " +
        "`user_id` INT NOT NULL, " +
        "`media_id` BIGINT NOT NULL, " +
        "`time` BIGINT NOT NULL," +
    "PRIMARY KEY (`id`)," +
    "UNIQUE INDEX(`user_id`, `media_id`), " +
    "FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE," +
    "FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE CASCADE" +
    ") CHARACTER SET utf8";

const TBL_TAGS = "" +
    "CREATE TABLE IF NOT EXISTS `tags` (" +
        "`id` INT NOT NULL AUTO_INCREMENT, " +
        "`name` VARCHAR(25) NOT NULL, " +
    "PRIMARY KEY (`id`), " +
    "UNIQUE INDEX(`name`) " +
    ") CHARACTER SET utf8";
    
const TBL_TAGS_TO_FAVORITES = "" +
    "CREATE TABLE IF NOT EXISTS `tags_to_favorites` (" +
        "`id` BIGINT NOT NULL AUTO_INCREMENT, " +
        "`favorite_id` INT NOT NULL, " +
        "`tag_id` INT NOT NULL, " +
    "PRIMARY KEY (`id`)," +
    "UNIQUE INDEX(`favorite_id`, `tag_id`), " +
    "FOREIGN KEY (`favorite_id`) REFERENCES `favorites`(`id`) ON DELETE CASCADE," +
    "FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE" +
    ") CHARACTER SET utf8";
    
const TBL_ALTS = "" +
    "CREATE TABLE IF NOT EXISTS `alts` (" +
    "`id` INT NOT NULL AUTO_INCREMENT, " +
    "`name` VARCHAR(20) NOT NULL, " +
    "`password` VARCHAR(50) NOT NULL DEFAULT '', " +
    "`channels` VARCHAR(100) NOT NULL, " +
    "`responses` TEXT NOT NULL DEFAULT '', " +
    "`playlist` TEXT NOT NULL DEFAULT '', " +
    "`queue_interval` INT NOT NULL DEFAULT 0, " +
    "`is_enabled` TINYINT NOT NULL DEFAULT 0, " +
    "PRIMARY KEY (`id`), " +
    "UNIQUE INDEX (`name`) " +
    ") CHARACTER SET utf8";
    
const TBL_API_STORAGE = "" +
    "CREATE TABLE IF NOT EXISTS `api_storage` (" +
        "`id` BIGINT NOT NULL AUTO_INCREMENT, " +
        "`user_id` INT NOT NULL, " +
        "`key` VARCHAR(150) NOT NULL, " +
        "`value` VARCHAR(5000) NOT NULL, " +
        "`time` BIGINT NOT NULL," +
    "PRIMARY KEY (`id`)," +
    "UNIQUE INDEX(`user_id`, `key`), " +
    "FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE" +
    ") CHARACTER SET utf8";


module.exports.init = function (queryfn, cb) {
    var tables = {
        users: TBL_USERS,
        user_scripts: TBL_USER_SCRIPTS,
        channels: TBL_CHANNELS,
        channel_libraries: TBL_LIBRARIES,
        channel_ranks: TBL_RANKS,
        channel_bans: TBL_BANS,
        global_bans: TBL_GLOBAL_BANS,
        password_reset: TBL_PASSWORD_RESET,
        user_playlists: TBL_USER_PLAYLISTS,
        aliases: TBL_ALIASES,
        stats: TBL_STATS,
        meta: TBL_META,
        channel_data: TBL_CHANNEL_DATA,
        media: TBL_MEDIA,
        playlist_history: TBL_PLAYLIST_HISTORY,
        uploads: TBL_UPLOADS,
        emotes: TBL_EMOTES,
        attachments: TBL_ATTACHMENTS,
        chat_logs: TBL_CHAT_LOGS,
        votes: TBL_VOTES,
        favorites: TBL_FAVORITES,
        tags: TBL_TAGS,
        tags_to_favorites: TBL_TAGS_TO_FAVORITES,
        alts: TBL_ALTS,
        api_storage: TBL_API_STORAGE
    };

    var AsyncQueue = require("../asyncqueue");
    var aq = new AsyncQueue();
    var hasError = false;
    Object.keys(tables).forEach(function (tbl) {
        aq.queue(function (lock) {
            queryfn(tables[tbl], function (err) {
                if (err) {
                    console.log(err);
                    hasError = true;
                }
                lock.release();
            });
        });
    });

    aq.queue(function (lock) {
        lock.release();
        cb(hasError);
    });
};
