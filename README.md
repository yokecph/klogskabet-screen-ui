# Klogskabet CMS
Copyright 2018 YOKE ApS. GPLv3 licensed.

## Description
Web-based touchscreen UIs for Klogskabet.

### Overview
Klogskabet was commissioned by Ballerup Bibliotekerne (Ballerup public libraries). It's a set of physical installations that can be used by the library to present different themes to the library-going audience, i.e. a flexible exhibition platform. The exhibitions are primarily intended to highlight the breadth and depth of digitally accessible content that Danish libraries offer.

This project contains a web-based interface for 4 different content types, which can be displayed on Klogskabet's screen modules.

## Requirements
- Node.js and npm

## Development
Clone the repository and run `bin/setup`. First time through, it'll copy some example configuration files. Edit these, and run setup again to complete database setup.

### gulp commands
This project uses `gulp` to automate builds. The following commands are available:

- `gulp build`: Compile JavaScript and SASS sources into `public/{js,sass}`
- `gulp watch`: Compile JavaScript and SASS sources into `public/{js,sass}` and continue to watch for changes to source files
- `gulp js`: Compile JavaScript sources into `public/js`
- `gulp js:watch`: Compile JavaScript sources into `public/js` and continue to watch for changes to source files
- `gulp sass`: Compile SASS sources into `public/sass`
- `gulp sass:watch`: Compile SASS sources into `public/sass` and continue to watch for changes to source files

## Deployment
The code is aimed specifically at Firefox for Android (version 57.0.1 at the time of Klogskabet's installation).

The choice of Firefox is due to its large number of configurable options, chief among them the option to allow code to force Firefox into fullscreen mode without it being based on user interaction (this option **must** be set in Firefox's configuration options).

A setup guide for iDisplay devices and Firefox can be found [here](https://github.com/yokecph/klogskabet-module-construction/wiki).

### A note on fonts
This project uses the GT Pressura Mono font from Grilli Type. This is a commerically available font, which must be [licensed from Grilli Type for use on a website](https://www.grillitype.com/typeface/gt-pressura). (YOKE retains a license for the server currently hosting this project; a new web license is only required if hosting changes.)

Since it's a non-free font, the font files are *not* included in this repository, but must be added manually once licensed. The font's files *must not* be committed to the repository.

And empty folder is included in this repo (`public/fonts/GTPressura/`), where the font files should be installed.

For development purposes, the font Bitstream Vera Sans Mono (a free and open source alternate font) is included and used as a fallback, if GT Pressura is not present.

See the license for Bitstream Vera Sans Mono in the font's folder (`public/fonts/BitstreamVeraSansMono/`).

## Testing
Due to the code's generally simple nature, but the greater need for the look and feel to be correct, testing should be done using the same hardware as is in Klogskabet. Firefox allows for remote debugging over WLAN, easing development.

## Committing
Adhere to the git-flow model: The `master` branch is for stable code only and should only be updated by the release or hotfix flows. Everything else should happen in the `develop` branch or `feature/*` branches as prescribed.

## License
GPLv3. See `COPYING`.
