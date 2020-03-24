# webcrack
## a build tool based on redux and reselect

### About
#### What is webcrack?

webcrack is a build tool that watches file, processes them, and then outputs them.

#### What is webcrack NOT?

webcrack is _not_ webpack. It does not build JS bundles.

webcrack is _not_ grunt or gulp. It is not a task runner.

webcrack is _not necessarily_ for web development. It has a much broader use-case.

#### What *does* webcrack do?

1. Ingests some files
2. Store these files in a redux store
3. Process said store with reselect selectors to produce a new set of files
4. Write those files
5. Optionally watch for changes to FS then GOTO step 1

#### What webcrack *can do*

- webcrack can replace your flavor-of-the-week State Site Generator with a hackable and light-weight alternative
- webcrack can replace some of the things the grunt or gulp
- webcrack can functional and effeciently watch files for changes, process them, then write them back to the filesystem

#### What webcrack *can't do*

- webcrack can't use any tools outside the NPM universe
- webcrack can't invoke other programs
- webcrack can't perform impure, non-functional tasks

#### Should I use webcrack?

Only if you understand typescript, immutability, redux and selectors. Luckily, these concepts are not that difficult to learn!

### webcrack.config.js

webcrack is configured with webpack.config.js. It has 2 sections of note

#### inputs
`inputs` is a list of configurations which define which files get read and where to store those results in the redux stores

#### outputs
`outputs` is a function which acceptan object of selectors, keyed by inputs. These selectors are connected to the redux state and you can use it to handle changes to the redux state, which itself is reacting to changes in the filesystem. This function returns hash object, where the keys are files to write, and the values are the contents of those files.

### selectors
At the heart of webcrack is the selector. Within the `ouputs` function, you can define any selectors you like, using any JS library you want, provided they are _purely functional_. This means that webcrack needs no community plugins and can be made to do complex logic cleanly
