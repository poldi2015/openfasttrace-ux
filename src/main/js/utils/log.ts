/**
 * A Logger used by this application to log messages to the console for debugging.
 */
export class Log {
    /**
    * @param tag identifies the source of a log message and allows filter log message. Defaults to "" for no source.
     */
    constructor(public tag: string = "") {
        if (tag != "") {
            _allLogTags = _allLogTags.add(tag);
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
            if (this.tag == "" || ( _allLogTags.has(this.tag) &&  !_hiddenLogTags.has(this.tag))) {
                if (this.tag) {
                    console.log(...["|", this.tag, "|"].concat(message));
                } else {
                    console.log(...message);
                }
            }
        }
    }

} // Log

/**
 * Default logger without a tag
 */
export const log = new Log();

let _hiddenLogTags: Set<string> = new Set();
let _allLogTags: Set<string> = new Set();

/**
 * Allows to filter log messages by tags.
 *
 * @param tags tags to exclude. If empty all tags are filtered out
 */
export function hideLogTags(...tags: string[]): void {
    if (tags.length == 0) {
        _hiddenLogTags = _allLogTags;
    } else {
        tags.forEach((tag:string):any => _hiddenLogTags.add(tag));
    }
}

/**
 * Enable log tags to be shown.
 *
 * @param tags The tags to show, if empty show all messages
 */
export function showLogTags(...tags: string[]): void {
    if (tags.length == 0) {
        _hiddenLogTags.clear();
    } else {
        tags.forEach((tag:string) : any => _hiddenLogTags.delete(tag));
    }
}

/**
 * Show tags of messages that are suppressed.
 */
export function hiddenLogTags(): Array<string> {
    return Array.from(_hiddenLogTags).sort();
}

/**
 * Show all known tags.
 */
export function knownLogTags():Array<string> {
    return Array.from(_allLogTags).sort();
}

export function resetLogTags():void {
    _allLogTags.clear();
    _hiddenLogTags.clear();
}

declare global {
    interface Window {
        capturedLogs: any;
    }
}

/* Coverage ignore start */
if (process.env.NODE_ENV === 'development') {
    /**
     * Provide the logger commands to the console.
     */
    (function (window) {
        window.capturedLogs = {};
        window.capturedLogs.show = showLogTags;
        window.capturedLogs.hide = hideLogTags;
        window.capturedLogs.hidden = hiddenLogTags;
        window.capturedLogs.all = knownLogTags;
    })(window);
}
/* Coverage ignore end */