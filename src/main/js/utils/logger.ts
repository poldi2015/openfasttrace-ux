export class Logger {
    constructor(public tag: string = "") {
    }

    public info(...message: any[]): void {
        if (process.env.NODE_ENV === 'development') {
            if( _hiddenLogTags && !_hiddenLogTags.includes(this.tag) ) console.log(...message);
        }
    }
}

export const logger = new Logger();

export function hideTags(...tags: string[]): void {
    _hiddenLogTags = (_hiddenLogTags ?? []).concat(tags);
}

let _hiddenLogTags: string[] | null= [];