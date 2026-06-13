# Supabase — schema & game logic

This folder is the **version-controlled source of truth** for the Placeless database. The
live project was originally configured through the dashboard; these migrations document and
extend it. They are written to be **idempotent / safe to re-run**.

## What's here

| File | Contents |
|---|---|
| `migrations/0001_schema.sql` | Tables (`rooms`, `players`, `votes`, `events`), indexes, constraints. Adds the game-logic columns `rooms.current_round` and `rooms.winner`. |
| `migrations/0002_security.sql` | RLS policies + **column-level grants** that hide `is_spy`, `player_uuid`, and `location` from the client; the `players_public` / `rooms_public` views. |
| `migrations/0003_functions.sql` | All game mutations as `SECURITY DEFINER` RPCs (create/join, start, ready, accuse, vote, spy guess, timer expiry, host promotion, play again, leave) + the private `get_my_player` / `get_results` reads. |
| `migrations/0004_realtime_cron.sql` | Adds tables to the `supabase_realtime` publication and schedules the hourly cleanup job. |

## How to apply

Run the files in order in the Supabase **SQL editor** (or via the Supabase CLI). Because the
project already has the four base tables and some RLS, **review before running** — `0002`
will *replace* the read policies and re-grant column privileges to match this canonical state.

```
0001_schema.sql  →  0002_security.sql  →  0003_functions.sql  →  0004_realtime_cron.sql
```

`0004` requires the **pg_cron** extension (Database → Extensions). The realtime publication
edits assume the default `supabase_realtime` publication exists.

## Security model (important)

There is **no Supabase auth**. A player's identity is the unguessable UUID stored in their
browser (`localStorage` key `placeless_player_id`) — treat it as a **bearer secret**.

- The client may **never** read `is_spy`, `player_uuid`, or `rooms.location` — these are
  withheld by column `GRANT`s, so they don't appear in query results *or* realtime payloads.
- The spy's role and the secret location reach the right player only through
  `get_my_player(player_uuid, room_code)`, which is authorized by the bearer UUID.
- Every write is a `SECURITY DEFINER` RPC that re-checks authorization (host-only actions,
  "you're in this room", "not yourself", capacity, etc.). Anon has **no** direct
  insert/update/delete.
- Realtime is used purely as a *"something changed, refetch"* signal — the client never
  trusts realtime payloads for secret data.

> **Verify after applying:** confirm a plain `select * from players` as the `anon` role
> fails on the `is_spy`/`player_uuid` columns, and that a realtime subscription to `players`
> does not deliver `is_spy`. Column-grant enforcement in realtime payloads depends on your
> Postgres/Realtime version; the client is written defensively regardless.

## Win conditions (encoded in the RPCs)

| Outcome | `rooms.winner` | Where |
|---|---|---|
| Untied plurality vote lands on the spy | `players` | `cast_vote` |
| Vote misses (wrong person, or a tie) | `spy` | `cast_vote` |
| Spy guesses the location correctly | `spy` | `spy_guess` |
| Spy guesses wrong | `players` | `spy_guess` |
| Timer expires with no resolution | `spy` | `expire_timer` |
