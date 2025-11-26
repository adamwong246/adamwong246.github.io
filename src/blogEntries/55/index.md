---
title: Testeranto and Aider
publishedAt: Sat Mar 22 2025 23:29:01 GMT-0700 (Pacific Daylight Time)
---

It's clear that AI is here to stay. If you are an old dog like me, it's wise you learn this new trick. Most approaches to AI assisted coding exist as prompts in the IDE, but testeranto takes a different approach. But first, lets consider why that approach is popular but also why it is not terribly useful. 

AI powered IDEs can generate isolated chunks of code. That's great for scaffolding new components, but we really want the AI to integrate this component into an existing codebase. You can add files to the AI's context but a codebase of any significant size will quickly overwhelm the LLM's context. What we want is to narrow the AI's focus to specific slices of our codebase, not the whole thing.

Firstly, let's introduce 2 new tools: [aider](https://aider.chat/) and [deepseek](https://platform.deepseek.com/). Aider is an LLM developer as a service, and it can be used in conjunction with many different AI services. For our purposes, we'll use deepseek.

Testeranto leverages Aider by generating "prompts" alongside test results. Each of these prompts is a little like a dockerfile. You contribute files to the LLM's context, either [adding them as editable files](https://github.com/ChromaPDX/kokomoBay/blob/631428153e654c657bc2ee919303fd2a992155d0/docs/web/src/Rectangle/Rectangle.test.electron/prompt.txt#L1) or [reading them as non-editable files](https://github.com/ChromaPDX/kokomoBay/blob/631428153e654c657bc2ee919303fd2a992155d0/docs/web/src/Rectangle/Rectangle.test.electron/prompt.txt#L8C1-L8C6). You can also [load a separate prompt](https://github.com/ChromaPDX/kokomoBay/blob/631428153e654c657bc2ee919303fd2a992155d0/docs/web/src/Rectangle/Rectangle.test.electron/prompt.txt#L15), allowing you to [decompose your prompts into multiple files](https://github.com/ChromaPDX/kokomoBay/blob/631428153e654c657bc2ee919303fd2a992155d0/docs/web/src/Rectangle/Rectangle.test.electron/featurePrompt.txt). Testeranto generates 2 prompts ATM for every testable target. [One is generated as part of the build process](https://github.com/ChromaPDX/kokomoBay/blob/631428153e654c657bc2ee919303fd2a992155d0/docs/web/src/Rectangle/Rectangle.test.electron/prompt.txt) and [the other is an artifact of the test-run process](https://github.com/ChromaPDX/kokomoBay/blob/631428153e654c657bc2ee919303fd2a992155d0/docs/web/src/Rectangle/Rectangle.test.electron/featurePrompt.txt). The former is responsible for adding the test results and src to the LLM's context. The later is responsible for adding "features" to the context. It all gets finalized with a [command which "runs" the AI](https://github.com/ChromaPDX/kokomoBay/blob/631428153e654c657bc2ee919303fd2a992155d0/docs/web/src/Rectangle/Rectangle.test.electron/prompt.txt#L16).

Here is that command, simplified
```
Fix the failing tests described in docs/web/src/Rectangle/Rectangle.test.electron/tests.json. Correct any type signature errors described in the files [docs/types/src/Rectangle.test.specification.ts.type_errors.txt, ...]. Implement any method which throws "Function not implemented."
```

