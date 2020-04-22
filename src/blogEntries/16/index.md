---
title: Upgrading my resume with Puppeteer
publishedAt: Wed Apr 22 2020 14:51:34 GMT-0700 (Pacific Daylight Time)
---

Hitherto, I have been generating the PDF version of my resume with [markdown-pdf](https://www.npmjs.com/package/markdown-pdf). However, it left a lot to be desired- I was not able to inject raw CSS and thus the node module to did not fit well into webcrack. Therefore, I have replaced it with puppeteer, the results of which can be seen on [this git commit](https://github.com/adamwong246/adamwong246.github.io/commit/5131655d263e33395cb93641652bee2a65046274).

Of note is [the following lines](https://github.com/adamwong246/adamwong246.github.io/commit/5131655d263e33395cb93641652bee2a65046274). Notice how pupeeter insists on writing a file, it also returns a buffer. So I simply discard pupeeter's file to `/dev/null` and write the buffer to the filesystem myself.

I also took the chance to clear out some older work history so that it fits nicely on one page.
