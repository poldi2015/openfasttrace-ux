(function (window, undefined) {
    window.filterModel = {
        type: [
            {
                name: "Feature",
                tooltip: "A feature is a distinct functionality of the software.",
                item_count: 30,
            },
            {
                name: "Requirement",
                tooltip: "A customer requirement.",
                item_count: 50,
            },
            {
                name: "Architecture",
                tooltip: "A requirement within an architecture document.",
                item_count: 100,
            },
            {
                name: "Detailed Design",
                tooltip: "A requirement within an design document.",
                item_count: 100,
            },
            {
                name: "Unit Test",
                tooltip: "An Unit Test implementation.",
                item_count: 50,
            },
            {
                name: "Implementation",
                tooltip: "Tracing to source code.",
                item_count: 20,
            },
            {
                name: "Integration Test",
                tooltip: "An Integration Test implementation.",
                item_count: 50,
            }
        ],
        coverage: [
            {
                name: "Covered",
                tooltip: "Requirement is fully covered",
                color: "green",
                item_count: 50,
            },
            {
                name: "No Architecture",
                tooltip: "Requirement is not covered by an architecture.",
                color: "red",
                item_count: 2,
            },
            {
                name: "No Detailed Design",
                tooltip: "Requirement is not covered by a detailed design.",
                color: "red",
                item_count: 20,
            },
            {
                name: "No Implementation",
                tooltip: "Requirement is not implemented.",
                color: "red",
                item_count: 34,
            },
            {
                name: "No Unit Tests",
                tooltip: "Requirement is not tested by unit tests.",
                color: "red",
                item_count: 8,
            },
            {
                name: "No Integration Tests",
                tooltip: "Requirement is not tested by integration tests.",
                color: "red",
                item_count: 40,
            }
        ]
    };
})(window);