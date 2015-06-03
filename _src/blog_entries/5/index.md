---
title: "Meteor: the first month"
publishedAt: Sat Mar 21 2015 08:49:37 GMT-0700 (PDT)
---

There's an exciting new stack for optimistic developers called Meteor and I've had the great pleasure of focusing on learning it for the past months. This is what I've learned.

Meteor is framework based on the high-minded ideal of *isomorphic* javascript, which is a fancy way of saying, "It's javascript, on the server too!" I find this notion absolutely titilating, though I'm sure other's are heaving at the very thought. Ok, that's fair. But give it a chance! It's an incredibly flexible technology and with a little bit of experience, you'll find that Meteor is a fantastic tool for building prototypes which evolve into mature software. Meteor is production ready and the time to dive in is now!

## The basics

### Meteor is not like Rails.

I'm a RoR guy. I bet if you are reading this, there's a good chance that you cut your teeth on Rails. **Forget all of it.**

Meteor does not use HTTP to communicate between the server and client. Rather, it uses Websockets and the Distributed Data Protocol (DDP) to create magical, reactive variables which map Mongo documents to the view.

Meteor uses Collections to store individual documents but by publishing and subscribing to other collections over DDP. This feels weird, at first, but it's actually quite natural.

The server publishes some orders

```

Meteor.publish 'validOrders' ->
 Orders.find {'valid': true}, {userId: 0}


Meteor.publish 'myOrders' ->
 Orders.find {'userId': Meteor.userId()}

```

and the client subscribes
```
Meteor.subscribe 'orders'
Meteor.subscribe 'myOrders'
```

Hence, the client *has access* to a subset of all Order documents. You can even limit not just a set documents, but rather whitelist and blacklist certain attributes. This is an important distinction. The client now has access to

- Orders of which "belong" to said users
- Orders which are valid but not the userId fields

And this subscription is now reactive and those order directly map to HTML through you handlebars templates. And the client is usually requesting a subset of records based on a query.

```
Template.example.helpers
 orders: ->
  Orders.find({active: true})
```

Therefore, the documents which are shared are the overlap between these 2 subsets- those published by the server and those queried from a helper.

Of course, if you are a beginner, you've got the autopublish package installed and every document is simply available to the client. That's fine for now but don't leave it in your app forever.

A similar package to look out for is the `insecure` which allows the "client to write to the database". It think this is a bit of a mischaracterization, because the client can't ever "write to the database", only call Meteor Methods. The `insecure` package simply implement this niavely- you'l want your version of the same methods to have more security

Overall, the impression upon me is very different from Rails. Rails is about strict separation of logic and view, with a controller to handle the details of http. Meteor is less "opinionated" but it forces you to deal more directly with details in a less abstract way. You need to understand the underlying technology, rather than Rails's curated DSL's. Out of the box, Meteor enforces no MVP, though you *could* implement such. Be careful, because without those rails, it's easy to tangle your logic and your implementation!

### Meteor is backed by a mongo db and loves JSON
Adios SQL! I've personally always despised SQL. I *get* it, sort of, but it never felt natural. Mongo is a breath of fresh air. Not only is every document a plain JSON object, queries are also JSON. Yes, you can have a schema, if you want. Yes, migrations are an real consideration and you have to manage joins yourself.

### Meteor requires **yet another** package manger.
It is, however, a very nice and necessary.

### It uses a lot of RAM
But RAM is cheap, so it's not a big deal most of the time.

### But it's still just js
Let's face facts: node's asynchronous support is overhyped. Sure, it powerful but the community is fragmented on how to support asynchronous operations. Promises, threads, futures, generators, etc are absolutely overwhelming and bewildering. Meteor does it's best to shield you from these concerns but you'll still have to tackle these complex issues at some point.
