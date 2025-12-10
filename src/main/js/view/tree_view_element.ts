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
    specItems: SpecItem;
    children: Map<string, TreeNode>;
    level: number;
}

const MAX_TREE_DEPTH = 5; // Type + 4 levels of name hierarchy

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
        this.buildTree();
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

    /**
     * Splits a specItem name by delimiters (-, _, .) and builds a hierarchical tree structure.
     * The type is the uppermost level, followed by name tokens.
     * Excludes the last token from the path. Limits depth to MAX_TREE_DEPTH levels.
     */
    private buildTree(): void {
        this.log.info("Building tree from", this.specItems.length, "specItems");

        this.specItems.forEach(specItem => {
            const tokens = this.splitName(specItem.name);

            if (tokens.length < 2) {
                // If no tokens, skip
                return;
            }

            // Build path from tokens (excluding last token)
            const pathTokens = tokens.slice(0, -1);

            //if (pathTokens.length === 0) {
                // Single token name - add under type only
            //pathTokens.push(specItem.name);
            //}

            // Prepend the type name as the uppermost level
            const typeName = this.project.types[specItem.type];
            const fullPath = [typeName, ...pathTokens];

            this.insertIntoTree(fullPath, specItem, 0, this.rootNodes);
        });

        this.log.info("Tree built with", this.rootNodes.size, "root nodes");
    }

    /**
     * Splits name by minus, underscore, or dot
     */
    private splitName(name: string): Array<string> {
        return name.split(/[-_.]+/).filter(token => token.length > 0);
    }

    /**
     * Recursively inserts a specItem into the tree structure
     */
    private insertIntoTree(
        pathTokens: Array<string>,
        specItem: SpecItem,
        level: number,
        currentLevel: Map<string, TreeNode>
    ): void {
        if (pathTokens.length === 0 || level >= MAX_TREE_DEPTH) {
            return;
        }

        const token = pathTokens[0];
        const remainingTokens = pathTokens.slice(1);

        // Get or create node for this token
        let node = currentLevel.get(token);
        if (!node) {
            node = {
                name: token,
                specItems: specItem,
                children: new Map(),
                level: level
            };
            currentLevel.set(token, node);
        }

        // If this is the last token in the path, add the specItem here
        if (remainingTokens.length === 0 || level >= MAX_TREE_DEPTH - 1) {
            //node.specItems.push(specItem);
        } else {
            // Recurse into children
            this.insertIntoTree(remainingTokens, specItem, level + 1, node.children);
        }
    }

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
        const sortedEntries = Array.from(nodes.entries()).sort((a, b) =>
            a[0].localeCompare(b[0])
        );

        sortedEntries.forEach(([_, node]) => {
            const hasChildren = node.children.size > 0;
            const itemCount = this.countTotalItems(node);
            const firstItemIndex = node.specItems.index;

            html += `<li class="tree-node" data-level="${node.level}" data-itemIndex="${firstItemIndex}">`;

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

    /*
     * Attaches click handlers for tree interaction
     */
    private attachClickHandlers(): void {
        // Handle tree node label clicks - expand/collapse and select first item
        this.treeViewElement.find('.tree-node-label').off('click').on('click', (e) => {
            e.stopPropagation();
            const labelNode = $(e.currentTarget);
            const treeNode = labelNode.parent('.tree-node');
            const childNodes = treeNode.children('.tree-children');
            const expandIconNode = labelNode.find('.tree-expand-icon');

            // Mark this node as selected
            this.markNodeSelected(labelNode);

            // Toggle expand/collapse if has children
            if (childNodes.length > 0) {
                const isExpanded = childNodes.is(':visible');
                if (isExpanded) {
                    childNodes.slideUp(200);
                    expandIconNode.text('▶');
                } else {
                    childNodes.slideDown(200);
                    expandIconNode.text('▼');
                }
            }

            // Select first matching specItem in this node or its children
            const firstItemIndex = this.findFirstSpecItemInNode(treeNode);
            if (firstItemIndex !== null) {
                this.log.info("Tree node clicked, selecting first item index", firstItemIndex);
                this.suppressSelectionEvent = true;
                this.oftStateController.selectAndShowItem(firstItemIndex);
            }
        });

        // Handle specItem clicks
        /*
        this.treeViewElement.find('.tree-item').off('click').on('click', (e) => {
            e.stopPropagation();
            const $item = $(e.currentTarget);
            const index = parseInt($item.attr('data-index') || '0', 10);

            this.log.info("Tree item clicked, selecting index", index);
            this.oftStateController.selectAndShowItem(index);
        });
         */
    }

    /**
     * Finds the first specItem index in a node by extracting it from the node's id attribute
     */
    private findFirstSpecItemInNode(treeNode: JQuery): number | null {
        const treeItemIndex = treeNode.attr('data-itemIndex');
        return treeItemIndex != null ? parseInt(treeItemIndex, 10) : null;
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
            this.updateTreeSelection(selectedIndex);
        });
    }

    /**
     * Updates tree selection based on the selected specItem
     */
    private updateTreeSelection(selectedIndex: number | null): void {
        // Remove all previous selections
        this.treeViewElement.find('.tree-node-label').removeClass('tree-node-selected');
        //this.treeViewElement.find('.tree-item').removeClass('tree-item-selected');

        if (selectedIndex === null) {
            return;
        }

        // Find and mark the selected item
        const $selectedItem = this.treeViewElement.find(`.tree-item[data-index="${selectedIndex}"]`);
        if ($selectedItem.length > 0) {
            $selectedItem.addClass('tree-item-selected');
            return;
        }

        // If exact item not found, find the best matching tree node
        const selectedSpecItem = this.specItems[selectedIndex];
        if (selectedSpecItem) {
            this.selectBestMatchingNode(selectedSpecItem);
        }
    }

    /**
     * Selects the tree node that best matches the given specItem
     */
    private selectBestMatchingNode(specItem: SpecItem): void {
        const typeName = this.project.types[specItem.type];
        const tokens = this.splitName(specItem.name);
        const pathTokens = tokens.slice(0, -1);

        // Build the path to search for
        const searchPath = [typeName, ...pathTokens];

        // Try to find nodes that match progressively shorter paths
        for (let i = searchPath.length; i > 0; i--) {
            const partialPath = searchPath.slice(0, i).join(' ');
            const $matchingNode = this.findNodeByPath(partialPath);

            if ($matchingNode.length > 0) {
                $matchingNode.addClass('tree-node-selected');
                return;
            }
        }
    }

    /**
     * Finds a tree node by matching its text path
     */
    private findNodeByPath(path: string): JQuery {
        const pathParts = path.split(' ');
        let $currentLevel = this.treeViewElement.find('> .tree-list > .tree-node');
        let $result: JQuery = $();

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            let found = false;

            $currentLevel.each((_, node) => {
                const $node = $(node);
                const nodeName = $node.find('> .tree-node-label > .tree-node-name').text().trim();

                if (nodeName === part) {
                    if (i === pathParts.length - 1) {
                        // Found the final node
                        $result = $node.find('> .tree-node-label');
                        return false; // break each loop
                    } else {
                        // Continue searching in children
                        $currentLevel = $node.find('> .tree-children > .tree-list > .tree-node');
                        found = true;
                        return false; // break each loop
                    }
                }
            });

            if (!found && i < pathParts.length - 1) {
                return $(); // Return empty jQuery object
            }
        }

        return $result;
    }

    /**
     * Marks a tree node as selected
     */
    private markNodeSelected(labelNode: JQuery): void {
        this.treeViewElement.find('.tree-node-label').removeClass('tree-node-selected');
        //const $label = labelNode.closest('.tree-node').find('> .tree-node-label');
        this.log.info("LABEL:", labelNode.find('.tree-node-name').text());
        labelNode.addClass('tree-node-selected');
    }

    /**
     * Escapes HTML special characters
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
