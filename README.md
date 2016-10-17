# [jQuery asHoverScroll](https://github.com/amazingSurge/jquery-asHoverScroll) ![bower][bower-image] [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![prs-welcome]](#contributing)

> A jquery plugin helps scroll the list that is larger than its container. 

## Table of contents
- [Main files](#main-files)
- [Quick start](#quick-start)
- [Requirements](#requirements)
- [Usage](#usage)
- [Examples](#examples)
- [Options](#options)
- [Methods](#methods)
- [Events](#events)
- [No conflict](#no-conflict)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [Development](#development)
- [Changelog](#changelog)
- [Copyright and license](#copyright-and-license)

## Main files
```
dist/
├── jquery-asHoverScroll.js
├── jquery-asHoverScroll.es.js
└── jquery-asHoverScroll.min.js
```

## Quick start
Several quick start options are available:
#### Download the latest build

 * [Development](https://raw.githubusercontent.com/amazingSurge/jquery-asHoverScroll/master/dist/jquery-asHoverScroll.js) - unminified
 * [Production](https://raw.githubusercontent.com/amazingSurge/jquery-asHoverScroll/master/dist/jquery-asHoverScroll.min.js) - minified

#### Install From Bower
```sh
bower install jquery-asHoverScroll --save
```

#### Install From Npm
```sh
npm install jquery-asHoverScroll --save
```

#### Install From Yarn
```sh
yarn add jquery-asHoverScroll
```

#### Build From Source
If you want build from source:

```sh
git clone git@github.com:amazingSurge/jquery-asHoverScroll.git
cd jquery-asHoverScroll
npm install
npm install -g gulp-cli babel-cli
gulp build
```

Done!

## Requirements
`jquery-asHoverScroll` requires the latest version of [`jQuery`](https://jquery.com/download/).

## Usage
#### Including files:

```html
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery-asHoverScroll.js"></script>
```

#### Required HTML structure

```html
<div class="example">
  <ul>
    <li></li>
    <li></li>
  </ul>
</div>
```

#### Initialization
All you need to do is call the plugin on the element:

```javascript
jQuery(function($) {
  $('.example').asHoverScroll(); 
});
```

## Examples
There are some example usages that you can look at to get started. They can be found in the
[examples folder](https://github.com/amazingSurge/jquery-asHoverScroll/tree/master/examples).

## Options
`jquery-asHoverScroll` can accept an options object to alter the way it behaves. You can see the default options by call `$.asHoverScroll.setDefaults()`. The structure of an options object is as follows:

```
{
  namespace: 'asHoverScroll',

  list: '> ul',
  item: '> li',
  exception: null,

  direction: 'vertical',
  fixed: false,

  mouseMove: true,
  touchScroll: true,
  pointerScroll: true,

  useCssTransforms: true,
  useCssTransforms3d: true,
  boundary: 10,

  throttle: 20,

  // callbacks
  onEnter() {
    $(this).siblings().removeClass('is-active');
    $(this).addClass('is-active');
  },
  onLeave() {
    $(this).removeClass('is-active');
  }
}
```

## Methods
Methods are called on asHoverScroll instances through the asHoverScroll method itself.
You can also save the instances to variable for further use.

```javascript
// call directly
$().asHoverScroll('enable');

// or
var api = $().data('asHoverScroll');
api.enable();
```

#### enable()
Enable the hoverscroll functions.
```javascript
$().asHoverScroll('enable');
```

#### disable()
Disable the hoverscroll functions.
```javascript
$().asHoverScroll('disable');
```

#### destroy()
Destroy the hoverscroll instance.
```javascript
$().asHoverScroll('destroy');
```

## Events
`jquery-asHoverScroll` provides custom events for the plugin’s unique actions. 

```javascript
$('.the-element').on('asHoverScroll::ready', function (e) {
  // on instance ready
});

```

Event   | Description
------- | -----------
init    | Fires when the instance is setup for the first time.
ready   | Fires when the instance is ready for API use.
enable  | Fired when the `enable` instance method has been called.
disable | Fired when the `disable` instance method has been called.
destroy | Fires when an instance is destroyed. 

## No conflict
If you have to use other plugin with the same namespace, just call the `$.asHoverScroll.noConflict` method to revert to it.

```html
<script src="other-plugin.js"></script>
<script src="jquery-asHoverScroll.js"></script>
<script>
  $.asHoverScroll.noConflict();
  // Code that uses other plugin's "$().asHoverScroll" can follow here.
</script>
```

## Browser support

Tested on all major browsers.

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari_32x32.png" alt="Safari"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/chrome/chrome_32x32.png" alt="Chrome"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/firefox/firefox_32x32.png" alt="Firefox"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/edge/edge_32x32.png" alt="Edge"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer/internet-explorer_32x32.png" alt="IE"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/opera/opera_32x32.png" alt="Opera"> |
|:--:|:--:|:--:|:--:|:--:|:--:|
| Latest ✓ | Latest ✓ | Latest ✓ | Latest ✓ | 9-11 ✓ | Latest ✓ |

As a jQuery plugin, you also need to see the [jQuery Browser Support](http://jquery.com/browser-support/).

## Contributing
Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md). Make sure you're using the latest version of `jquery-asHoverScroll` before submitting an issue. There are several ways to help out:

* [Bug reports](CONTRIBUTING.md#bug-reports)
* [Feature requests](CONTRIBUTING.md#feature-requests)
* [Pull requests](CONTRIBUTING.md#pull-requests)
* Write test cases for open bug issues
* Contribute to the documentation

## Development
`jquery-asHoverScroll` is built modularly and uses Gulp as a build system to build its distributable files. To install the necessary dependencies for the build system, please run:

```sh
npm install -g gulp
npm install -g babel-cli
npm install
```

Then you can generate new distributable files from the sources, using:
```
gulp build
```

More gulp tasks can be found [here](CONTRIBUTING.md#available-tasks).

## Changelog
To see the list of recent changes, see [Releases section](https://github.com/amazingSurge/jquery-asHoverScroll/releases).

## Copyright and license
Copyright (C) 2016 amazingSurge.

Licensed under [the LGPL license](LICENSE).

[⬆ back to top](#table-of-contents)

[bower-image]: https://img.shields.io/bower/v/jquery-asHoverScroll.svg?style=flat
[bower-link]: https://david-dm.org/amazingSurge/jquery-asHoverScroll/dev-status.svg
[npm-image]: https://badge.fury.io/js/jquery-asHoverScroll.svg?style=flat
[npm-url]: https://npmjs.org/package/jquery-asHoverScroll
[license]: https://img.shields.io/npm/l/jquery-asHoverScroll.svg?style=flat
[prs-welcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[daviddm-image]: https://david-dm.org/amazingSurge/jquery-asHoverScroll.svg?style=flat
[daviddm-url]: https://david-dm.org/amazingSurge/jquery-asHoverScroll


