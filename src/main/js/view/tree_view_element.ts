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

import {SpecItem} from "@main/model/specitems";
import {OftStateController} from "@main/controller/oft_state_controller";
import {Project} from "@main/model/project";
import {Log} from "@main/utils/log";
import {ChangeEvent, EventType} from "@main/model/change_event";
import {Filter, IndexFilter, isMatchingAllFilters} from "@main/model/filter";
import {NavbarElement} from "@main/view/navbar_element";

enum TreeViewMode {
    NAME = "name",
    DIRECTORY = "directory"
}

interface TreeNode {
    index: number;
    name: string;
    firstIndex: number | null;
    children: Map<string, TreeNode>;
    level: number;
    fullPath: string;
    specItemCount: number;
    selectable: boolean;
}

const NAME_TREE_DEPTH = 3; // Type + NAME_TREE_DEPTH level
const PATH_TREE_DEPTH = 4; // Type + PATH_TREE_DEPTH level
const TREE_NAV_BAR_ID = "#tree-nav-bar";

export class TreeViewElement {
    constructor(
        private readonly specItems: Array<SpecItem>,
        private readonly oftStateController: OftStateController,
        private readonly project: Project
    ) {
        this.treeViewElement = $("#tree-view");
        this.navbarElement = new NavbarElement($(TREE_NAV_BAR_ID));
    }

    private readonly log: Log = new Log("TreeViewElement");

    private readonly treeViewElement: JQuery;
    private readonly navbarElement: NavbarElement;

    private pathRootNodes: Map<string, TreeNode> = new Map();
    private nameRootNodes: Map<string, TreeNode> = new Map();
    private indexCounter: number = 0;
    private suppressSelectionEvent: boolean = false;
    private selectedTreeNode: JQuery | null = null;
    private focusedIndex: number | null = null;
    private hideEmptyNodes: boolean = true;
    private treeViewMode: TreeViewMode = TreeViewMode.DIRECTORY;
    private currentFilters: Map<string, Filter> | null = null;
    private currentSelectedIndex: number | null = null;

    public init(): TreeViewElement {
        // Initialize navbar first to create buttons
        this.navbarElement.init();

        // Then register listeners for the buttons
        this.navbarElement.setChangeListener("tree-expand-all", () => this.expandAll());
        this.navbarElement.setChangeListener("tree-collapse-all", () => this.collapseAll());
        this.navbarElement.setChangeListener("btn-tree-scroll-to-selection", () => this.scrollToSelection());
        this.navbarElement.setChangeListener("tree-hide-empty", (_, state: boolean) => this.updateHideEmptyNodes(state));
        this.navbarElement.setChangeListener("tree-mode-toggle", (_, state: boolean) => this.toggleTreeMode(state));

        this.navbarElement.getButton("tree-mode-toggle")?.toggle(this.treeViewMode == TreeViewMode.DIRECTORY);
        this.setToggleModeButtonIcon();
        
        this.buildOrUpdateTreeModel(null);
        this.renderTree();

        this.oftStateController.addChangeListener((event: ChangeEvent) => this.handleSelectionChange(event), EventType.Selection);
        this.oftStateController.addChangeListener((event: ChangeEvent) => this.handleFilterFocusChange(event), EventType.Focus, EventType.Filters);

        return this;
    }

    public activate(): void {
        this.navbarElement.activate();
    }

    public deactivate(): void {
        this.navbarElement.deactivate();
    }

    public isActive(): boolean {
        return this.navbarElement.isActive();
    }


    //
    // Model

    /**
     * Splits a specItem name by delimiters (-, _, .) and builds a hierarchical tree structure.
     * The type is the uppermost level, followed by name tokens or directory path.
     * Excludes the last token from the path. Limits depth to MAX_TREE_DEPTH levels.
     */
    private buildOrUpdateTreeModel(selectedFilters: Array<[string, Filter]> | null): void {
        this.log.info("buildOrUpdateTreeModel", this.specItems.length, "filters", selectedFilters, "mode", this.treeViewMode);

        this.resetTreeNodes(this.getRootNodes(), selectedFilters); // clear counters in case the model was already generated

        this.indexCounter = 0;
        this.specItems.forEach(specItem => {
            //if (selectedFilters != null && !isMatchingAllFilters(specItem, selectedFilters)) return;
            const pathTokens = this.treeViewMode === TreeViewMode.NAME
                ? this.splitSpecItemNameIntoPath(specItem.name)
                : this.splitSourceFileIntoPath(specItem.sourceFile);
            if (pathTokens.length < 1) return;

            // Prepend the type name as the uppermost level
            const typeName = this.project.typeLabels[specItem.type];
            const fullPath = [typeName, ...pathTokens];

            this.insertIntoTree(fullPath, specItem, 0, this.getRootNodes(), '', selectedFilters);
        });

        this.log.info("Tree built with", this.getRootNodes().size, "root nodes");
    }

    /**
     * Splits specItem name by minus, underscore, or dot into a path excluding the last token.
     *
     * The path is restricted to MAX_TREE_DEPTH tokens (excluding type).
     *
     * @param specItemName The specItem name without type
     */
    private splitSpecItemNameIntoPath(specItemName: string): Array<string> {
        const allPathTokens = specItemName.split(/[-_.]+/).filter(token => token.length > 0).slice(0, -1);
        return allPathTokens.slice(0, this.getTreeDepth());

    }

    /**
     * Splits sourceFile path into directory path components including the filename.
     * Returns the last MAX_TREE_DEPTH path components (deepest folders to file).
     *
     * The path is restricted to MAX_TREE_DEPTH tokens (excluding type).
     *
     * @param sourceFile The source file path
     */
    private splitSourceFileIntoPath(sourceFile: string): Array<string> {
        if (!sourceFile || sourceFile.length === 0) return [];

        // Normalize path separators to forward slashes
        const normalizedPath = sourceFile.replace(/\\/g, '/');

        // Split by path separator and filter out empty tokens
        const pathComponents = normalizedPath.split('/').filter(token => token.length > 0);

        // Take the last MAX_TREE_DEPTH components (including filename)
        // File will be at the deepest level in the tree hierarchy
        return pathComponents.slice(-this.getTreeDepth());
    }

    /**
     * Recursively inserts a specItem into the tree structure
     */
    private insertIntoTree(
        pathTokens: Array<string>,
        specItem: SpecItem,
        level: number,
        levelNodes: Map<string, TreeNode>,
        parentPath: string,
        selectedFilters: Array<[string, Filter]> | null,
    ): void {
        if (pathTokens.length === 0 || level >= this.getTreeDepth() + 1) return;

        const token = pathTokens[0];
        const remainingTokens = pathTokens.slice(1);
        const fullPath = parentPath ? parentPath + "/" + token : token;

        // Get or create node for this token
        let node = levelNodes.get(token);
        if (!node) {
            node = {
                index: this.indexCounter++,
                name: token,
                firstIndex: null,
                children: new Map(),
                level: level,
                fullPath: fullPath,
                specItemCount: 0,
                selectable: false
            };
            levelNodes.set(token, node);
        }
        if (selectedFilters == null || isMatchingAllFilters(specItem, selectedFilters)) {
            if (node.firstIndex == null) node.firstIndex = specItem.index;
            node.specItemCount++;
            node.selectable = true;
        }

        // If this is the last token in the path, add the specItem here
        if (remainingTokens.length != 0 || level >= this.getTreeDepth()) {
            this.insertIntoTree(remainingTokens, specItem, level + 1, node.children, fullPath, selectedFilters);
        }
    }

    /**
     * Resets all node counts to 0 recursively
     */
    private resetTreeNodes(nodes: Map<string, TreeNode>, selectedFilters: Array<[string, Filter]> | null): void {
        nodes.forEach(node => {
            node.specItemCount = 0;
            node.firstIndex = null;
            node.selectable = false;
            if (node.children.size > 0) {
                this.resetTreeNodes(node.children, selectedFilters);
            }
        });
    }

    /**
     * Get the max depth of the tree based on the current view mode
     */
    private getTreeDepth(): number {
        return this.treeViewMode === TreeViewMode.DIRECTORY ? PATH_TREE_DEPTH : NAME_TREE_DEPTH;
    }

    /**
     * Get the tree root nodes based (representing the types) on the current view mode
     */
    private getRootNodes(): Map<string, TreeNode> {
        return this.treeViewMode === TreeViewMode.DIRECTORY ? this.pathRootNodes : this.nameRootNodes;
    }



    //
    // Render tree

    /**
     * Renders the tree structure as HTML
     */
    private renderTree(): void {
        this.treeViewElement.empty();

        const treeHtml = this.renderNodes(this.getRootNodes());
        this.treeViewElement.html(treeHtml);

        // Add click handlers
        this.attachClickHandlers();
    }

    /**
     * Recursively renders tree nodes
     */
    private renderNodes(nodes: Map<string, TreeNode>): string {
        if (nodes.size === 0) {
            return '';
        }

        let html = '<ul class="tree-list">';

        // Sort nodes alphabetically
        const sortedNodes = Array.from(nodes.entries()).sort((a, b) =>
            a[0].localeCompare(b[0])
        );

        sortedNodes.forEach(([_, node]) => {
            const hasChildren = node.children.size > 0;

            html += `<li class="tree-node" id="tn_${node.index}" data-level="${node.level}" data-itemindex="${node.firstIndex ?? ''}" data-path="${node.fullPath}">`;

            // Node label with expand/collapse icon
            html += `<div class="tree-node-label" title="${this.escapeHtml(node.name)}">`;

            if (hasChildren) {
                if (this.treeViewMode === TreeViewMode.DIRECTORY) {
                    html += `<span class="tree-expand-icon tree-folder-icon folder-closed"></span>`;
                } else {
                    html += `<span class="tree-expand-icon">▶</span>`;
                }
            } else {
                html += `<span class="tree-expand-icon-placeholder"></span>`;
            }

            html += `<span class="tree-node-name">${this.escapeHtml(node.name)}</span>`;
            html += `<span class="tree-node-count">(${node.specItemCount})</span>`;
            html += `</div>`;

            // Render child nodes
            if (hasChildren) {
                html += `<div class="tree-children" style="display:none;">`;
                html += this.renderNodes(node.children);
                html += `</div>`;
            }

            html += `</li>`;
        });

        html += '</ul>';
        return html;
    }

    /**
     * In case of a filter change the specItem count indicator and the selectability is updated.
     *
     * A tree node is disabled when the specItem counter is 0 or when the firstSpecItem is filtered out.
     *
     * @param nodes The model
     */
    private updateRenderedNodes(nodes: Map<string, TreeNode>): void {
        Array.from(nodes.entries()).forEach(([_, node]) => {
            const treeNodeElement = this.treeViewElement.find(`#tn_${node.index}.tree-node`);
            const counterElement = treeNodeElement?.find("> .tree-node-label > .tree-node-count");
            treeNodeElement?.attr('data-itemindex', node.firstIndex ?? '');
            counterElement?.text(`(${node.specItemCount})`);
            treeNodeElement.toggleClass('tree-node-disabled', !node.selectable || node.specItemCount === 0);
            if (this.hideEmptyNodes) {
                treeNodeElement.toggle(node.selectable);
            } else {
                treeNodeElement.toggle(true);
            }
            this.updateRenderedNodes(node.children);
        });
    }


    //
    // Selection handler

    /**
     * Attaches click handlers for tree interaction
     */
    private attachClickHandlers(): void {
        // Handle tree node label clicks - expand/collapse and select first item
        this.treeViewElement.find('.tree-node-label').off('click').on('click', (e) => {
            e.stopPropagation();
            const labelNode = $(e.currentTarget);
            const treeNode = labelNode.parent('.tree-node');

            // Toggle expand/collapse if has children
            const childNodes = treeNode.children('.tree-children');
            const isExpanded = childNodes.is(':visible');
            this.expandNode(treeNode, !isExpanded);

            // Disabled nodes cannot be selected but only expanded/collapsed
            if (treeNode.hasClass('tree-node-disabled')) return;

            // Mark this node as selected
            this.markNodeSelected(treeNode);

            // Select first matching specItem in this node or its children
            this.selectSpecItem(this.findFirstSpecItemInNode(treeNode));
        });
    }

    /**
     * Finds the first specItem index in a node by extracting it from the node's id attribute
     */
    private findFirstSpecItemInNode(treeNode: JQuery): number | null {
        const treeItemIndex = treeNode.attr('data-itemindex');
        return treeItemIndex != null && treeItemIndex != '' ? parseInt(treeItemIndex, 10) : null;
    }

    /**
     * Select the specItem in the specItem view with the given index.
     */
    private selectSpecItem(index: number | null): void {
        if (index == null) return;
        this.log.info("selectSpecItem firstNode index", index);
        this.suppressSelectionEvent = true;
        this.oftStateController.selectItem(index);
    }


    //
    // Selection change handler

    /**
     * Handles filter change events and updates counts
     */
    private handleFilterFocusChange(event: ChangeEvent): void {
        event.handleFilterChange((filters, _) => {
            this.log.info("Tree filter change", filters);
            this.currentFilters = filters;
            event.handleFocusChange((focus) => {
                this.log.info("handleFilterFocusChange", focus);
                this.focusedIndex = focus;
                this.log.info("handleFilterFocusChange", filters);
            });
            this.buildOrUpdateTreeModel(this.mergeIntoIndexFilters(filters, this.focusedIndex));
            this.updateRenderedNodes(this.getRootNodes());
        });
    }

    /**
     * Merge the given index into the IndexFilter that is part of the filters or create a new IndexFilter if needed.
     *
     * @param filters The list of existing filters or null of not set
     * @param index The index to add to the IndexFilter or null if none to add
     * @private The new filters or null if both filters and index are null
     */
    private mergeIntoIndexFilters(filters: Map<string, Filter> | null, index: number | null): Array<[string, Filter]> | null {
        if (index == null) return filters != null ? Array.from(filters) : null;
        const mergedFilters = filters != null ? new Map(filters) : new Map<string, Filter>();
        const indexFilter = mergedFilters.get(IndexFilter.FILTER_NAME) as IndexFilter ?? new IndexFilter();
        mergedFilters.set(IndexFilter.FILTER_NAME, new IndexFilter(Array.of(index), indexFilter));
        return Array.from(mergedFilters);
    }

    /**
     * Handles selection change events from the controller
     */
    private handleSelectionChange(event: ChangeEvent): void {
        if (this.suppressSelectionEvent) {
            this.log.info("Tree selection change suppressed");
            this.suppressSelectionEvent = false;
            return;
        }
        event.handleSelectionChange((selectedIndex) => {
            this.currentSelectedIndex = selectedIndex;
            this.selectNode(selectedIndex);
        });
    }

    /**
     * Updates tree selection based on the selected specItem
     */
    private selectNode(selectedIndex: number | null): void {
        if (selectedIndex === null) {
            this.log.info("selectNode to null - removing selection");
            this.removeSelections();
            this.selectedTreeNode = null;
        } else {
            this.log.info("selectNode to index", selectedIndex);
            const selectedTreeNode = this.findMatchingNode(this.specItems[selectedIndex]);
            if (selectedTreeNode && selectedTreeNode.length > 0) {
                this.markNodeSelected(selectedTreeNode);
                this.selectedTreeNode = selectedTreeNode;
            } else {
                this.selectedTreeNode = null;
            }
        }
    }

    /**
     * Selects the tree node that best matches the given specItem
     */
    private findMatchingNode(specItem: SpecItem): JQuery {
        const pathTokens = this.treeViewMode === TreeViewMode.NAME
            ? this.splitSpecItemNameIntoPath(specItem.name)
            : this.splitSourceFileIntoPath(specItem.sourceFile);
        const tokenPath = pathTokens.join('/');
        const fullPath = this.project.typeIds[specItem.type] + (tokenPath.length > 0 ? '/' + tokenPath : '');
        return this.treeViewElement.find(`.tree-node[data-path="${fullPath}"]`);
    }


    //
    // Render changes

    /**
     * Marks a tree node as selected
     */
    private markNodeSelected(treeNode: JQuery): void {
        this.log.info("markNodeSelected", treeNode.attr("data-path"));
        this.removeSelections();
        this.expandParentNodes(treeNode);
        treeNode.children(".tree-node-label").addClass('tree-node-selected');
        this.scrollToNodeSelected(treeNode);
    }

    private scrollToNodeSelected(treeNode: JQuery | null): void {
        this.log.info("scrollToNodeSelected", treeNode);
        if (treeNode == null) return;
        const labelNode = treeNode!.children(".tree-node-label");
        setTimeout(() => {
            labelNode[0].scrollIntoView({behavior: 'smooth', block: 'nearest'});
        }, 250);
    }

    /**
     * Clears all selections marks.
     */
    private removeSelections(): void {
        this.log.info("removeSelections");
        this.treeViewElement.find('.tree-node-label').removeClass('tree-node-selected');
    }

    /**
     * Expands all parent nodes from the root down to the given node
     */
    private expandParentNodes(treeNode: JQuery): void {
        // Find all parent tree-node elements
        const parentNodes = treeNode.parents('.tree-node');

        // Expand each parent from outermost to innermost
        parentNodes.each((_, parentNode) => {
            const parent = $(parentNode);
            const childrenContainer = parent.children('.tree-children');

            if (childrenContainer.length > 0 && !childrenContainer.is(':visible')) {
                this.expandNode(parent, true);
            }
        });
    }

    /**
     * Expands or collapses the given tree node.
     */
    private expandNode(treeNode: JQuery, expand: boolean): void {
        const childNodes = treeNode.children('.tree-children');
        if (childNodes.length > 0) {
            const expandIconNode = treeNode.children('.tree-node-label').find('.tree-expand-icon');
            if (expand) {
                childNodes.slideDown(200);
                if (this.treeViewMode === TreeViewMode.DIRECTORY) {
                    expandIconNode.removeClass('folder-closed').addClass('folder-open');
                } else {
                    expandIconNode.text('▼');
                }
            } else {
                childNodes.slideUp(200);
                if (this.treeViewMode === TreeViewMode.DIRECTORY) {
                    expandIconNode.removeClass('folder-open').addClass('folder-closed');
                } else {
                    expandIconNode.text('▶');
                }
            }
        }

    }

    /**
     * Toggles between name-based and directory-based tree view modes
     */
    private toggleTreeMode(isDirectoryMode: boolean): void {
        this.log.info("toggleTreeMode", isDirectoryMode);
        this.treeViewMode = isDirectoryMode ? TreeViewMode.DIRECTORY : TreeViewMode.NAME;

        // Update button icon based on mode
        this.setToggleModeButtonIcon();

        // Rebuild tree with new mode
        this.buildOrUpdateTreeModel(this.mergeIntoIndexFilters(this.currentFilters, this.focusedIndex));
        this.renderTree();

        // Restore selection if any
        if (this.currentSelectedIndex !== null) {
            this.selectNode(this.currentSelectedIndex);
        }
    }

    private setToggleModeButtonIcon(): void {
        const button = $("#tree-mode-toggle");
        if (this.treeViewMode == TreeViewMode.DIRECTORY) {
            // In directory mode, show segments icon (to switch back to name mode)
            button.removeClass("img-tree-mode-folder").addClass("img-tree-mode-segments");
        } else {
            // In name mode, show folder icon (to switch to directory mode)
            button.removeClass("img-tree-mode-segments").addClass("img-tree-mode-folder");
        }
    }

    /**
     * Expands all tree nodes
     */
    private expandAll(): void {
        this.treeViewElement.find('.tree-children').show();
        if (this.treeViewMode === TreeViewMode.DIRECTORY) {
            this.treeViewElement.find('.tree-expand-icon.tree-folder-icon')
                .removeClass('folder-closed').addClass('folder-open');
        } else {
            this.treeViewElement.find('.tree-expand-icon').text('▼');
        }
    }

    /**
     * Collapses all tree nodes
     */
    private collapseAll(): void {
        this.treeViewElement.find('.tree-children').hide();
        if (this.treeViewMode === TreeViewMode.DIRECTORY) {
            this.treeViewElement.find('.tree-expand-icon.tree-folder-icon')
                .removeClass('folder-open').addClass('folder-closed');
        } else {
            this.treeViewElement.find('.tree-expand-icon').text('▶');
        }
    }

    private scrollToSelection(): void {
        this.scrollToNodeSelected(this.selectedTreeNode);
    }

    /**
     * Hide or unhide empty nodes.
     *
     * @param hide true to hide all nodes that have 0 specItems
     */
    private updateHideEmptyNodes(hide: boolean): void {
        this.hideEmptyNodes = hide;
        this.updateRenderedNodes(this.getRootNodes());
    }


    //
    // Helpers

    /**
     * Escapes HTML special characters
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
