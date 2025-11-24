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
import {Log} from "@main/utils/log";

const STORAGE_KEY = 'oft-theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

export class ThemeController {
    private readonly log: Log = new Log("ThemeController");
    private currentTheme: string;

    constructor() {
        // Initialize with dark theme as default, or use stored preference
        const storedTheme = localStorage.getItem(STORAGE_KEY);
        this.currentTheme = storedTheme || THEME_DARK;
        this.log.info("Initial theme:", this.currentTheme);
    }

    public init(): ThemeController {
        this.applyTheme(this.currentTheme);
        return this;
    }

    public toggleTheme(): string {
        this.currentTheme = this.currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
        this.log.info("Toggling theme to:", this.currentTheme);
        this.applyTheme(this.currentTheme);
        localStorage.setItem(STORAGE_KEY, this.currentTheme);
        return this.currentTheme;
    }

    public isDarkMode(): boolean {
        return this.currentTheme === THEME_DARK;
    }

    public getCurrentTheme(): string {
        return this.currentTheme;
    }

    private applyTheme(theme: string): void {
        const root = document.documentElement;
        
        if (theme === THEME_DARK) {
            root.classList.remove('light-theme');
            root.classList.add('dark-theme');
        } else {
            root.classList.remove('dark-theme');
            root.classList.add('light-theme');
        }
        
        this.log.info("Applied theme:", theme);
    }
}
