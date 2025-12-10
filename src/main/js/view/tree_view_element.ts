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
import {Log} from "@main/utils/log";

interface TreeNode {
    name: string;
    specItems: Array<SpecItem>;
    children: Map<string, TreeNode>;
    level: number;
}

const MAX_TREE_DEPTH = 4;

export class TreeViewElement {
    private readonly log: Log = new Log("TreeViewElement");
    private readonly treeViewElement: JQuery;
    private rootNodes: Map<string, TreeNode> = new Map();

    constructor(
        private readonly specItems: Array<SpecItem>,
        private readonly oftStateController: OftStateController
    ) {
        this.treeViewElement = $("#tree-view");
    }

    public init(): TreeViewElement {
        this.buildTree();
        this.renderTree();
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
     * Splits a specItem name by delimiters (-, _, .) and builds a hierarchical tree structure.
     * Excludes the last token from the path. Limits depth to MAX_TREE_DEPTH levels.
     */
    private buildTree(): void {
        this.log.info("Building tree from", this.specItems.length, "specItems");

        this.specItems.forEach(specItem => {
            const tokens = this.splitName(specItem.name);

            if (tokens.length === 0) {
                // If no tokens or only one token, skip or add to root
                return;
            }

            // Build path from tokens (excluding last token)
            const pathTokens = tokens.slice(0, -1);

            if (pathTokens.length === 0) {
                // Single token name - skip or handle specially
                return;
            }

            this.insertIntoTree(pathTokens, specItem, 0, this.rootNodes);
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
                specItems: [],
                children: new Map(),
                level: level
            };
            currentLevel.set(token, node);
        }

        // If this is the last token in the path, add the specItem here
        if (remainingTokens.length === 0 || level >= MAX_TREE_DEPTH - 1) {
            node.specItems.push(specItem);
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

        sortedEntries.forEach(([key, node]) => {
            const hasChildren = node.children.size > 0;
            const hasItems = node.specItems.length > 0;
            const itemCount = this.countTotalItems(node);

            html += `<li class="tree-node" data-level="${node.level}">`;

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

            // Render spec items at this level
            if (hasItems) {
                html += `<ul class="tree-items">`;
                node.specItems.forEach(specItem => {
                    html += `<li class="tree-item" data-index="${specItem.index}">`;
                    html += `<span class="tree-item-title">${this.escapeHtml(specItem.title)}</span>`;
                    html += `</li>`;
                });
                html += `</ul>`;
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
        let count = node.specItems.length;
        node.children.forEach(child => {
            count += this.countTotalItems(child);
        });
        return count;
    }

    /**
     * Attaches click handlers for tree interaction
     */
    private attachClickHandlers(): void {
        // Toggle expand/collapse
        this.treeViewElement.find('.tree-node-label').off('click').on('click', (e) => {
            e.stopPropagation();
            const $label = $(e.currentTarget);
            const $node = $label.parent('.tree-node');
            const $children = $node.children('.tree-children');
            const $icon = $label.find('.tree-expand-icon');

            if ($children.length > 0) {
                const isExpanded = $children.is(':visible');
                if (isExpanded) {
                    $children.slideUp(200);
                    $icon.text('▶');
                } else {
                    $children.slideDown(200);
                    $icon.text('▼');
                }
            }
        });

        // Handle specItem clicks
        this.treeViewElement.find('.tree-item').off('click').on('click', (e) => {
            e.stopPropagation();
            const $item = $(e.currentTarget);
            const index = parseInt($item.attr('data-index') || '0', 10);

            this.log.info("Tree item clicked, selecting index", index);
            this.oftStateController.selectAndShowItem(index);
        });
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
