---
layout: post
title: Order imports in React application
date: 2020-04-27
---

Have you ever seen a huge import block like this:

```javascript
import React, {useState, useRef} from 'react';
import ModuleA from 'my-own-module-A';
import ModuleB, {SubModuleB} from 'my-own-module-B';
import PropTypes from 'prop-types';
import styled, {css} from 'styled-components';
import {connect} from 'react-redux';
import ComponentC from 'components/component-c';
import ComponentD from 'components/component-d';
import ComponentE from 'components/component-e';
import ComponentF from 'components/component-f';
import ComponentG from 'components/component-g';
import ComponentH from 'components/component-h';
import ComponentI from 'components/component-i';
import ComponentK from 'components/component-k';
```

Have you ever think those imports can be ordered/organized beautifully based on their characteristics?
Today, I'll introduce you 2 packages from npm that help you orders your *imports* statement

- The first one is [`import-sort-cli`](https://github.com/renke/import-sort) comes from [renke](https://github.com/renke). This package allows you to order imports follow multiple styles. For more detail about formats and options, you can checkouts at [Using a different style or parser](https://github.com/renke/import-sort#using-a-different-style-or-parser) in his repo.

- The second one is [`import-sort-style-react`](https://github.com/teamable-software/import-sort/tree/master/packages/import-sort-style-react) from [`teamable-software`](https://github.com/teamable-software), which is a custom plugin for [import-sort](https://github.com/renke/import-sort) with custom matchers allows us order imports follow react style. It's look like this:

```javascript
// Absolute modules with side effects (not sorted because order may matter)
import "a";
import "c";
import "b";

// Relative modules with side effects (not sorted because order may matter)
import "./a";
import "./c";
import "./b";

// Modules from the React ecosystem (react, prop-types, redux modules) library sorted by name
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// Modules from the Node.js "standard" library sorted by name
import {readFile, writeFile} from "fs";
import * as path from "path";

// Third-party modules sorted by name
import aa from "aa";
import bb from "bb";
import cc from "cc";

// First-party modules sorted by "relative depth" and then by name
import aaa from "../../aaa";
import bbb from "../../bbb";
import aaaa from "../aaaa";
import bbbb from "../bbbb";
import aaaaa from "./aaaaa";
import bbbbb from "./bbbbb";

// First-party styles modules sorted by "relative depth" and then by name
import styles from "./Component.scss";
```

Now! Let begins

#### Step 1: Install packages

Run follow in commands

```
npm install --save-dev import-sort-style-react import-sort-cli
```

or
```
yarn add -D import-sort-style-react import-sort-cli
```

#### Step 2: Configure

To run this, we need to add a script to `npm scripts`:

```json
{
  "scripts": {
    "sort-imports": "./node_modules/import-sort-cli/lib/index.js --write ./src/**/*.js"
  }
}
```

At this point, the `import-sort-cli` will order imports all `.js` files in your `src` with its default config `eslint`. If you want to run this with `react` style. You need one 1 step

#### Step 3: Tell import-sort-cli run with React style
You need to add this `property` in you `package.json`

```json
{
  "scripts": {
    "sort-imports": "./node_modules/import-sort-cli/lib/index.js --write ./src/**/*.js"
  },
  "importSort": {
    ".js": {
      "style": "react"
    }
  }
}
```

Tadaaaaaaaaaaaaaaah. It's done. Now, let format a huge import block:


```javascript
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import styled, { css } from 'styled-components';

import ComponentC from 'components/component-c';
import ComponentD from 'components/component-d';
import ComponentE from 'components/component-e';
import ComponentF from 'components/component-f';
import ComponentG from 'components/component-g';
import ComponentH from 'components/component-h';
import ComponentI from 'components/component-i';
import ComponentK from 'components/component-k';
import ModuleA from 'my-own-module-A';
import ModuleB, { SubModuleB } from 'my-own-module-B';
```

Happy coding!!! 😉
