---
title: Hello Rust!
publishedAt: Sat Sep 03 2022 08:42:25 GMT-0700 (Pacific Daylight Time)
published: false
---

My friend Leif finally won me over. He had been evangelizing for quite some time about Rust and I had be hesitant to emmigrate from javscript land. I have invested so much in my javscript skill set. It's kept me fed for at least 10 years after all! But after seeing the Stack Overflow poll results, I could ignore it no longer, and I'm pleased to annouce that it's all true- Rust is a great. And here are some of my thoughts.

Installing and running Rust code was easy. A baby can wander in and start printing "hello world" in about 60 seconds. I appreciate that.

Rust handles the concept of pass-by-reference/pass-by-value nicely. In the JS world, whether a variable is passed by reference or value is unclear at best. In C/C++, there are memory pointers, though they cause endless trouble. In Rust, it's "referencing" `&` and "dereferencing" `*`. You won't mistakenly dereference a null pointer ever again!

Another pain point solved is immutability. Typescript helped impose immutability but this is a flimsy and expensive band-aid. I know less about the c++ world but it's difficult to imagine true immutability in a language with direct memory management... a question for greater minds than I. Happily, Rust implements these concepts with `mut` which will create a mutable variable. Otherwise, a variable is immutable by default. This is a genius level move- gently pushing the code in the direction torwards the functional and parallelizable (\*ahem "elegant"), while maintaing the capacity for low-level bitflipping when need be.

Thirdly, Rust has fantastic typing. C++ famously addded types to C as TS added types to JS, and they both worked, to a greater or lesser degree. Java's kafkaesque type system continues to traumatize freshmen CS students to this day!

Put these 3 things together and suddenly everything is different- you don't need to test your code. No, I don't mean you don't need tests. What I mean is this: The programmer can see from the status of the compilation that the code works, more or less, as it should. The number of ways your program can be is much fewer and this space just gets smaller and smaller- thats a good thing, btw!

Other things I like:

- Closures! In my experience, only JS got anonymous functions right and given it's failure to dinstinguish a synchronous vs asynchronous function, even that is debatable. Ruby ha similar concepts but they are muddled and clumsy. C++ and Java had no such concept at all until quite recently.
- It's fast! Did I mention it's almost as fast as C, maybe faster depending upon how bad your C programmer is.
