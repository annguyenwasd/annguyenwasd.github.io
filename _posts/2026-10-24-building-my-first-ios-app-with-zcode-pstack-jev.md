---
layout: post
lang: en
title: "Building my first iOS app with ZCode, pstack and Jev"
description: "My first app is Vehicle Care, a SwiftUI app for vehicle maintenance. I worked as a product owner rather than a typist: ZCode is the coding agent, pstack gives the agent discipline, and Jev is the typed decision model behind browser automation."
date: 2026-10-24
permalink: /blog/en/building-my-first-ios-app-with-zcode-pstack-jev/
translations:
  vi: /blog/xay-app-ios-dau-tien-zcode-pstack-jev/
---

My first iOS app is called **Vehicle Care**: it tracks vehicles and their maintenance schedules in SwiftUI, with Apple/Google sign-in, Firebase sync, service records, spending charts, Vietnamese and English settings, and an optional paid tier that reads maintenance items from photos of invoices. Before it I had never shipped an iOS app, and through the whole build I typed almost no Swift myself. My role was product owner: describe what needs doing, look at the evidence it works, decide where the product goes. Reading code, writing code and running tests belonged to a trio of tools: **ZCode** (the coding agent), **pstack** (discipline for the agent) and **Jev** (a typed decision model).

## ZCode: a coding agent on my own Mac

ZCode reads the repo, runs commands, edits code, runs tests and drives the simulator. The working split looks like this:

1. I describe the request in plain, non-technical language: "the Save button does nothing when adding a new vehicle", "the spending chart puts expenses in the wrong month".
2. The agent reads the code, finds the cause, fixes it, then reruns the affected test layers to prove the fix works.
3. Every project convention, from how to add a localized string to the Firestore rules and the traps past sessions fell into, lives in one `AGENTS.md` file the agent reads before touching anything.

What I value most: project knowledge sits in the repo, not in my head. A real example: one bisect burned an hour because a stale simulator was silently refusing every write, while the code was fine. The conclusion became one row in the repo's rule table with the fix (erase the simulator, 20 seconds), and every agent after that avoids the trap on its own.

## pstack: discipline for the agent

A fast agent fails in characteristic ways: it grows extra features while fixing a bug, declares "done" without running anything, or says yes to every request. **pstack** is a plugin that gives ZCode a set of skills and playbooks aimed at exactly those points:

- Work is split into small steps, and each step ends with a check that actually runs; "it compiles" does not count as done.
- A bug gets reproduced before it gets fixed, and the fix lands at the root cause instead of pasting a guard over the symptom.
- Before asking me "which approach?", the agent tries the options and lets the result decide; my input is reserved for real product decisions.
- "No is an acceptable answer": the agent may decline a feature that does not earn its place.

That last part is the one I appreciate most. I propose all kinds of things, some of them bad, and a collaborator who says "this isn't worth it" beats one who nods and leaves dead code behind.

## Jev: typed decisions at the most fragile step

In the whole automation chain, the step that breaks most often is browser driving: uploading screenshots to App Store Connect, filling in metadata, pages whose selectors change without notice, where one wrong click ruins an evening of work. My repo routes every browser task through a `$jb` skill with this division of labor:

1. **Jev**, a decision model from TypeSafe AI, reads the page state and returns exactly one typed action: which element, what operation, with a confidence level.
2. **browser-use** executes that one bounded step.
3. An uncertain or irreversible step stops and waits for me instead of clicking on.

Jev's specialty is the class of small, high-volume judgments: which route to take, how urgent something is, allow or block. Answers always carry a type, `choice` (pick one of several labeled options), `score` (a level on a 2–10 scale) or `noul` (a yes/no probability from 0 to 1), so code branches on them directly with no "read the free text and guess the intent" step. The decisions too fuzzy for a hand-written `if` and too small for a frontier LLM call fit inside that budget.

## Where things stand today

- The app is on **TestFlight**, running against a separate staging Firebase project so testing never touches production user data.
- Seven layers of behavior tests are wrapped in one script; the iOS UI layer alone takes about 55 minutes, so it splits across two parallel lanes, each with its own simulator and emulator ports.
- The repo has passed more than 75 pull requests, issues not included; bugs get filed as GitHub issues in product-owner language.
- App Store metadata and screenshots for both languages sit in the repo, ready for submission.
