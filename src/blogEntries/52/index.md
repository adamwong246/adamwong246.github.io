---
title: Give TDD a chance
publishedAt: Thu Mar 30 2023 10:05:03 GMT-0700 (Pacific Daylight Time)
---

A lot of ink has already been spilled on the subject of TDD and how, why, when, where and for what reasons the methodology ought and ought not be applied. Nonetheless, I'd like to compose my thoughts on the subject, because it is my humble opinion that TDD leads to a fundamentally better, happier place for software engineers. Note that I qualify that statement with "for software engineers"- managers, shareholders and spouses often have different priorities from those who are paid to press the buttons. But I myself am a coder. I like programming and I like to practice my craft well, effectively, but also kindly. Somewhat selfishly, I want to spend my working hours gracefully working the problem and that is not an unreasonable thing to want, given that we all spend decades at a time, laboring to enchant these infernal magic boxes to flip the right bits. 

# Tests > docs > gestalt > nothing

It is easy for programmers to be shortsighted by their early experience. We often begin our craft as loners, pecking out code in small side-projects. Most of these projects never go anywhere, produce zero value and are quickly discarded. But any _real_ project will be much more complex. You will find software from many eras, split across multiple codebases, written by imperfect humans. There will likely be "mechanical turk" steps required to keep the whole affair running, procedures which are the sole purview of a single individual, who no longer works here. If there are docs, you can be sure they are outdated. The average software engineer learns to live in this chaos. We, at a certain point, accept a baseline level of madness and uncertainty, bow our heads and say a prayer that it will all hold together. Somehow, miraculously, it usually does but at great expense to the sanity and dental work of those involved. You _can_ manage a ball of mud, but to what end? Now, you must hold the ball together in perpetuity. The only alternative is to drop the ball and walk away with your hands dirty- an ignominious end to be avoided at all costs.

Why and wherefore comes this chaos? In my experience, it is because much of this business process "lives" in a distributed way, scattered amongst multiple hominid craniums. Knowledge is transferred orally or at best, copy-pasted from email to email. Often, a newbie will walk into the madness and observe, rightly, that because documentation exists in 15 separate places, and that if they just put all the data in one place, the confusion would subside. The newbie exerts great effort to realize this idea and now there are 16 places where the docs might be.

What, then, is the cure? The cure is Test Driven Development.

Why, then, is TDD the cure? TDD drags your business process out of the ether and crystallizes it in code. In doing so, assumptions are challenged and old cruft gets left behind. The necessary due diligence of writing the tests clears away all that confusion, because the test is undeniably clear and correct. The tests become the ultimate authority on what your stack can and can't do. Docs can be out of date and humans are often confused, but the tests are always correct, even when they fail. And this provides a touchstone for the entire team- a place to encode those important details as well as a signal into the heart of your stack. 

Finally, _how_, is TDD the cure? I am not of the opinion that tests must always be written before the code and this is one of those cases. In this case, I prescribe a series of improvements. 
1) Mechanical turk the task
2) Document the task so that other humans can follow it.
3) Automate it as a test so that no humans need follow it.

Here the pattern is clear- Tests are merely the application of automation. It is not a great feat, just the banal observation that tests are "living" docs, which are better than "dead" docs, which are better than myth. Do yourself and your team a favor and rise above this churn. If you understand the process, you can write it down. If you can write it down, you can automate it. If you automate it, congratulations, you are now a Test Driven Developer!

# TDD gives you momentum

There are many reasons to adopt a TDD methodology. Sadly, there is one reason which can override them all- appeals to "velocity."

Managers will often say that "we don't have time for tests" or "we'll add them later" or "we need to ship now". This is a classic case of short-term thinking. The truth is that TDD actually increases velocity in the long run. How? By reducing the time spent debugging and fixing bugs. By making it easier to refactor and add new features. By giving you the confidence to make changes without fear of breaking existing functionality. 

But how do you convince a manager who is focused on the next sprint? You don't. You just do it. Write the tests anyway. The benefits will speak for themselves. And if they don't, well, you can always find another job. But I digress.

# TDD is a mindset

TDD is not just a technique. It's a mindset. It's a way of thinking about software development that puts quality first. It's a way of working that forces you to think about the problem before you start coding. It's a way of writing code that is more modular, more testable, and more maintainable.

The TDD cycle is simple: Red, Green, Refactor. 
1) Write a failing test (Red)
2) Write the minimum amount of code to make the test pass (Green)
3) Refactor the code to make it better (Refactor)

This cycle is repeated over and over again. It's a rhythm that becomes second nature. It's a dance that you do with your code. And it's a dance that pays off in the long run.

# Conclusion

TDD is not a silver bullet. It won't solve all your problems. But it will make your life as a software engineer better. It will make your code better. It will make your team better. And it will make your product better.

So give TDD a chance. You might just find that you like it.
