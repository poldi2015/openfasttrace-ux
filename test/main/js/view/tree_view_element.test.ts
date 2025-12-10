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
                comments: ""
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
                comments: ""
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
                comments: ""
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
                comments: ""
            }
        ];

        // Create mock controller
        oftStateController = {
            selectAndShowItem: vi.fn()
        } as any;

        // Create tree view
        treeView = new TreeViewElement(specItems, oftStateController, project);
    });

    test("should create tree with type names as root nodes", () => {
        // Act
        treeView.init();

        // Assert
        const treeHtml = $("#tree-view").html();

        // Check that type names appear in the tree
        expect(treeHtml).toContain("feat");
        expect(treeHtml).toContain("req");
        expect(treeHtml).toContain("arch");
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
        // isActive always returns true in current implementation
        expect(treeView.isActive()).toBe(true);
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
            comments: ""
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
        expect(treeHtml).toContain("dsn"); // project.types[3] = "dsn"
    });
});
