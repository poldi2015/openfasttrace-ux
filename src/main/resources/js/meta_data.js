(function (window) {
    window.metadata = {
        types: [
            {
                label: "feat",
                name: "Feature",
                tooltip: "A feature is a distinct functionality of the software.",
                item_count: 30,
            },
            {
                label: "req",
                name: "Requirement",
                tooltip: "A customer requirement.",
                item_count: 50,
            },
            {
                label: "arch",
                name: "Architecture",
                tooltip: "A requirement within an architecture document.",
                item_count: 100,
            },
            {
                label: "dsn",
                name: "Detailed Design",
                tooltip: "A requirement within an design document.",
                item_count: 100,
            },
            {
                label: "impl",
                name: "Implementation",
                tooltip: "Tracing to source code.",
                item_count: 20,
            },
            {
                label: "utest",
                name: "Unit Test",
                tooltip: "An Unit Test implementation.",
                item_count: 50,
            },
            {
                label: "itest",
                name: "Integration Test",
                tooltip: "An Integration Test implementation.",
                item_count: 50,
            },
            {
                label: "stest",
                name: "System test",
                tooltip: "Tests based on customer requirements.",
                item_count: 50,
            }
        ],
        coverages: [
            {
                name: "No Requirement",
                tooltip: "Feature is not covered by a Requirement.",
                color: "red",
                item_count: 2,
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
        ],
        status: [
            {
                name: "Accepted",
                tooltip: "Item is an accepted traceable element.",
                color: "green",
                item_count: 50,
            },
            {
                name: "Draft",
                tooltip: "Item is not part of tracing.",
                color: "red",
                item_count: 2,
            },
        ]
    };
})(window);
