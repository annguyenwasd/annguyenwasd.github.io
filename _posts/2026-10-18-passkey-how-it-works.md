---
layout: post
lang: en
title: "How passkeys work: passwordless sign-in under the hood"
description: "WebAuthn replaces passwords with an asymmetric key pair: the private key stays on your device, the server only holds a public key. A walkthrough of the registration and sign-in flows, why passkeys stop phishing, and where secrets live on macOS."
date: 2026-10-18
permalink: /blog/en/passkey-how-it-works/
translations:
  vi: /blog/passkey-hoat-dong-the-nao/
---

Passwords carry three chronic problems: people pick weak ones and reuse them everywhere; fake sites can phish whatever is typed in; and the server is forced to store a secret — one database leak and the whole stash is out. **Passkeys** (the WebAuthn/FIDO2 standard) fix this by switching models entirely: each website gets its own **asymmetric key pair**. The private key never leaves your device; the server is only ever sent the public key. Signing in means proving you hold the private key with a signature — without ever transmitting the key itself.

## Flow 1 — Creating a passkey (once per account)

1. You click "Create passkey"; the browser calls the WebAuthn API `navigator.credentials.create()`.
2. The server returns a **challenge** — roughly 32 random bytes, used exactly once — plus the `rpId` (domain name) and user info.
3. The browser hands the request to the **authenticator** (Touch ID, a YubiKey, your phone…), which asks for fingerprint / face / PIN to verify you are present.
4. The authenticator generates a **fresh key pair** for this (account, domain) combination. The private key stays inside the authenticator; the challenge is signed with exactly that private key.
5. The browser sends the server: the public key, the credential ID and the signature.
6. The server checks the signature against the challenge it issued, then stores the public key + credential ID on the account. From then on the account has no password to leak or forget.

## Flow 2 — Signing in

1. You pick "Sign in with a passkey"; the browser calls `navigator.credentials.get()`.
2. The server generates a **completely new challenge** (never reused) along with the credential IDs registered for the account.
3. The browser only offers passkeys whose `rpId` matches the exact domain; you verify with biometrics.
4. The authenticator signs the challenge with the private key, producing an **assertion** made of the signature, the credential ID and a signature counter.
5. The browser sends the assertion to the server together with the **origin** — the actual domain the page is running on.
6. The server verifies the signature with the public key stored at registration. Match → a session is created.

## Why this model stops the old attacks

- **Anti-phishing**: a passkey is bound to its domain (`rpId`). An impostor page at `bank-secure-login.com` cannot request the passkey for `bank.com` — the authenticator returns no matching credential. There is no secret that can be "typed into a fake site".
- **Anti-replay**: every assertion signs a one-time challenge. Replaying a captured sign-in is useless because the next challenge will be different.
- **A leaked database is harmless**: the server stores no secret — what leaks is a pile of public keys, which cannot log into anything.
- **No cross-site reuse**: every domain gets its own key pair; one site being compromised does not affect another.

All of the above is packed into the interactive demo below — click "Next" to step through each message exchange between browser, authenticator and server:

{% include passkey-demo-en.html %}

## Where passkeys live on a Mac: the Keychain

On macOS, the system secret store is called the **Keychain** — not "Keystore" (the equivalent name on Android/Java). Passkeys you create in Safari on a Mac live in **iCloud Keychain** and sync end-to-end encrypted across your Apple devices — create one on your iPhone, sign in on your Mac without extra setup.

That same Keychain is also a tidy home for API keys, tokens, service passwords… and it can be read and written straight from the terminal with the `security` command:

```bash
# Store a new secret (the value is entered hidden, stays out of shell history)
security add-generic-password -a "$USER" -s "my-api-key" -w

# Store with a value, or update it if it already exists (-U)
security add-generic-password -a "$USER" -s "my-api-key" -w "sk-…" -U

# Read the secret back (drop -w to see only metadata)
security find-generic-password -s "my-api-key" -w

# Assign it to an environment variable in a script
export API_KEY="$(security find-generic-password -s "my-api-key" -w)"

# Let one specific app read it without typing the keychain password each time
security add-generic-password -s "my-api-key" -a "$USER" -w -T /path/to/app

# Delete
security delete-generic-password -s "my-api-key"
```

Items created this way land in the `login` keychain — open the **Keychain Access** app (Spotlight → "Keychain Access") to view and manage them by service name. Classic website passwords have their own subcommand, `security add-internet-password`.

## The takeaway

A passkey is not "a better password" — it removes the password problem altogether: nothing to type, nothing to phish, nothing to reuse, and no secret sitting on a server waiting to be stolen. The hardest part of the security (holding the private key, binding keys to domains) is pushed down into the device and the browser. Apple, Google, GitHub and many other major services already support passkeys — next time you see a "Use passkey" button, try it: your account becomes far harder to steal.
