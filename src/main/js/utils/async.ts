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
 * Allows to start a handler deferred.
 *
 * If the same {@link run} method is called again the previous request is canceled first.
 */
export class Deferred {
    constructor(private readonly timeOut: number) {
    }

    private timer: NodeJS.Timeout | null = null;

    public run(handler: () => void) {
        this.cancel();
        this.timer = setTimeout(() => {
            handler();
            this.cancel();
        }, this.timeOut);
    }

    public cancel(): void {
        if (this.timer != null) clearTimeout(this.timer!);
    }
} // Deferred