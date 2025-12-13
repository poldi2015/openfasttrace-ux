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

interface TreeNode {
    name: string;
    firstIndex: number;
    children: Map<string, TreeNode>;
    level: number;
    fullPath: string;
}

const MAX_TREE_DEPTH = 3; // Type + MAX_TREE_DEPTH level

export class TreeViewElement {
    private readonly log: Log = new Log("TreeViewElement");
    private readonly treeViewElement: JQuery;
    private rootNodes: Map<string, TreeNode> = new Map();
    private suppressSelectionEvent: boolean = false;

    constructor(
        private readonly specItems: Array<SpecItem>,
        private readonly oftStateController: OftStateController,
        private readonly project: Project
    ) {
        this.treeViewElement = $("#tree-view");
    }

    public init(): TreeViewElement {
        this.buildTreeModel();
        this.renderTree();
        this.attachExpandCollapseButtons();
        this.oftStateController.addChangeListener(
            (event: ChangeEvent) => this.handleSelectionChange(event),
            EventType.Selection
        );
        return this;
    }

    public activate(): void {
        // Activation logic if needed
    }

    public deactivate(): void {
        // Deactivation logic if needed
    }

    public isActive(): boolean {
        return true;
    }

    //
    // Buttons

    /**
     * Attaches handlers to the expand/collapse all buttons
     */
    private attachExpandCollapseButtons(): void {
        $('#tree-expand-all').off('click').on('click', () => {
            this.expandAll();
        });

        $('#tree-collapse-all').off('click').on('click', () => {
            this.collapseAll();
        });
    }


    //
    // Model

    /**
     * Splits a specItem name by delimiters (-, _, .) and builds a hierarchical tree structure.
     * The type is the uppermost level, followed by name tokens.
     * Excludes the last token from the path. Limits depth to MAX_TREE_DEPTH levels.
     */
    private buildTreeModel(): void {
        this.log.info("Building tree from", this.specItems.length, "specItems");

        this.specItems.forEach(specItem => {
            const pathTokens = this.splitSpecItemNameIntoPath(specItem.name);
            if (pathTokens.length < 1) return;

            // Prepend the type name as the uppermost level
            const typeName = this.project.types[specItem.type];
            const fullPath = [typeName, ...pathTokens];

            this.insertIntoTree(fullPath, specItem, 0, this.rootNodes, '');
        });

        this.log.info("Tree built with", this.rootNodes.size, "root nodes");
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
        return allPathTokens.slice(0, MAX_TREE_DEPTH);

    }

    /**
     * Recursively inserts a specItem into the tree structure
     */
    private insertIntoTree(
        pathTokens: Array<string>,
        specItem: SpecItem,
        level: number,
        levelNodes: Map<string, TreeNode>,
        parentPath: string
    ): void {
        if (pathTokens.length === 0 || level >= MAX_TREE_DEPTH + 1) return;

        const token = pathTokens[0];
        const remainingTokens = pathTokens.slice(1);
        const fullPath = parentPath ? parentPath + "-" + token : token;

        // Get or create node for this token
        let node = levelNodes.get(token);
        if (!node) {
            node = {
                name: token,
                firstIndex: specItem.index,
                children: new Map(),
                level: level,
                fullPath: fullPath
            };
            levelNodes.set(token, node);
        }

        // If this is the last token in the path, add the specItem here
        if (remainingTokens.length != 0 || level >= MAX_TREE_DEPTH) {
            this.insertIntoTree(remainingTokens, specItem, level + 1, node.children, fullPath);
        }
    }

    //
    // Render tree

    /**
     * Renders the tree structure as HTML
     */
    private renderTree(): void {
        this.treeViewElement.empty();

        const treeHtml = this.renderNodes(this.rootNodes);
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
            const itemCount = this.countTotalItems(node);

            html += `<li class="tree-node" data-level="${node.level}" data-itemIndex="${node.firstIndex}" data-path="${node.fullPath}">`;

            // Node label with expand/collapse icon
            html += `<div class="tree-node-label">`;

            if (hasChildren) {
                html += `<span class="tree-expand-icon">▶</span>`;
            } else {
                html += `<span class="tree-expand-icon-placeholder"></span>`;
            }

            html += `<span class="tree-node-name">${this.escapeHtml(node.name)}</span>`;
            html += `<span class="tree-node-count">(${itemCount})</span>`;
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
     * Counts total number of specItems in a node and all its children
     */
    private countTotalItems(node: TreeNode): number {
        let count = node.children.size;
        node.children.forEach(child => {
            count += this.countTotalItems(child);
        });
        return count;
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
            const childNodes = treeNode.children('.tree-children');

            // Mark this node as selected
            this.markNodeSelected(treeNode);

            // Toggle expand/collapse if has children
            const isExpanded = childNodes.is(':visible');
            this.expandNode(treeNode, !isExpanded);

            // Select first matching specItem in this node or its children
            this.selectSpecItem(this.findFirstSpecItemInNode(treeNode));
        });
    }

    /**
     * Finds the first specItem index in a node by extracting it from the node's id attribute
     */
    private findFirstSpecItemInNode(treeNode: JQuery): number | null {
        const treeItemIndex = treeNode.attr('data-itemIndex');
        return treeItemIndex != null ? parseInt(treeItemIndex, 10) : null;
    }

    /**
     * Select the specItem in the specItem view with the given index.
     */
    private selectSpecItem(index: number | null): void {
        if (index == null) return;
        this.log.info("selectSpecItem firstNode index", index);
        this.suppressSelectionEvent = true;
        this.oftStateController.selectAndShowItem(index);
    }


    //
    // Selection change handler

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
            this.selectNode(selectedIndex);
        });
    }

    /**
     * Updates tree selection based on the selected specItem
     */
    private selectNode(selectedIndex: number | null): void {
        if (selectedIndex === null) return;
        this.log.info("selectNode to index", selectedIndex);

        const treeNodeMatchingPath = this.findMatchingNode(this.specItems[selectedIndex]);
        if (treeNodeMatchingPath && treeNodeMatchingPath.length > 0) {
            this.markNodeSelected(treeNodeMatchingPath);
        }
    }

    /**
     * Selects the tree node that best matches the given specItem
     */
    private findMatchingNode(specItem: SpecItem): JQuery {
        const namePath = this.splitSpecItemNameIntoPath(specItem.name).join('-');
        const fullPath = this.project.types[specItem.type] + (namePath.length > 0 ? '-' + namePath : '');
        return this.treeViewElement.find(`.tree-node[data-path="${fullPath}"]`);
    }


    //
    // Render changes

    /**
     * Marks a tree node as selected
     */
    private markNodeSelected(treeNode: JQuery): void {
        this.removeSelections();
        const labelNode = treeNode.children(".tree-node-label");
        this.expandParentNodes(treeNode);
        this.log.info("markNodeSelected", treeNode.attr("data-path"));
        labelNode.addClass('tree-node-selected');

        // Scroll the selected node into view after expansion animation completes
        if (labelNode.length > 0) {
            // Wait for slideDown animation to complete (200ms + small buffer)
            setTimeout(() => {
                const labelElement = labelNode[0];
                labelElement.scrollIntoView({behavior: 'smooth', block: 'nearest'});
            }, 250);
        }
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
                expandIconNode.text('▼');
            } else {
                childNodes.slideUp(200);
                expandIconNode.text('▶');
            }
        }

    }

    /**
     * Expands all tree nodes
     */
    private expandAll(): void {
        this.treeViewElement.find('.tree-children').show();
        this.treeViewElement.find('.tree-expand-icon').text('▼');
    }

    /**
     * Collapses all tree nodes
     */
    private collapseAll(): void {
        this.treeViewElement.find('.tree-children').hide();
        this.treeViewElement.find('.tree-expand-icon').text('▶');
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
