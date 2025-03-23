---
title: Testeranto "features"
publishedAt: Sun Mar 23 2025 00:14:19 GMT-0700 (Pacific Daylight Time)
---

Testeranto is designed to integrate with other tools like Jira to connect "features" to your "tests". Each test can be tagged with a number of features, and these features can take multiple forms. 

### Feature as string

Features can be plain strings.

### Features as markdown document
You can store features internally as markdown files. 

### Features as URL
Testeranto tests can even reference Jira tickets, Github issues, anything that it can fetch. You'll need to configure this for your purposes. 

As part of the test-run process, the features associated with a test get compiled into the docs folder, where they can be referenced in the prompt. Why is this cool? It means that the AI not only understands your code, but your specifications too! 