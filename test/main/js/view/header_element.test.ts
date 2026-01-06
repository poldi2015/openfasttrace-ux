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
import {describe, expect, vi, beforeEach, afterEach} from "vitest";
import {test} from "@test/fixtures/fixtures";
import {HeaderElement} from "@main/view/header_element";
import {ThemeController} from "@main/controller/theme_controller";
import {$} from "@test/fixtures/dom";

const HTML_HEADER = `
<div id="header" class="header-footer">
    <div>
        <div id="header-left">
            <img id="logo">
            &nbsp;&nbsp;
            <span id="project-name"></span>
        </div>
        <span id="nav-bar-header" class="nav-bar">
            <span id="btn-theme-toggle" class="nav-btn nav-btn-toggler nav-btn-on" title="Toggle Dark/Light Mode"></span>
        </span>
    </div>
</div>
`;

const EXPECTED_HEADER_WITH_PROJECT_NAME = `
<div id="header" class="header-footer">
    <div>
        <div id="header-left">
            <img id="logo">
            &nbsp;&nbsp;
            <span id="project-name">Test Project</span>
        </div>
        <span id="nav-bar-header" class="nav-bar">
            <span id="btn-theme-toggle" class="nav-btn nav-btn-toggler nav-btn-on" title="Toggle Dark/Light Mode"></span>
        </span>
    </div>
</div>
`;

describe("Tests for HeaderElement", () => {
    let body: JQuery<HTMLElement>;
    let themeController: ThemeController;
    let mockToggleTheme: any;

    beforeEach(() => {
        body = $("body");
        body.empty();
        body.append(HTML_HEADER);
        
        // Create a mock ThemeController
        themeController = new ThemeController();
        mockToggleTheme = vi.spyOn(themeController, 'toggleTheme');
        vi.spyOn(themeController, 'init').mockReturnValue(themeController);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("HeaderElement can be instantiated correctly", () => {
        const headerElement = new HeaderElement(
            $("#header"),
            "Test Project",
            themeController
        );

        expect(headerElement).toBeDefined();
        expect(headerElement.isActive()).toBe(false);
    });

    test("HeaderElement.init() sets project name", () => {
        const headerElement = new HeaderElement(
            $("#header"),
            "Test Project",
            themeController
        );

        headerElement.init();

        expect($("#project-name").text()).toBe("Test Project");
        expect(body).toMatchHTML(EXPECTED_HEADER_WITH_PROJECT_NAME);
    });

    test("HeaderElement.init() initializes navbar with theme toggle button", () => {
        const headerElement = new HeaderElement(
            $("#header"),
            "Test Project",
            themeController
        );

        headerElement.init();

        // Check that the theme toggle button exists and has correct classes
        const themeButton = $("#btn-theme-toggle");
        expect(themeButton.length).toBe(1);
        expect(themeButton.hasClass("nav-btn")).toBe(true);
        expect(themeButton.hasClass("nav-btn-toggler")).toBe(true);
        expect(themeButton.hasClass("nav-btn-on")).toBe(true);
    });

    test("HeaderElement.init() returns itself for chaining", () => {
        const headerElement = new HeaderElement(
            $("#header"),
            "Test Project",
            themeController
        );

        const result = headerElement.init();

        expect(result).toBe(headerElement);
    });

    test("HeaderElement.activate() enables theme toggle button", () => {
        const headerElement = new HeaderElement(
            $("#header"),
            "Test Project",
            themeController
        );

        headerElement.init();
        headerElement.activate();

        expect(headerElement.isActive()).toBe(true);
        
        // Button should not be disabled
        const themeButton = $("#btn-theme-toggle");
        expect(themeButton.prop('disabled')).toBe(false);
    });

    test("HeaderElement.deactivate() disables theme toggle button", () => {
        const headerElement = new HeaderElement(
            $("#header"),
            "Test Project",
            themeController
        );

        headerElement.init();
        headerElement.activate();
        headerElement.deactivate();

        expect(headerElement.isActive()).toBe(false);
        
        // Button should be disabled
        const themeButton = $("#btn-theme-toggle");
        expect(themeButton.prop('disabled')).toBe(true);
    });

    test("clicking theme toggle button calls themeController.toggleTheme()", () => {
        const headerElement = new HeaderElement(
            $("#header"),
            "Test Project",
            themeController
        );

        headerElement.init();
        headerElement.activate();

        // Simulate button click
        $("#btn-theme-toggle").trigger('click');

        expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    test("theme toggle button toggles state when clicked", () => {
        const headerElement = new HeaderElement(
            $("#header"),
            "Test Project",
            themeController
        );

        headerElement.init();
        headerElement.activate();

        const themeButton = $("#btn-theme-toggle");
        
        // Initial state - button is on (dark mode)
        const initialState = themeButton.hasClass("nav-btn-on");
        expect(initialState).toBe(true);

        // Click to toggle - ButtonElement will toggle the class
        themeButton.trigger('click');
        const stateAfterFirstClick = themeButton.hasClass("nav-btn-on");
        // State should have toggled
        expect(stateAfterFirstClick).toBe(!initialState);

        // Click to toggle back
        themeButton.trigger('click');
        const stateAfterSecondClick = themeButton.hasClass("nav-btn-on");
        // Should be back to initial state
        expect(stateAfterSecondClick).toBe(initialState);
    });

    test("HeaderElement supports method chaining init().activate()", () => {
        const headerElement = new HeaderElement(
            $("#header"),
            "Test Project",
            themeController
        );

        // Should support chaining
        const result = headerElement.init().activate();

        expect(result).toBeUndefined(); // activate() returns void
        expect(headerElement.isActive()).toBe(true);
        expect($("#project-name").text()).toBe("Test Project");
    });

    test("HeaderElement with empty project name", () => {
        const headerElement = new HeaderElement(
            $("#header"),
            "",
            themeController
        );

        headerElement.init();

        expect($("#project-name").text()).toBe("");
    });

    test("HeaderElement with special characters in project name", () => {
        const projectName = "Test <Project> & \"Quotes\"";
        const headerElement = new HeaderElement(
            $("#header"),
            projectName,
            themeController
        );

        headerElement.init();

        // jQuery .text() should properly escape HTML entities
        expect($("#project-name").text()).toBe(projectName);
    });

    test("multiple theme toggle clicks call themeController multiple times", () => {
        const headerElement = new HeaderElement(
            $("#header"),
            "Test Project",
            themeController
        );

        headerElement.init();
        headerElement.activate();

        // Click three times
        $("#btn-theme-toggle").trigger('click');
        $("#btn-theme-toggle").trigger('click');
        $("#btn-theme-toggle").trigger('click');

        expect(mockToggleTheme).toHaveBeenCalledTimes(3);
    });

    test("deactivated header does not respond to button clicks", () => {
        const headerElement = new HeaderElement(
            $("#header"),
            "Test Project",
            themeController
        );

        headerElement.init();
        headerElement.activate();
        headerElement.deactivate();

        // Click should not trigger theme toggle
        $("#btn-theme-toggle").trigger('click');

        // Should not be called because button is disabled
        expect(mockToggleTheme).toHaveBeenCalledTimes(0);
    });

    test("HeaderElement handles missing header element gracefully", () => {
        body.empty();
        
        const headerElement = new HeaderElement(
            $("#non-existent-header"),
            "Test Project",
            themeController
        );

        // Should not throw
        expect(() => headerElement.init()).not.toThrow();
    });
});
