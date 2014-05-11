---
title: re-write
author: me
date: 2014-05-10 15:00
template: article.jade
---

I'm pleased to debut my *new* blog, which is made with Grunt and Wintersmith, as opposed to Middleman. I've decided for a while now that I want to move away from Ruby and do more Javascript. So lets talk about how I made the migration. 

I think it's helpful, firstly, to understand the analogy between my old site and the new. 

| Software              | Old       | New         |
| --------------------- | --------- | ----------- |
| language              | Ruby      | JS          |
| package manager       | Bundle    | Npm         |
| make tool             | Rake      | Grunt       |
| static site generator | Middleman | Wintersmith |
| template engine       | Slim      | Jade        |


#### from Ruby to Javascript

Ruby is nice and all- it's my daily craft after all. But I can't help but feel that Ruby (and Rails) is on the slow decline. There seems to me, an inevitable destiny that JS will rule the world. But I find that with Javascript comes a lot of extra baggage in my code. Ruby gets right to the point with it's sweet DSL's but with Javascript usually has a more distracting bits. It's nearly as nice as Ruby, but it is ultimately more flexible and can be made into a much more pleasant language with extensions such as underscore.js. 

#### from Bundle to Npm
Not much to say here. Just some slightly difference commands to learn. 

#### from Rake to Grunt
Rake and Grunt are very different. Grunt seems more "focused" than Rake- Rake is fundamentally script whereas Grunt is fundamentally configuration. Grunt definetly lays down rails for you to make things easy where Rake is just a thin layer between you and some Ruby. I like Grunt a lot and, truth be told, I never really liked Rake to begin with. 

#### from Middleman to Wintersmith
This was the hardest tool to pick but I'm *loving* wintersmith. It takes a bunch of files, some configurations and plugins and outputs a website. I started with something like Jekyll but frankly, Jekyll was way to restrictive for me, which was why I switched to Middleman. Heckle would be the JS equivelant to Jeckle but like I said, I was looking for something more robust than a straight blog generator. Wintersmith also lets you embed code right in your html which I think is very cool. I really don't understand the appeal of logic-less html. Sure, keep you business logic in the model but a view can have it's own logic. And the ability to call upon the entirety of Javascript right in your html is just too tempting!

#### from Slim to Jade
Slim as another of my favorite Ruby pieces and I'm glad an equivelant exist in the JS world. Jade is is just groovy- real JS mixed with minimal html markup. Just remember that in contrast to Haml, you must escape the content of your html.