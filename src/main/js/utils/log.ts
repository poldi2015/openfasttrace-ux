/*
  OpenFastTrace UX

 Copyright (C) 2024-2025 itsallcode.org, Bernd Haberstumpf

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public
 License along with this program.  If not, see
 <http://www.gnu.org/licenses/gpl-3.0.html>.
*/

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
        _hiddenLogTags = new Set(_allLogTags);
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
        log: any;
    }
}

/* Coverage ignore start */
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
/* Coverage ignore end */