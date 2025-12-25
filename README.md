# <img src="src/main/resources/images/openfasttrace_logo.svg" alt="OFT logo" width="150"/> OpenFastTrace UX [MVP]

## What is OpenFastTrace UX?

OpenFastTrace UX (short OFT-UX) is an extension of the [OpenFastTrace](https://github.com/itsallcode/openfasttrace)
requirement tracing software. It aims to provide a interactive requirement, user friendly HTML user interface to analyze
OpenFstTrace tracing reports locally.

## Status

This first version of OpenFastTrace UX is a minimal viable product (MVP) version as a proof of the concept 
of a powerful use interface to analyze requirement traces.  It provides advanced filtering and navigation capabilities 
to quickly browse through requirements and other traceable artifacts in order to find gaps in the tracing change 
or just to find necessary documents identifiable by te tracing chain.

In combination with a new version of [OpenFastTrace](https://github.com/itsallcode/openfasttrace/pull/446) and
[OpenFastTrace Gradle Plugin](https://github.com/itsallcode/openfasttrace-gradle/pull/49) a imeediately usable
trace browser can be generated for the current project.

## Project Information

[![Build](https://github.com/poldi2015/openfasttrace-ux/actions/workflows/webpack.yml/badge.svg)](https://github.com/poldi2015/openfasttrace-ux/actions/workflows/webpack.yml)

This project at the moment is a pure HTML application developed with HTML, SCSS and Typescript.

# <img src="doc/resources/oft_ux_screenshot.png" alt="OFT UX"/>

## Playground

Openfasttrace UX provides a playground to try out the user interface with sample data:

[OpenFastTrace UX playground](https://poldi2015.github.io/openfasttrace-ux/)

## Features

### Tracing tool

* &cross; **OFT reporter plugin**: Extension of the list of supported reporters for OFT.

### User Interface

* &check; **Titlebar**: Titlebar on top with project title and global buttons.
* &check; **Statusbar**: Statusbar at the bottom with statistics.
* &check; **Filter Sidebar**: Sidebar with filters, SpecObject table view specific.
* &check; **SpecObject table**: Table as main UI element that lists all non-filtered SpecObjects.
* &check; **SpecObject coverage overview**: Badges for missing deep coverage.
* &check; **Focus SpecObject**: Pin a SpecObject with double click to the top and show only SpecObjects that are covered
  by the SpecObject or SpecObject that the SpecObject covers. Own Filter selection for this view.
* &check; **Tree View**: Treeview grouping SpecObjects by name.
* &cross; **Details view**: View with details of the selected SpecObject.
* ...

## Build OFT UX

The software is built via [Webpack](https://webpack.js.org/) which builds a HTML page including CSS and Javascript.
To build the application you need to have [npm](https://github.com/nvm-sh/nvm) installed on your system.

```bash
$ npm install
$ npm run build
$ npm run test
```

## Contact

* [Bernd (Poldi) Haberstumpf <poldi@thatswing.de>](mailto:poldi@thatswing.de)
