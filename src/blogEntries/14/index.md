---
title: Introducing webcrack - the build tool you never wanted
publishedAt: Mon Mar 23 2020 12:12:43 GMT-0700 (Pacific Daylight Time)
---

webcrack is a thing I've been building on the side. It was inspired by webpack, but it's very different.

Whereas webpack is designed to make js bundles, webcrack is designed to make files. Put very simply, webcrack watches a series of files in a source folder, and when they change, pass those to Redux store, which is then pulled apart with Reselect selectors, and the changes are written back to a destination folder. The practical upshot of this is that you can abstract difficult logic into memoized selectors, without having to deal with dependencies and the annoyance of writing to the disk!

Webcrack isn't a task runner either, tho it can be used as one. It has a very broad use case and can be used anytime you need to process files in a complex way, provided you have a good understanding of Redux and Reselect.
