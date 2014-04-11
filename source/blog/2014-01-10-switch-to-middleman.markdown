---
date: 2014-01-10
title:  'Switch to Middleman'
tags: posts
---

I finally made the switch to middleman. Jekyll was far too restrictive for my purposes, though I appreciate it's simplicity. If you need to get a blog up in 10 minutes, that's awesome. If you just want to generate content, even better. Jekyll will suit you fine. But I needed and wanted something more powerful. Jekyll is hobbled by the choice of liquid templating. Sure, it keeps it simple but liquid templating was not made for this task. Liquid templating should be used when you want to execute *user* written templates. The logic is restrictive is to keep you, the executor of said code, safe and for the same reason you'd never eval some user submitted code. But in this use case, *I* am the user. I can trust my own code. Which leads me to... I want to use Slim. I *love* Slim.  it's faster and less verbose than haml AND it has embedded markdown languages. And by ditching Liquid, you get complete control. Write any ruby code, in any templating and/or markdown language you choose! 

Middleman also has one more huge advantage: you can build any website with Middleman, while Jekyll is pretty much only designed to be blog. Like I said before, that simplicity is great for some but by investing a little time with Middleman, you won't ever write raw HTML ever again, for any project. I know I won't! 

Middleman updates each page individually and quite seamlessly. Jekyll was really slow in this regard but Middleman updates a page just as fast as I can save the document I'm working on and switching to the browser. It even reloads the page!

The switch was a piece of cake. I had to simply copy the files into another branch of the repo, update the rakefile and that was pretty much it. 