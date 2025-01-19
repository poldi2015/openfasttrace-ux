/**
 * Allows to start a handler deferred.
 *
 * If the same {@link run} method is called again the previous request is canceled first.
 */
export class Deferred {
    constructor(private readonly timeOut: number) {
    }

    private timer: NodeJS.Timeout | null = null;

    public run(handler: () => void) {
        this.cancel();
        this.timer = setTimeout(() => {
            handler();
            this.cancel();
        }, this.timeOut);
    }

    public cancel(): void {
        if (this.timer != null) clearTimeout(this.timer!);
    }
} // Deferred