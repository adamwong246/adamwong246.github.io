---
title: Give TDD a chance
publishedAt: Thu Mar 30 2023 10:05:03 GMT-0700 (Pacific Daylight Time)
---

A lot of ink has already been spilt on the subject of TDD and how, why, when, where and for what reasons the methodology ought and ought not be applied. Nonetheless, I'd like to compose my thoughts on the subject, because, it is my humble opinion that TDD leads to a fundamentally better, happier place for software engineers. Note that I qualify that statement with "for software engineers"- managers, shareholders and spouses often have different priorities from those who are paid to press the buttons. But I myself am a coder. I like programming and I like to practice my craft well, effectively, but also kindly. Somewhat selfishly, I want to spend my working hours gracefully working the problem and that is not an unreasonable thing to want, given that we all spend decades at a time, laboring to enchant these infernal magic boxes to flip the right bits. 

# Tests > docs > gestalt > nothing

It is easy for programmers to be shortsighted by their early experience. We often begin our craft as loners, pecking out code in small side-projects. Most of these project never go anywhere, produce zero value and are quickly discarded. But any _real_ project will project will be much more complex. You will find software from many eras, split across multiple codebases, written by imperfect humans. There will likely be "mechanical turk" steps required to keep the whole affair running, procedures which are the sole purview of a single individual, who no longer works here. If there are docs, you can be sure they are outdated. The average software engineer learns to live in this chaos. We, at a certain point, accept a baseline level of madness and uncertainty, bow our heads and say prayer that it will all hold together. Somehow, miraculously, it usually does but at great expense to the sanity and dental work of those involved. You _can_ manage a ball of mud, but to what end? Now, you must hold the ball together in perpetuity. The only alternative is to drop the ball and walk away with your hands dirty- an ignominious end to be avoided at all costs.

Why and wherefore comes this chaos? In my experience, it is because much of this business process "lives" in a distributed way, scattered amongst multiple hominid craniums. Knowledge is transferred orally or at best, copy-pasted from email to email. Often, a Newb will walk into the madness and observe, rightly, that because there documentation exists in 15 separate places, and that if they just put all the data in one place, the confusion would subside. The Newb exerts great effort to realize this idea and now there are 16 places where the docs might me.

What, then, is the cure? The cure is Test Driven Development.

Why, then, is TDD the cure? TDD drags your business process out of the ether and crystallizes it in code. In doing so, assumptions are challenged and old cruft gets left behind. The necessary due-diligence of writing the tests clears away all that confusion, because the test is undeniably clear and correct. The tests become the ultimate authority on what your stack can and can't do. Docs can be out of date and humans are often confused, but the tests are always correct, even when they fail. And this provides a touchstone for the entire team- a place to encode those important details as well as a signal into the heart of your stack. 

Finally, _how_, is TDD the cure? I am not of the opinion that tests must always been written before the code and this is one of those cases. In this case, I prescribe a series of improvements. 
1) Mechanical turk the task
2) Document the task so that other humans can follow it.
3) Automate it as a test so that no humans need follow it.

Here the pattern is clear- Tests are merely the application of automation. It is not great feat, just the banal observation that tests are "living" docs, which are better than "dead" docs, which are better than myth. Do yourself and your team a favor and rise above this churn. If you understand the process, you can write it down. If you can write it down, you can automate it. If you automate it, congratulations, you are now a Test Driven Developer!

# TDD gives you momentum

There are many reasons to adopt a TDD methodolgy. Sadly, there is 1 reason which can override them all- appeals to "velocity."