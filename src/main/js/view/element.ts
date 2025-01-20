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
/**
 * GUI Elements that follow the UI lifecycle init -> activate -> deactivate
 */
export interface IElement {
    /**
     * Builds the UI.
     */
    init(): IElement;

    /**
     * Enable theelement, ready to be used in the UI.
     */
    activate(): void;

    /**
     * Deactivates the element, making it unavailable in the UI.
     */
    deactivate(): void;

    /**
     * @returns true if the element is active.
     */
    isActive(): boolean;

} // IElement