# <img src="src/main/resources/openfasttrace_logo.svg" alt="OFT logo" width="150"/> OpenFastTrace UX

## What is OpenFastTrace UX?

OpenFastTrace UX (short OFT-UX) is an extension of the [OpenFastTrace](https://github.com/itsallcode/openfasttrace)
requirement tracing software. It aims to provide a more advanced, user friendly HTML user interface to analyze
OpenFstTrace
tracing reports.

## Status

OFT-U at this moment is a proof f concept study on how to design a powerful use interface to analyze requirement traces.
It provides advanced filtering and navigation capabilities to quickly browse through requirements and other traceable
artifacts in order to find gaps in the tracing change or just to find necessary documents identifiable by te tracing
chain.

The project is in an early stage using a random generated tree of requirements, architecture, tests without connection
to the output of OpenFastTrace itself.

Only parts of the UI have already been realized.

## Project Information

[![Build](https://github.com/itsallcode/openfasttrace/actions/workflows/build.yml/badge.svg)](https://github.com/itsallcode/openfasttrace/actions/workflows/build.yml)

This project at the moment is a pure HTML application developed with HTML, SCSS and Typescript. The software is
built via [Webpack](https://webpack.js.org/) which builds a HTML page including CSS and Javascript. To build the
application you need to have [npm](https://github.com/nvm-sh/nvm) installed on your system.

```bash
$ npm install
$ npm run build
$ npm run test
```

## Contact

* [Bernd (Poldi) Haberstumpf <poldi@thatswing.de>](mailto:poldi@thatswing.de)