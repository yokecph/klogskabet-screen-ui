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

## Deployment
The code is aimed specifically at Firefox for Android (version 57.0.1 at the time of Klogskabet's installation).

The choice of Firefox is due to its large number of configurable options, chief among them the option to allow code to force Firefox into fullscreen mode without it being based on user interaction.

A setup guide for iDisplay devices can be found on the wiki.

## Testing
Due to the code's generally simple nature, but the greater need for the look and feel to be correct, testing should be done using the same hardware as is in Klogskabet. Firefox allows for remote debugging over WLAN, easing development.

## Committing
Adhere to the git-flow model: The `master` branch is for stable code only and should only be updated by the release or hotfix flows. Everything else should happen in the `develop` branch or `feature/*` branches as prescribed.

## License
GPLv3. See `COPYING`.
