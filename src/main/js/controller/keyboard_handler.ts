import {Log} from "@main/utils/log";
import {KeyboardController} from "@main/controller/keyboard_controller";

export class Key {
    constructor(public readonly key: string,
                public readonly handler: (event: JQuery.Event) => boolean,
                public readonly ctrl: boolean = false,
                public readonly alt: boolean = false,
                public readonly meta: boolean = false
    ) {
    }

    public matches(event: JQuery.Event): boolean {
        return event.key == this.key &&
            event.ctrlKey == this.ctrl &&
            event.altKey == this.alt &&
            event.metaKey == this.meta;
    }
}

export abstract class KeyboardHandler {

    public constructor(elements: Array<JQuery>,
                       private readonly keys: Array<Key>,
                       protected readonly log: Log) {
        elements.forEach((element: JQuery) => this._elements.push(element[0]));
    }

    private _elements: Array<Element> = [];
    private _keys: Array<Key> = [];
    private active: boolean = false;
    private eventHandler = (event: JQuery.Event) => {
    };

    public init(): void {
    }

    public activate(): void {
        this.active = true;
        this.registerKeyHandler();
    }

    public deactivate(): void {
        this.active = false;
        this.unregisterKeyHandler();
    }

    public isActive(): boolean {
        return this.active;
    }

    protected focus(element: JQuery): boolean {
        return KeyboardController.focus(element, this.log);
    }

    private registerKeyHandler(): void {
        this.eventHandler = (event) => this.keydownHandler(event);
        $(document).on('keydown', (event) => this.keydownHandler(event));
    }

    private unregisterKeyHandler(): void {
        $(document).off('keydown', this.eventHandler);
    }

    private keydownHandler(event: JQuery.Event): void {
        const activeElement = document.activeElement;
        this.log.info(`keydownHandler key:`, event.key, "activeElement:", activeElement?.id, "element", this._elements);

        if (this._elements.length == 0) {
            // Handle only events that are global, means no element has focus

        } else {
            // Only handle events that apply to selected focused elements

            if (activeElement == null || !this._elements.includes(activeElement)) {
                this.log.info("keydownHandler: ignoring event, ", activeElement?.id, "not supported");
                return;
            }
        }
        for (const key of this.keys) {
            if (key.matches(event)) {
                this.log.info(`keydownHandler processing key: ${key.key}`);
                const handled = key.handler(event);
                if (handled) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
            }
        }
    }

} // KeyboardController