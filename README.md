# mail-preview

A zero-config dev-mode mail preview UI for Meteor. Every email sent via `Email.sendAsync()` is captured and displayed in a browser UI at `/__meteor_mail__/`.

Inspired by similar features in Rails (Action Mailer Preview), Phoenix (Swoosh), Laravel (Mailtrap), and Django (console backend).

## Installation

```bash
meteor add dupontbertrand:mail-preview
```

That's it. No configuration needed.

This is a `debugOnly` package: it is **left out of production builds** (`meteor build`, `meteor deploy`, `meteor run --production`). Zero overhead in production, no need to remove it before deploying.

## Usage

1. Start your Meteor app in development mode (`meteor run`)
2. Trigger any email (e.g. password reset, verification, etc.)
3. Open [http://localhost:3000/__meteor_mail__/](http://localhost:3000/__meteor_mail__/) in your browser

### What you get

- **Mail list** — live-updating table of all captured emails (polls every 2s, no page reload)
- **Mail detail** — view each email with tabs for HTML render, plain text, and HTML source
- **Clickable links** — verification, password reset, and enrollment links work directly from the preview
- **JSON API** — programmatic access for testing/tooling
- **Clear all** — one-click button to clear captured mails

### JSON API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/__meteor_mail__/api/mails` | List all captured mails |
| GET | `/__meteor_mail__/api/mails/:id` | Get a single mail |
| DELETE | `/__meteor_mail__/api/mails` | Clear all captured mails |

## How it works

The package uses `Email.hookSend()` to intercept outgoing emails and store them in memory. A middleware serves the preview UI via `WebApp.rawConnectHandlers`.

- **Dev mode only** — the package is left out of production builds (`debugOnly: true`), and its code is a no-op outside development (`Meteor.isDevelopment` guard)
- **No SMTP needed** — emails are captured before they reach any transport
- **No dependencies** — uses only Meteor core packages (`email`, `webapp`, `ecmascript`)
- **Up to 50 mails** stored in memory (oldest are evicted)

## Compatibility

- Meteor 3.4+
- Works alongside `MAIL_URL` — emails are still sent normally, the hook just captures a copy
- Works with `accounts-password` emails (verification, reset password, enrollment)

## Changelog

### 1.2.1

The package is now `debugOnly` instead of `devOnly`. Since Meteor 3.4, and at least up to 3.6-rc.0, `devOnly` is not applied to a package whose name has an author prefix, so versions 1.2.0 and earlier were still shipped in production builds. They stayed inert there, thanks to their `Meteor.isDevelopment` guard; upgrading removes them from the bundle.

## License

MIT
