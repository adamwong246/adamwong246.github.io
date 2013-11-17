---
layout: post
title:  "Castle Shuri aka dotfiles"
date:   2013-11-13 09:21:52
categories: toys
---

Dotfiles are important fundamental to any unix-like system. Dotfiles are usually prepended with a dot but not necessarily- dot files are really *any* configuration file for any application. You're probably most familiar with your .bashrc and .vimrc files.  By managing these files properly, you can really customize your experience. Too bad, then, that dotfiles have been somewhat neglected. My dotfiles were always messy, haphazard and disorganized and they were different between my mac and my 2 ubuntu machines. Confusion abounded. Clearly, there's room for improvement.

I've noticed a trend on github- managing configuration files via git. Here's the [primer on the subject][dotfiles.github] but be forewarned- there are many paths to choose from. I decided to go with [Homesick][homesick.github] and it works like this: Homesick manages git repositories, called "Castles" which are collections of configurations. It's a very thin interface over git but it works very well. Once you have cloned a Castle, Homesick will symlink all the files into place. Any modifications you make to these files can be committed to the repo- it's just plain old git after all! (Did I mention I love git?!) Now your configuration files are as well maintained as my code. You can even maintain separate branches for separate environments!

Be careful! Though the rationale for the whole exercise is backing up your configurations, I accidentally clobered my files before I got the hang of it. Here's a tip: use the Homesick commands when you can, not git because Homesick performs some magic when tracking files that aren't in the Home directory. Also be careful not to commit sensitive data.

Ok, that' enough for now. I'll leave you with [my dotfiles, which I call Castle Shuri][castle-shuri.github]


[dotfiles.github]: http://dotfiles.github.io
[homesick.github]: https://github.com/technicalpickles/homesick
[castle-shuri.github]: https://github.com/adamwong246/Castle-Shuri/