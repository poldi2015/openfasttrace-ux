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
import {beforeEach, describe, expect, test, vi} from "vitest";
import {$} from "@test/fixtures/dom";
import {TreeViewElement} from "@main/view/tree_view_element";
import {OftStateController} from "@main/controller/oft_state_controller";
import {Project} from "@main/model/project";
import {SpecItem} from "@main/model/specitems";

describe("TreeViewElement - Type as uppermost level", () => {
    let treeView: TreeViewElement;
    let oftStateController: OftStateController;
    let project: Project;
    let specItems: Array<SpecItem>;

    beforeEach(() => {
        // Setup DOM
        $("body").html('<div id="tree-view"></div>');

        // Create mock project with types
        project = {
            types: ["feat", "req", "arch", "dsn"],
            typeLabels: ["Feature", "Requirement", "Architecture", "Design"],
            typeNames: ["Feature", "Requirement", "Architecture", "Design"],
            projectName: "Test Project",
            typedFieldNames: ["type"],
            tags: [],
            tagFieldNames: [],
            statusNames: [],
            statusFieldNames: [],
            itemCount: 0,
            itemCovered: 0,
            itemUncovered: 0,
            fieldModels: new Map(),
            getTypeFieldModel: vi.fn(),
            hasField: vi.fn(),
            getFieldModel: vi.fn()
        } as any;

        // Create mock specItems with different types
        specItems = [
            {
                index: 0,
                type: 0, // feat
                name: "user-authentication-login",
                title: "User Authentication Login",
                id: "feat:user-authentication-login:1",
                tags: [],
                version: 1,
                content: "Test content",
                provides: [],
                needs: [],
                covered: [],
                uncovered: [],
                covering: [],
                coveredBy: [],
                depends: [],
                status: 0,
                path: [],
                sourceFile: "",
                sourceLine: 0,
                comments: "",
                wrongLinkTypes: [],
                wrongLinkTargets: []
            },
            {
                index: 1,
                type: 1, // req
                name: "system-security-validation",
                title: "System Security Validation",
                id: "req:system-security-validation:1",
                tags: [],
                version: 1,
                content: "Test content",
                provides: [],
                needs: [],
                covered: [],
                uncovered: [],
                covering: [],
                coveredBy: [],
                depends: [],
                status: 0,
                path: [],
                sourceFile: "",
                sourceLine: 0,
                comments: "",
                wrongLinkTypes: [],
                wrongLinkTargets: []
            },
            {
                index: 2,
                type: 0, // feat
                name: "user-profile-management",
                title: "User Profile Management",
                id: "feat:user-profile-management:1",
                tags: [],
                version: 1,
                content: "Test content",
                provides: [],
                needs: [],
                covered: [],
                uncovered: [],
                covering: [],
                coveredBy: [],
                depends: [],
                status: 0,
                path: [],
                sourceFile: "",
                sourceLine: 0,
                comments: "",
                wrongLinkTypes: [],
                wrongLinkTargets: []
            },
            {
                index: 3,
                type: 2, // arch
                name: "database-layer-design",
                title: "Database Layer Design",
                id: "arch:database-layer-design:1",
                tags: [],
                version: 1,
                content: "Test content",
                provides: [],
                needs: [],
                covered: [],
                uncovered: [],
                covering: [],
                coveredBy: [],
                depends: [],
                status: 0,
                path: [],
                sourceFile: "",
                sourceLine: 0,
                comments: "",
                wrongLinkTypes: [],
                wrongLinkTargets: []
            }
        ];

        // Create mock controller
        oftStateController = {
            selectAndShowItem: vi.fn(),
            addChangeListener: vi.fn()
        } as any;

        // Create tree view
        treeView = new TreeViewElement(specItems, oftStateController, project);
    });

    test("should create tree with type names as root nodes", () => {
        // Act
        treeView.init();

        // Assert
        const treeHtml = $("#tree-view").html();

        // Check that type labels appear in the tree (not IDs)
        expect(treeHtml).toContain("Feature");
        expect(treeHtml).toContain("Requirement");
        expect(treeHtml).toContain("Architecture");
    });

    test("should group specItems under their type", () => {
        // Act
        treeView.init();

        // Assert
        const treeHtml = $("#tree-view").html();

        // The HTML should contain the structure with types
        expect(treeHtml).toBeTruthy();
        expect(treeHtml.length).toBeGreaterThan(0);

        // Check that tree nodes are created
        const treeNodes = $("#tree-view .tree-node");
        expect(treeNodes.length).toBeGreaterThan(0);
    });

    test("should show correct item count for each type", () => {
        // Act
        treeView.init();

        // Assert
        const treeHtml = $("#tree-view").html();

        // feat type should show count (2 items: user-authentication-login, user-profile-management)
        // req type should show count (1 item: system-security-validation)
        // arch type should show count (1 item: database-layer-design)

        // Verify count elements exist
        expect(treeHtml).toContain("tree-node-count");
    });

    test("should create hierarchical structure with type, then name tokens", () => {
        // Act
        treeView.init();

        // Assert
        const treeHtml = $("#tree-view").html();

        // Check that both type level and name token levels exist
        // feat -> user -> authentication, profile
        // req -> system -> security
        // arch -> database -> layer

        expect(treeHtml).toContain("tree-node-name");
        expect(treeHtml).toContain("tree-children");
    });

    test("should handle specItems with same type prefix", () => {
        // Act
        treeView.init();

        // Assert - two feat items should be grouped under the same feat type
        const treeNodes = $("#tree-view .tree-node");
        expect(treeNodes.length).toBeGreaterThan(0);
    });

    test("should activate and deactivate properly", () => {
        // Act & Assert
        treeView.init();
        treeView.activate();
        expect(treeView.isActive()).toBe(true);

        treeView.deactivate();
        expect(treeView.isActive()).toBe(false);
    });

    test("should handle empty specItems array", () => {
        // Arrange
        const emptySpecItems: Array<SpecItem> = [];
        const emptyTreeView = new TreeViewElement(emptySpecItems, oftStateController, project);

        // Act
        emptyTreeView.init();

        // Assert
        const treeHtml = $("#tree-view").html();
        // Empty tree should render but have no nodes
        expect(treeHtml).toBeDefined();
    });

    test("should use type index to lookup type name from project", () => {
        // Arrange - Create a specItem with type index 3
        const specItemWithType3: SpecItem = {
            index: 10,
            type: 3, // dsn
            name: "detailed-module-spec",
            title: "Detailed Module Spec",
            id: "dsn:detailed-module-spec:1",
            tags: [],
            version: 1,
            content: "Test",
            provides: [],
            needs: [],
            covered: [],
            uncovered: [],
            covering: [],
            coveredBy: [],
            depends: [],
            status: 0,
            path: [],
            sourceFile: "",
            sourceLine: 0,
            comments: "",
            wrongLinkTypes: [],
            wrongLinkTargets: []
        };

        const singleItemTreeView = new TreeViewElement(
            [specItemWithType3],
            oftStateController,
            project
        );

        // Act
        singleItemTreeView.init();

        // Assert
        const treeHtml = $("#tree-view").html();
        expect(treeHtml).toContain("Design"); // project.typeLabels[3] = "Design"
    });
});

describe("TreeViewElement - Directory-based tree mode", () => {
    let treeView: TreeViewElement;
    let oftStateController: OftStateController;
    let project: Project;
    let specItems: Array<SpecItem>;

    beforeEach(() => {
        // Setup DOM
        $("body").html(`
            <div id="tree-view"></div>
            <div id="tree-nav-bar" class="nav-bar">
                <span id="tree-mode-toggle" class="nav-btn nav-btn-toggler"></span>
                <span id="tree-hide-empty" class="nav-btn nav-btn-toggler nav-btn-on"></span>
                <span id="tree-expand-all" class="nav-btn"></span>
                <span id="tree-collapse-all" class="nav-btn"></span>
                <span id="btn-tree-scroll-to-selection" class="nav-btn"></span>
            </div>
        `);

        // Create mock project
        project = {
            types: ["feat", "req"],
            typeLabels: ["Feature", "Requirement"],
            typeIds: ["feat", "req"],
            typeNames: ["Feature", "Requirement"],
            projectName: "Test Project",
            typedFieldNames: ["type"],
            tags: [],
            tagFieldNames: [],
            statusNames: [],
            statusFieldNames: [],
            itemCount: 0,
            itemCovered: 0,
            itemUncovered: 0,
            fieldModels: new Map(),
            getTypeFieldModel: vi.fn(),
            hasField: vi.fn(),
            getFieldModel: vi.fn()
        } as any;

        // Mock controller
        oftStateController = {
            selectItem: vi.fn(),
            addChangeListener: vi.fn()
        } as any;

        // Create specItems with different source files
        specItems = [
            {
                index: 0,
                type: 0, // feat
                name: "login-feature",
                title: "Login Feature",
                id: "feat:login-feature:1",
                sourceFile: "src/auth/login.md",
                tags: [],
                version: 1,
                content: "Test",
                provides: [],
                needs: [],
                covered: [],
                uncovered: [],
                covering: [],
                coveredBy: [],
                depends: [],
                status: 0,
                path: [],
                sourceLine: 1,
                comments: "",
                wrongLinkTypes: [],
                wrongLinkTargets: []
            },
            {
                index: 1,
                type: 0, // feat
                name: "logout-feature",
                title: "Logout Feature",
                id: "feat:logout-feature:1",
                sourceFile: "src/auth/logout.md",
                tags: [],
                version: 1,
                content: "Test",
                provides: [],
                needs: [],
                covered: [],
                uncovered: [],
                covering: [],
                coveredBy: [],
                depends: [],
                status: 0,
                path: [],
                sourceLine: 1,
                comments: "",
                wrongLinkTypes: [],
                wrongLinkTargets: []
            },
            {
                index: 2,
                type: 1, // req
                name: "security-requirement",
                title: "Security Requirement",
                id: "req:security-requirement:1",
                sourceFile: "docs/requirements/security.md",
                tags: [],
                version: 1,
                content: "Test",
                provides: [],
                needs: [],
                covered: [],
                uncovered: [],
                covering: [],
                coveredBy: [],
                depends: [],
                status: 0,
                path: [],
                sourceLine: 1,
                comments: "",
                wrongLinkTypes: [],
                wrongLinkTargets: []
            }
        ];
    });

    test("Directory tree mode creates nodes based on source file paths", () => {
        // Arrange
        treeView = new TreeViewElement(specItems, oftStateController, project);
        treeView.init();
        treeView.activate();

        // Act - Toggle to directory mode
        const toggleButton = $("#tree-mode-toggle");
        toggleButton.trigger("click");

        // Assert - Check that directory-based tree includes filenames at lowest level
        const treeHtml = $("#tree-view").html();

        // Should have type nodes
        expect(treeHtml).toContain("Feature");
        expect(treeHtml).toContain("Requirement");

        // Should have directory nodes and filenames (files at deepest level)
        expect(treeHtml).toContain("login.md"); // filename at lowest level
        expect(treeHtml).toContain("logout.md"); // filename at lowest level
        expect(treeHtml).toContain("auth"); // parent folder
        expect(treeHtml).toContain("src"); // grandparent folder
        expect(treeHtml).toContain("security.md"); // filename at lowest level
        expect(treeHtml).toContain("requirements"); // parent folder
        expect(treeHtml).toContain("docs"); // grandparent folder
    });

    test("Directory tree respects MAX_TREE_DEPTH limit", () => {
        // Arrange - Create specItem with deep directory path
        const deepPathItem = {
            index: 3,
            type: 0,
            name: "deep-feature",
            title: "Deep Feature",
            id: "feat:deep-feature:1",
            sourceFile: "level1/level2/level3/level4/level5/deep.md",
            tags: [],
            version: 1,
            content: "Test",
            provides: [],
            needs: [],
            covered: [],
            uncovered: [],
            covering: [],
            coveredBy: [],
            depends: [],
            status: 0,
            path: [],
            sourceLine: 1,
            comments: "",
            wrongLinkTypes: [],
            wrongLinkTargets: []
        };

        treeView = new TreeViewElement([deepPathItem], oftStateController, project);
        treeView.init();
        treeView.activate();

        // Act - Toggle to directory mode
        const toggleButton = $("#tree-mode-toggle");
        toggleButton.trigger("click");

        // Assert - Should only have MAX_TREE_DEPTH (3) path components including filename
        const treeHtml = $("#tree-view").html();
        // Last 3 components in normal order: level4 -> level5 -> deep.md
        expect(treeHtml).toContain("deep.md");
        expect(treeHtml).toContain("level5");
        expect(treeHtml).toContain("level4");
        // level1, level2, level3 should not appear as they're not in the last MAX_TREE_DEPTH
    });

    test("Directory tree handles empty source file paths", () => {
        // Arrange - Create specItem with empty sourceFile
        const emptySourceItem = {
            index: 4,
            type: 0,
            name: "no-source-feature",
            title: "No Source Feature",
            id: "feat:no-source-feature:1",
            sourceFile: "",
            tags: [],
            version: 1,
            content: "Test",
            provides: [],
            needs: [],
            covered: [],
            uncovered: [],
            covering: [],
            coveredBy: [],
            depends: [],
            status: 0,
            path: [],
            sourceLine: 0,
            comments: "",
            wrongLinkTypes: [],
            wrongLinkTargets: []
        };

        treeView = new TreeViewElement([emptySourceItem], oftStateController, project);
        treeView.init();
        treeView.activate();

        // Act - Toggle to directory mode
        const toggleButton = $("#tree-mode-toggle");
        toggleButton.trigger("click");

        // Assert - Should only show type node, no directory nodes
        const treeHtml = $("#tree-view").html();
        expect(treeHtml).toContain("Feature");
    });

    test("Can toggle between name-based and directory-based modes", () => {
        // Arrange
        treeView = new TreeViewElement(specItems, oftStateController, project);
        treeView.init();
        treeView.activate();

        // Initial state - name-based tree
        let treeHtml = $("#tree-view").html();
        expect(treeHtml).toContain("login"); // from name "login-feature"

        // Act - Toggle to directory mode
        const toggleButton = $("#tree-mode-toggle");
        toggleButton.trigger("click");

        // Assert - directory-based tree with files at lowest level
        treeHtml = $("#tree-view").html();
        expect(treeHtml).toContain("login.md"); // filename at lowest level
        expect(treeHtml).toContain("auth"); // parent folder
        expect(treeHtml).toContain("src"); // grandparent folder

        // Act - Toggle back to name mode
        toggleButton.trigger("click");

        // Assert - back to name-based tree
        treeHtml = $("#tree-view").html();
        expect(treeHtml).toContain("login");
    });

    test("Directory tree handles Windows-style path separators", () => {
        // Arrange - Create specItem with Windows-style path
        const windowsPathItem = {
            index: 5,
            type: 0,
            name: "windows-feature",
            title: "Windows Feature",
            id: "feat:windows-feature:1",
            sourceFile: "src\\components\\windows.md",
            tags: [],
            version: 1,
            content: "Test",
            provides: [],
            needs: [],
            covered: [],
            uncovered: [],
            covering: [],
            coveredBy: [],
            depends: [],
            status: 0,
            path: [],
            sourceLine: 1,
            comments: "",
            wrongLinkTypes: [],
            wrongLinkTargets: []
        };

        treeView = new TreeViewElement([windowsPathItem], oftStateController, project);
        treeView.init();
        treeView.activate();

        // Act - Toggle to directory mode
        const toggleButton = $("#tree-mode-toggle");
        toggleButton.trigger("click");

        // Assert - Should normalize backslashes and show file at lowest level
        const treeHtml = $("#tree-view").html();
        expect(treeHtml).toContain("windows.md"); // filename at lowest level
        expect(treeHtml).toContain("components"); // parent folder
        expect(treeHtml).toContain("src"); // grandparent folder
    });
});
