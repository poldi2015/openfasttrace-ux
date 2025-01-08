/**
 * GUI Elements that follow the UI lifecycle init -> activate -> deactivate
 */
export interface IElement {
    /**
     * Builds the UI.
     */
    init(): IElement;

    /**
     * Enable theelement, ready to be used in the UI.
     */
    activate(): void;

    /**
     * Deactivates the element, making it unavailable in the UI.
     */
    deactivate(): void;

    /**
     * @returns true if the element is active.
     */
    isActive(): boolean;

} // IElement