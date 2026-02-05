/*
OpenFastTrace UX

Copyright (C) 2024-2025 itsallcode.org, Bernd Haberstumpf

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public
License along with this program. If not, see
<http://www.gnu.org/licenses/gpl-3.0.html>.
*/
# OFT UX Design

OFT UX is a HTML frontend that allows to browse requirements traces traced by OpenFastTrace. OFT UX aims to replace the
standard OFT HTML reporter providing a more advanced user experience. OFT UX concepts are inspired by the HTML frontend
of ReqMgrNG.

## Component breakdown

<img src="resources/oft_ux_components.drawio.svg" alt="OFT UX Components"/>

OFT UX is composed out of two major parts:

* OFT UX reporter: A OFT plugin providing a OFT reporter that generates the tracing input for the OFT UX UI
* OFT UX Frontend: a OFT trace specific bundle composed out of HTML, CSS and JS that can be opened by a HTML Browser
  directly via the file system.

The OFT UX Frontend is composed out of a static and trace run specific parts:

* OFT UX UI: A static HTML/CSS/JS page that renders the UI based on the tracing input
* SpecObject data: The OFT UX reporter generates, based on the OFT tracing report a list of specojects
  with relevant meta-data.
* Tracing Meta Data: The SpecObject Data is accompanied by a configuration for filters, statistic data etc.

## Story board

This chapter details the planned OFT Frontend UI. The UI is a single page application with a single HTML page layout
similar to that of an IDE like VSCode or IntelliJ.

<img src="resources/main_ui.drawio.svg" alt="OFT Main UI"/>

The main UI is composed out of the following parts:

* Titlebar: contains a logo, the project name of the trace, a button to hide all side bars and maybe other buttons.
* SpecObject table: This is the main UI element. It contains a list of all traced specobjects that are not filtered out
  by the filters on the right, the Source File Tree or a search box.
* SpecObject Details: Shows meta-data like filename, line number, tags, etc. of the specobject selected in the
  SpecObject Table.
* Source File Tree sidebar: The sidebar to the lest provides a tree of the source files from which the specobjects had
  been imported. The tree serves as a navigation aid.
* Filters: A List of filters like specobject type, uncovered types, tags that allows to filter out specobjects in the
  SpecObject table.
* History: The UI supports a back and forward between the last selections and filter changes. The History view aims to
  provide the navigation history.
* Statusbar: Provides statistics about the traced data.


  

