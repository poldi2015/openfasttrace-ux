(function (window) {
    window.metadata = {
        project: {
            name: "project-2501-131527",
            item_count: 500,
            item_covered: 300,
            item_uncovered: 200,
        },
        fields: {
            type: [
                {
                    id: "feat",
                    name: "Feature",
                    tooltip: "A feature is a distinct functionality of the software.",
                },
                {
                    id: "req",
                    name: "Requirement",
                    tooltip: "A customer requirement.",
                },
                {
                    id: "arch",
                    name: "Architecture",
                    tooltip: "A requirement within an architecture document.",
                },
                {
                    id: "dsn",
                    name: "Detailed Design",
                    tooltip: "A requirement within an design document.",
                },
                {
                    id: "impl",
                    name: "Implementation",
                    tooltip: "Tracing to source code.",
                },
                {
                    id: "utest",
                    name: "Unit Test",
                    tooltip: "An Unit Test implementation.",
                },
                {
                    id: "itest",
                    name: "Integration Test",
                    tooltip: "An Integration Test implementation.",
                },
                {
                    id: "stest",
                    name: "System Test",
                    tooltip: "Tests based on customer requirements.",
                }
            ],
            uncovered: [
                {
                    id: "feat",
                    name: "Feature",
                    tooltip: "Missing feature.",
                    color: "red",
                },
                {
                    id: "req",
                    name: "Requirement",
                    tooltip: "Missing requirements.",
                    color: "red",
                },
                {
                    id: "arch",
                    name: "Architecture",
                    tooltip: "Missing architecture.",
                    color: "red",
                },
                {
                    id: "dsn",
                    name: "Detailed Design",
                    tooltip: "Missing detailed design.",
                    color: "red",
                },
                {
                    id: "impl",
                    name: "Implementation",
                    tooltip: "Missing implementation.",
                    color: "red",
                },
                {
                    id: "utest",
                    name: "Unit Tests",
                    tooltip: "Missing unit tests.",
                    color: "red",
                },
                {
                    id: "itest",
                    name: "Integration Tests",
                    tooltip: "Missing integration tests.",
                    color: "red",
                },
                {
                    id: "stest",
                    name: "System Tests",
                    tooltip: "Missing system tests.",
                    color: "red",
                }
            ],
            status: [
                {
                    id: "approved",
                    name: "Accepted",
                    tooltip: "Item is an accepted traceable element.",
                    color: "green",
                },
                {
                    id: "proposed",
                    name: "Proposed",
                    tooltip: "Item is not part of tracing.",
                    color: "red",
                },
                {
                    id: "draft",
                    name: "Draft",
                    tooltip: "Item is not part of tracing.",
                    color: "red",
                },
                {
                    id: "rejected",
                    name: "Rejected",
                    tooltip: "Item is not part of tracing.",
                    color: "red",
                },
            ],
            tags: [
                {
                    id: "v0.1",
                    tooltip: "Version 0.1",
                    color: "green",
                },
                {
                    id: "v1.0",
                    tooltip: "Version 1.0",
                    color: "green",
                },
                {
                    id: "v2.0",
                    tooltip: "Version 2.0",
                    color: "green",
                },
                {
                    id: "frontend",
                    tooltip: "Web Page",
                },
                {
                    id: "backend",
                    tooltip: "Cloud software",
                },
            ]
        }
    };
})(window);
