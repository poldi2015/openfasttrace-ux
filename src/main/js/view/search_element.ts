import {OftStateController} from "@main/controller/oft_state_controller";
import {Log} from "@main/utils/log";
import {Filter, NameFilter, NameFilterTarget} from "@main/model/filter";
import {FilterName} from "@main/model/oft_state";
import {ChangeEvent, ChangeListener, FilterChangeEvent, FocusChangeEvent} from "@main/model/change_event";

export class SearchElement {
    constructor(
        private readonly oftState: OftStateController,
    ) {
    }

    private readonly log: Log = new Log("SearchFromElement");
    private inputLabel: string = "use '+' for content";
    private formElement: HTMLElement | null = null;
    private inputElement: HTMLInputElement | null = null;

    private filterChangeListenerFacade: ChangeListener = (event: ChangeEvent): void => {
        this.filterChangeListener((event as FilterChangeEvent).selectedFilters);
    }

    private focusChangeListenerFacade: ChangeListener = (event: ChangeEvent): void => {
        this.filterChangeListener((event as FocusChangeEvent).selectedFilters);
    }

    public init(): SearchElement {
        this.addSearchForm();
        this.deactivate();
        return this;
    }

    /**
     * Enable the search element, ready to be used in the UI.
     */
    public activate(): void {
        this.oftState.addChangeListener(FilterChangeEvent.TYPE, this.filterChangeListenerFacade);
        this.oftState.addChangeListener(FocusChangeEvent.TYPE, this.focusChangeListenerFacade);
        if (this.inputElement) this.inputElement.disabled = false;
    }

    /**
     * Deactivates the search element, making it unavailable in the UI.
     */
    public deactivate(): void {
        if (this.inputElement) this.inputElement.disabled = true;
        this.oftState.removeChangeListener(this.focusChangeListenerFacade); // remove focus listener
        this.oftState.removeChangeListener(this.filterChangeListenerFacade);
    }


    private addSearchForm(): void {
        const searchForm: JQuery<HTMLElement> = $("#search");
        this.formElement = searchForm[0];
        searchForm.append(`
            <form class="_search">
                <input class="_search-input" type="text" placeholder="${this.inputLabel}">
                <button class="_search-clear" type="submit"></button>
            </form>
        `);
        const input: JQuery<HTMLInputElement> = searchForm.find("form input[type='text']") as JQuery<HTMLInputElement>;
        this.inputElement = input[0];
        input.on('keyup', (event) => {
            event.preventDefault();
            this.inputChanged((event.target as HTMLInputElement).value);
        });

        const clear: JQuery<HTMLInputElement> = searchForm.find("form button._search-clear") as JQuery<HTMLInputElement>;
        clear.on('click', (event) => {
            event.preventDefault();
            this.inputChanged("");
        });
    }

    private inputChanged(value: string): void {
        let regEx = false;
        let target: NameFilterTarget = NameFilterTarget.name;
        if (value.startsWith("+")) {
            value = value.substring(5).trimStart();
            target = NameFilterTarget.content;
        }
        if (!value.match(/^[a-zA-Z0-9_-]*$/)) {
            regEx = true;
        }
        const filters: Map<FilterName, Filter> = new Map([[NameFilter.FILTER_NAME, new NameFilter(value, regEx, target)]]);
        this.oftState.selectFilters(filters);
    }

    private changeValue(value: string): void {
        const currentValue: string | undefined = this.inputElement?.value.startsWith("+") ? this.inputElement?.value.substring(5).trimStart() : this.inputElement?.value;
        if (this.inputElement != null && value != currentValue) this.inputElement.value = value;
    }

    /**
     * Called when the filters changed their selection.
     *
     * All specItems matching the filters are made visible, all non matching are made invisible.
     *
     * @param selectedFilters filters to be selected (includes the selection of all filters not only this one)
     */
    private filterChangeListener(selectedFilters: Map<FilterName, Filter>): void {
        if (!selectedFilters.has(NameFilter.FILTER_NAME)) {
            this.changeValue("");
        } else {
            this.changeValue((selectedFilters.get(NameFilter.FILTER_NAME) as NameFilter).acceptedName);
        }
    }

} // SearchElement