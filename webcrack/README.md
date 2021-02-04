# webcrack
## a build tool based on redux and reselect

### About
#### *What* is webcrack?

Webcrack is a build tool that watches file, processes them, and then outputs them.

#### What is webcrack *not*?

Webcrack is _not_ webpack. It does not build JS bundles. (Thought it could help you do so!)

Webcrack is _not_ grunt or gulp. It is not a task runner. It is a file-processor.

Webcrack is _not necessarily_ for web development. It has a much broader use-case.

#### What *is* webcrack and why should I use it?

Webcrack is a functional file processor. It lets you manipulate files in a *functional* way- using redux selectors- and it does so efficiently- using promises. **It lets you focus on the logic of your selectors and disregard the processing of files**. You setup in some files to read, some files to write, and some selectors filled with easily testable logic- Webcrack will handle the borings parts for you!

#### What *does* webcrack do?

1. Ingests some files
2. Store these files in a redux store
3. Run an enormous selector to figure out which files have changed.
4. Write those changes to file.
5. Optionally watch for changes to FS then GOTO step 1

#### What webcrack *can do*

- webcrack can replace your flavor-of-the-week State Site Generator with a hackable and light-weight alternative
- webcrack can replace some of the things the grunt or gulp
- webcrack can functional and efficiently watch files for changes, process them, then write them back to the filesystem

#### What webcrack *can't do*

- webcrack can't use any tools outside the NPM universe
- webcrack can't invoke other programs
- webcrack can't perform impure, non-functional tasks

#### Should I use webcrack?

Only if you understand redux and selectors. Luckily, these concepts are not that difficult to learn!

### webcrack.config.js

webcrack is configured with webpack.config.js. It has 2 sections of note

#### inputs
`inputs` is a list of configurations defining which files get read and where to store those results in the redux stores

#### outputs
`outputs` is a function which accepts object of selectors, keyed by inputs. These selectors are connected to the redux state and you can use it to handle changes to the redux state, which itself is reacting to changes in the filesystem. This function returns hash object, where the keys are files to write, and the values are the contents of those files.

### selectors
At the heart of webcrack is the selector. Within the `outputs` function, you can define any selectors you like, using any JS library you want, provided they are _purely functional_. This means that webcrack needs no community plugins and can be made to do complex logic cleanly.
