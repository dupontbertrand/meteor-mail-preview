# meteor-mail-preview

A zero-config dev-mode mail preview UI for Meteor. Every email sent via `Email.sendAsync()` is captured and displayed in a browser UI at `/__meteor_mail__`.

Inspired by similar features in Rails (Action Mailer Preview), Phoenix (Swoosh), Laravel (Mailtrap), and Django (console backend).

## Installation

```bash
meteor add dupontbertrand:mail-preview
```

That's it. No configuration needed.

## Usage

1. Start your Meteor app in development mode (`meteor run`)
2. Trigger any email (e.g. password reset, verification, etc.)
3. Open [http://localhost:3000/__meteor_mail__](http://localhost:3000/__meteor_mail__) in your browser

### What you get

- **Mail list** — table of all captured emails, auto-refreshes every 5 seconds
- **Mail detail** — view each email with tabs for HTML render, plain text, and HTML source
- **JSON API** — programmatic access for testing/tooling

### JSON API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/__meteor_mail__/api/mails` | List all captured mails |
| GET | `/__meteor_mail__/api/mails/:id` | Get a single mail |
| DELETE | `/__meteor_mail__/api/mails` | Clear all captured mails |

## How it works

The package uses `Email.hookSend()` (available since Meteor 2.2) to intercept outgoing emails and store them in memory. A Connect middleware serves the preview UI via `WebApp.connectHandlers`.

- **Dev mode only** — the entire package is a no-op in production (`Meteor.isDevelopment` guard)
- **No SMTP needed** — emails are captured before they reach any transport
- **No dependencies** — uses only Meteor core packages (`email`, `webapp`, `ecmascript`, `logging`)
- **Up to 50 mails** stored in memory (oldest are evicted)

## Compatibility

- Meteor 2.2+ and Meteor 3.x
- Works alongside `MAIL_URL` — emails are still sent normally, the hook just captures a copy

## Screenshots

_Coming soon_

## License

MIT
