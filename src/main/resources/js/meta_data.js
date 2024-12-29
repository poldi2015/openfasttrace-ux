(function (window) {
    window.metadata = {
        filters: {
            type: [
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
                    name: "System Test",
                    tooltip: "Tests based on customer requirements.",
                    item_count: 50,
                }
            ],
            uncovered: [
                {
                    name: "Requirement",
                    tooltip: "Missing requirements.",
                    color: "red",
                    item_count: 2,
                },
                {
                    name: "Architecture",
                    tooltip: "Missing architecture.",
                    color: "red",
                    item_count: 2,
                },
                {
                    name: "Detailed Design",
                    tooltip: "Missing detailed design.",
                    color: "red",
                    item_count: 20,
                },
                {
                    name: "Implementation",
                    tooltip: "Missing implementation.",
                    color: "red",
                    item_count: 34,
                },
                {
                    name: "Unit Tests",
                    tooltip: "Missing unit tests.",
                    color: "red",
                    item_count: 8,
                },
                {
                    name: "Integration Tests",
                    tooltip: "Missing integration tests.",
                    color: "red",
                    item_count: 40,
                },
                {
                    name: "System Tests",
                    tooltip: "Missing system tests.",
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
            ],
            tags: [
                {
                    name: "v0.1",
                    tooltip: "Version 0.1",
                    color: "green",
                    item_count: 50,
                },
                {
                    name: "v1.0",
                    tooltip: "Version 1.0",
                    color: "green",
                    item_count: 50,
                },
                {
                    name: "v2.0",
                    tooltip: "Version 2.0",
                    color: "green",
                    item_count: 50,
                },
            ]
        }
    };
})(window);
