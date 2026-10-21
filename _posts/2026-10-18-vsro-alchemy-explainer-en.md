---
layout: post
lang: en
title: "vSRO alchemy explained: the real formula is in the server code"
description: "Reverse-engineering SR_GameServer.exe from the vSRO 2022 package to answer the upgrade question: how the success threshold is computed, how much Lucky really adds, and why the roll can't be timed."
date: 2026-10-18
permalink: /blog/en/vsro-alchemy-explainer/
translations:
  vi: /blog/vsro-alchemy-explainer/
---

![The principles page of Golden Silkroad Online]({{ '/assets/images/posts/alchemy-explainer.png' | relative_url }})

Ask anyone who plays Silkroad for tips on upgrading gear and you'll get every ritual there is: waiting for the right hour, waiting for an empty server, changing maps, unequipping accessories before smashing... After reverse-engineering the `SR_GameServer.exe` of the **vSRO 2022** package, it turns out a single upgrade attempt is just **one addition and one dice roll** — there is no variable named "lucky hour".

This post introduces [Golden Silkroad Online](https://goldenonline.netlify.app/index.html), a page I built from the results of that analysis, along with a [calculator](https://goldenonline.netlify.app/calculator.html) for success thresholds and a [simulator](https://goldenonline.netlify.app/simulator.html) for upgrade attempts; the site now also has a [WTB-WTS market board](https://goldenonline.netlify.app/market.html), a [deal checker](https://goldenonline.netlify.app/deal.html) and an [event alarm](https://goldenonline.netlify.app/alarm.html). The full evidence — function addresses, Evidence IDs, 98 records — is documented in the technical report of the analysis repo (private, not public).

## How a single upgrade works

Suppose you upgrade from +7 to +8 with Elixir B + Powder B, Lucky active, Premium granting 5 points and Avatar granting 4:

| Step | What the server does | Total |
|---|---|---:|
| 1 | Looks up Elixir B for the **current +7** | 17 |
| 2 | Not yet at 100 → adds Powder B, plus 20 | 37 |
| 3 | Lucky present → consumes one charge, adds exactly 5 | 42 |
| 4 | Adds character bonuses: Premium 5 + Avatar 4 | 51 |
| 5 | Clamps into the 10–100 range | 51 |
| 6 | Rolls 0–99; below 51 wins | — |

A few consequences worth noting:

- **Lucky is not "luck"** — each use adds a fixed 5 points to the threshold, and it is consumed during the threshold calculation even when the attempt succeeds.
- **A roll equal to the threshold still fails**: the comparison is a strict "less than", so a threshold of 51 only accepts 0–50.
- Elixir and powder add **points**, they don't multiply percentages: going from 37 to 42 is +5 points, not 37 × 1.05.

## Things that are NOT in the formula at all

Gear type, rarity (SoS/SoM/SoN), degree, server time, and player count — none of these are read when the threshold is computed. The base elixir rates go from 25% (+0→+1) down to 5% (+9 and above) according to the server data tables; everything else is just materials, Lucky, character bonuses and RNG.

## Failure: two separate rolls

Only after the upgrade has missed does the server roll for the consequence:

1. Below +5: no destruction or durability roll happens at all.
2. From +5: an extra 0–99 roll — below 50 picks **destruction**, 50 or above picks **maximum durability loss**.
3. Protection stones work exactly on their branch: **Immortal** blocks destruction, **Steady** blocks durability loss; each stone is only consumed when its matching consequence is actually chosen.
4. If destruction still happens, **Astral** cannot save the item.
5. If the item survives: with Astral and a pre-attempt level ≥ +4 → one Astral charge is consumed and it drops to +4; otherwise it drops to +0.

A socketing rule worth remembering: the number of Astral stones on an item must be **lower than** its number of Immortal stones.

## Why you can't "time the numbers"

The server uses the Microsoft C LCG random generator and takes the remainder of a division by 100. Because 32768 isn't divisible by 100, the results skew slightly: a threshold of 50 actually gives **50.0488%** success. More importantly: the RNG state lives on the server; the client never sees it. The simulator has an X-ray mode that lets you watch every roll — and a Blind mode built to prove that no strategy can predict the next roll on a real server.

## The tool

- **[Principles](https://goldenonline.netlify.app/index.html)** — a full walkthrough of the mechanics, in Vietnamese and English.
- **[Calculator](https://goldenonline.netlify.app/calculator.html)** — enter your upgrade level, materials, Lucky and character bonuses; the editable rate fields let you mimic other servers.
- **[Simulator](https://goldenonline.netlify.app/simulator.html)** — play the gear-baiting strategy in X-ray mode, then switch to Blind to test it for yourself.
- **[Market](https://goldenonline.netlify.app/market.html)** — the WTB-WTS price board from the #wtb-wts Discord channel: silk/gold rate, elixirs, gear and currencies.
- **[Deal checker](https://goldenonline.netlify.app/deal.html)** — compare one item's price against the week's buy/sell range to see whether you're overpaying.
- **[Event alarm](https://goldenonline.netlify.app/alarm.html)** — set how many minutes ahead to be warned; the chime follows the daily event schedule and settings stay on your device.

## Limitations

Every rule was recovered through static analysis of the `SR_GameServer.exe` from the vSRO 2022 package; the elixir/powder figures come from the SMC data shipped with it. **Not yet verified on a live server** — Golden Online included. If your server has a modified binary or data, the numbers will differ; the calculator lets you tune the rates to match.
