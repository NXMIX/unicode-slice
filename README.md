# unicode-slice

[![Build Status](https://travis-ci.org/NXMIX/unicode-slice.svg?branch=master)](https://travis-ci.org/NXMIX/unicode-slice)
[![Coverage Status](https://coveralls.io/repos/github/NXMIX/unicode-slice/badge.svg)](https://coveralls.io/github/NXMIX/unicode-slice)
[![npm](https://img.shields.io/npm/v/unicode-slice.svg?maxAge=1000)](https://www.npmjs.com/package/unicode-slice/)

> Slice a unicode string by it's visual width

### Install

`npm i @nxmix/emoji-seq-match --save`

[Typescript](https://www.typescriptlang.org) definition file is already included.

### EXAMPLES

```js
const slice = require('@nxmix/unicode-slice').default;

// String.prototype.slice
"👶🏽".slice(0, 1);
//=>'�'

// Deal with emoji skin-tone modifer as one character
slice("👶" + "🏽", 0, 1);
//=> 👶🏽

// Won't separate emoji family :)
slice("👩‍👩‍👦‍👦", 0, 1);
//=> 👩‍👩‍👦‍👦

// Ansi color is preserved
slice("12" + chalk.red("34") + "56", 1, 5);
//=> 2\u001b[31m34\u001b[39m5
```

Using ES2015w Modules:

```ts
import slice from '@nxmix/unicode-slice';

slice('👶🏽', 0, 1);
```

## Author

[Rong Shen](https://github.com/jacobbubu)
