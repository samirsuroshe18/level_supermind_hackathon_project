# AdVise: design

AdVise turns a topic into an audience research report. A marketer or creator
types a product, niche or question; AdVise reads what people are saying about
it in public, and reports the pain points, wishes, competitors, sentiment and
trend it finds, together with ad hooks and calls to action that follow from
them. Every finding links back to the posts it came from.

The project started at the Level SuperMind hackathon in January 2025. This
document describes the finished version.

## Goals

- A visitor can sign up, verify their email, run a research and read a report
  built from live public data.
- Every claim in a report is traceable to real posts.
- The app runs on free hosting and free API tiers without surprises.
- The code is small enough to read in one sitting and is covered by tests.

## Out of scope

- Scraping sites that have no public API (Quora, Google Ads, e-commerce pages).
- Sign-in with Google, payments, file uploads, team workspaces.
- Scheduled or recurring research, exports, sharing a report by link.

## How a research works

1. The user submits a topic (3 to 120 characters).
2. The API checks the daily limit, stores a research with status `queued` and
   answers immediately with its id.
3. A background job runs the research in four stages. The stage is saved after
   each step, so the browser can show progress by polling.

   | Stage | What happens |
   |---|---|
   | `collecting` | Each enabled source is searched for the topic, in parallel |
   | `analysing` | Sentiment and volume over time are computed in code |
   | `writing` | The language model writes the insights from a sample of posts |
   | `done` / `failed` | The report is saved, or the reason for failure is |

4. The browser polls the research every two seconds until it is `done` or
   `failed`, then shows the report.

Running the research in the background keeps every HTTP request short. That
matters because the web app reaches the API through a proxy with a short
timeout, and a research takes 15 to 40 seconds.

A research that is still `queued` or running when the server restarts is
marked `failed` at startup with the message "Interrupted, please run it
again", and does not count against the daily limit.

## Sources

Each source is one module with the same interface: given a topic, return a
list of posts in a common shape.

```
{ source, id, text, author, url, score, createdAt }
```

| Source | API | Credentials | What is collected |
|---|---|---|---|
| YouTube | YouTube Data API v3 | `YOUTUBE_API_KEY` | Top 5 videos for the topic, up to 40 top-level comments each |
| Hacker News | Algolia HN Search | none | Up to 100 stories and comments matching the topic, from the last 24 months |
| Reddit | Reddit OAuth API | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` | Up to 50 posts matching the topic, and up to 10 top comments from each of the 5 highest-scored posts |

Rules that apply to all sources:

- A source without credentials is disabled. The API reports which sources are
  enabled, and the app only mentions those. Reddit ships disabled until
  credentials are added; nothing else changes when they are.
- A source that errors or times out (10 seconds) is skipped. The report lists
  which sources contributed and which were skipped.
- Posts are trimmed to 600 characters, de-duplicated, and posts shorter than
  20 characters are dropped.
- If fewer than 15 posts are found in total, the research fails with "Not
  enough public discussion found for this topic. Try a broader one."

## Analysis

**Computed in code** (cheap, repeatable, testable):

- **Sentiment**: each post is scored with a word-list scorer and classed as
  positive, neutral or negative. The report shows the split overall and per
  source.
- **Volume over time**: posts are counted per month for the last 12 months.
- **Top posts**: the highest-scored posts per source, shown as evidence.

**Written by the language model** (Gemini), from a sample of at most 120
posts chosen by score, balanced across sources:

- a three-sentence summary,
- pain points and wishes, each with a short explanation and the ids of the
  posts that support it,
- competitors or alternatives people mention, with how they are spoken about,
- five ad hooks and three calls to action, each tied to a pain point or wish.

The model is asked for JSON that matches a fixed schema. The response is
validated before saving: unknown post ids are removed, and an insight left
with no supporting post is dropped. If the model call fails or returns
invalid JSON it is retried once; if it fails again the research still
finishes, with the computed sections and a notice that the written insights
are unavailable.

The model name is read from `GEMINI_MODEL` (default `gemini-3.5-flash-lite`),
so it can be changed without a code change when Google retires a model.

## Limits

- Five researches per user per day (UTC). Failed researches do not count.
- Fifteen attempts per user per day, whatever their outcome, so failed
  researches cannot be repeated without end.
- One research at a time per user.
- The remaining count is shown next to the research form.

These keep the app inside the free quota of the YouTube API (10,000 units a
day; a research costs about 105) and of the language model.

## Accounts

Email and password accounts with email verification, the same flow as before:
register, verify by emailed link, log in, log out, forgot and reset password.
Sessions use an httpOnly cookie. Changing or resetting a password ends
existing sessions.

Sign-up, login and password reset are limited to 30 requests per visitor in
15 minutes.

The demo account is shared by every visitor. Its reports cannot be deleted,
its password cannot be reset, and logging out of it only ends that visitor's
own session.

Email is sent through the Brevo HTTPS API when `BREVO_API_KEY` is set, and
through SMTP otherwise.

## API

All routes are under `/api/v1`. Research routes need a logged-in, verified
user and only ever return that user's researches.

| Route | Purpose |
|---|---|
| `POST /users/register`, `POST /users/login`, `GET /users/logout`, `GET /users/me` | Accounts |
| `POST /users/forgot-password`, `GET /verify/verify-email`, `GET /verify/reset-password`, `POST /verify/verify-password` | Email links: verify the address, check a reset link, set the new password |
| `GET /research/meta` | Enabled sources, daily limit, researches left today, longest topic allowed |
| `POST /research` | Start a research; `202` with its id |
| `GET /research` | The user's researches, newest first, without report bodies |
| `GET /research/:id` | Status, stage and, when done, the report |
| `DELETE /research/:id` | Delete one research. Its content is removed; it still counts towards the day it was started |

Errors use one shape: `{ success: false, message }` with a fitting status
code (`400` invalid topic, `401` not logged in, `404` not found or not yours,
`403` not allowed for the demo account, `409` a research is already running,
`429` daily limit or request limit reached).

## Data

**User**: name, email, password hash, verified flag, verification and reset
tokens, session version.

**Research**: owner, topic, status, stage, error message, timestamps, the
sources used and skipped, post counts, and the report: sentiment, monthly
volume, summary, pain points, wishes, competitors, hooks, calls to action and
the posts referenced as evidence. Posts that are not referenced by the report
are not stored.

## Screens

The frontend is redesigned from scratch: one visual style, light and dark
themes, usable on a phone.

| Screen | Content |
|---|---|
| Landing | What AdVise does, a sample report preview, sign-up and log-in |
| Register, log in, verify email, forgot and reset password | Account forms |
| Dashboard | Research form with researches left today, and the history list with status |
| Report | Progress while running; then summary, sentiment chart, volume chart, pain points and wishes with quotes and links, competitors, hooks and calls to action with copy buttons, sources used |
| Team | The hackathon team |

## What is removed

The hackathon code carried pieces from other projects and services that are
no longer used. They are deleted: Firecrawl and page scraping, Astra DB and
Langflow, browser automation, Google sign-in, server-rendered email views that
are replaced, payment and "tokenized assets" pages, the hardcoded dashboard
data, and the 3D and particle libraries. Stray output files and the database
bundle in `server/` are removed from the repository.

## Project structure

```
server/
  src/
    app.js, index.js
    controllers/, routes/, middlewares/, models/
    sources/          youtube.js, hackerNews.js, reddit.js, index.js
    analysis/         sentiment.js, volume.js, sample.js, insights.js
    jobs/             runResearch.js
    utils/            mail sender, DNS fallback, helpers
    scripts/seed.js   demo account with sample researches
  tests/
client/
  src/
    api/, context/, components/, pages/
docs/
  design.md
```

## Testing

- Backend: Jest and Supertest against an in-memory MongoDB. Source modules
  and the language model are replaced by fakes, so tests never call an
  outside service or send email.
- Covered: accounts, each source's mapping to the common post shape, skipped
  and disabled sources, sentiment and volume calculations, sampling,
  validation of the model's response, the research job from start to finish
  including each failure path, the daily limit, and access to other users'
  researches.
- Frontend: checked by hand on desktop and phone widths, in both themes.

## Deployment

- API on Render, web app on Vercel, database on MongoDB Atlas, email through
  Brevo.
- The web app forwards `/api` to the API, so the login cookie stays on the
  web app's own address.
- A demo account with a few finished researches is seeded, so visitors can
  look around without signing up or spending quota.

## Environment variables

| Key | Purpose |
|---|---|
| `MONGODB_URI` | Database connection string |
| `PORT`, `SERVER_HOST`, `NODE_ENV` | Where and how the API runs |
| `CORS_ORIGIN`, `FRONTEND_URL` | Web app address, for CORS and email links |
| `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRY` | Access token signing |
| `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRY` | Refresh token signing |
| `BREVO_API_KEY`, `MAIL_FROM` | Email over HTTPS |
| `MAIL_HOST`, `EMAIL_PORT`, `MAIL_USER`, `MAIL_PASS` | Email over SMTP, when Brevo is not set |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Language model |
| `YOUTUBE_API_KEY` | YouTube source |
| `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` | Reddit source, optional |
| `DAILY_RESEARCH_LIMIT` | Researches per user per day, default 5 |
