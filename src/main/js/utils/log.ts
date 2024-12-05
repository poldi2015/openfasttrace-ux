/**
 * A Logger used by this application to log messages to the console for debugging.
 */
export class Log {
    /**
    * @param tag identifies the source of a log message and allows filter log message. Defaults to "" for no source.
     */
    constructor(public tag: string = "") {
        if (tag != "") {
            console.log("New Log Tag: ", tag);
            _allLogTags = _allLogTags.concat(tag);
            hideLogTags(tag);
        }
    }

    /**
     * Logs an info message.
     *
     * Prepends the message with the tag of the logger if set
     *
     * @param message List of message strings to log
     */
    public info(...message: any[]): void {
        if (process.env.NODE_ENV === 'development') {
            if (!_hiddenLogTags || !_hiddenLogTags.includes(this.tag)) {
                if (this.tag) {
                    console.log(...["|", this.tag, "|"].concat(message));
                } else {
                    console.log(...message);
                }
            }
        }
    }
}

/**
 * Default logger without a tag
 */
export const log = new Log();

let _hiddenLogTags: string[];
let _allLogTags: string[] = [];

/**
 * Allows to filter log messages by tags.
 *
 * @param tags tags to exclude. If empty all tags are filtered out
 */
export function hideLogTags(...tags: string[]): void {
    if (tags.length == 0) {
        _hiddenLogTags = _allLogTags;
    } else {
        _hiddenLogTags = (_hiddenLogTags ?? []).concat(tags);
    }
}

/**
 * Enable log tags to be shown.
 *
 * @param tags The tags to show, if empty show all messages
 */
export function showLogTags(...tags: string[]): void {
    if (tags.length == 0) {
        _hiddenLogTags = [];
    } else {
        _hiddenLogTags = _hiddenLogTags?.filter((tag: string) => !tags.includes(tag));
    }
}

/**
 * Show tags of messages that are suppressed.
 */
export function hiddenLogTags(): Array<string> {
    return _hiddenLogTags;
}

/**
 * Show all known tags.
 */
export function knownLogTags() {
    return _allLogTags;
}

declare global {
    interface Window {
        log: any;
    }
}

if (process.env.NODE_ENV === 'development') {
    /**
     * Provide the logger commands to the console.
     */
    (function (window) {
        window.log = {};
        window.log.show = showLogTags;
        window.log.hide = hideLogTags;
        window.log.hidden = hiddenLogTags;
        window.log.all = knownLogTags;
    })(window);
}