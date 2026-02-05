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
export const metadata = {
    project: {
        name: "project-2501-131527",
        item_count: 500,
        item_covered: 300,
        item_uncovered: 200,
    },
    filters: {
        type: [
            {
                id: "feat",
                name: "Feature",
                tooltip: "A feature is a distinct functionality of the software.",
                item_count: 30,
            },
            {
                id: "req",
                name: "Requirement",
                tooltip: "A customer requirement.",
                item_count: 50,
            },
            {
                id: "arch",
                name: "Architecture",
                tooltip: "A requirement within an architecture document.",
                item_count: 100,
            },
            {
                id: "dsn",
                name: "Detailed Design",
                tooltip: "A requirement within an design document.",
                item_count: 100,
            },
            {
                id: "impl",
                name: "Implementation",
                tooltip: "Tracing to source code.",
                item_count: 20,
            },
            {
                id: "utest",
                name: "Unit Test",
                tooltip: "An Unit Test implementation.",
                item_count: 50,
            },
            {
                id: "itest",
                name: "Integration Test",
                tooltip: "An Integration Test implementation.",
                item_count: 50,
            },
            {
                id: "stest",
                name: "System Test",
                tooltip: "Tests based on customer requirements.",
                item_count: 50,
            }
        ],
        uncovered: [
            {
                id: "req",
                name: "Requirement",
                tooltip: "Missing requirements.",
                color: "red",
                item_count: 2,
            },
            {
                id: "arch",
                name: "Architecture",
                tooltip: "Missing architecture.",
                color: "red",
                item_count: 2,
            },
            {
                id: "dsn",
                name: "Detailed Design",
                tooltip: "Missing detailed design.",
                color: "red",
                item_count: 20,
            },
            {
                id: "impl",
                name: "Implementation",
                tooltip: "Missing implementation.",
                color: "red",
                item_count: 34,
            },
            {
                id: "utest",
                name: "Unit Tests",
                tooltip: "Missing unit tests.",
                color: "red",
                item_count: 8,
            },
            {
                id: "itest",
                name: "Integration Tests",
                tooltip: "Missing integration tests.",
                color: "red",
                item_count: 40,
            },
            {
                id: "stest",
                name: "System Tests",
                tooltip: "Missing system tests.",
                color: "red",
                item_count: 40,
            }
        ],
        status: [
            {
                id: "APPROVED",
                name: "Accepted",
                tooltip: "Item is an accepted traceable element.",
                color: "green",
                item_count: 50,
            },
            {
                id: "DRAFT",
                name: "Draft",
                tooltip: "Item is not part of tracing.",
                color: "red",
                item_count: 2,
            },
        ],
        tags: [
            {
                id: "v0.1",
                tooltip: "Version 0.1",
                color: "green",
                item_count: 50,
            },
            {
                id: "v1.0",
                label: "ver 1.0",
                tooltip: "Version 1.0",
                color: "green",
                item_count: 50,
            },
            {
                id: "v2.0",
                label: "ver 2.0",
                name: "VERSION two.zero",
                tooltip: "Version 2.0",
                color: "green",
                item_count: 50,
            },
            {
                id: "frontend",
                tooltip: "Web Page",
                item_count: 50,
            },
            {
                id: "backend",
                tooltip: "Cloud software",
                item_count: 50,
            },
        ]
    }
};
