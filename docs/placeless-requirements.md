# Placeless — App Requirements Document

---

## 1. Overview

Placeless is a free, browser-based multiplayer social deduction game inspired by the card game Spyfall (designed by Alexandr Ushan, published by Hobby World). No downloads, no accounts required to play. Players are silently assigned a persistent anonymous identity (UUID) on first visit, stored in their browser. They pick a display username when creating or joining a room. Players join a shared room via a short code and play in real time. One player is secretly the Spy; everyone else knows the location. The Spy tries to figure out the location; everyone else tries to expose the Spy.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Realtime + Database | Supabase (Realtime + PostgreSQL) |
| Hosting | Vercel |
| Code Storage | GitHub |
| Auth | None — anonymous UUID identity via localStorage |

---

## 3. Anonymous Identity System

Even though there are no accounts, every player needs a stable, unique identity so that:

- Two players with the same display username are never confused with each other
- A player who refreshes mid-game is recognized as the same person and seamlessly rejoined
- Votes, roles, and host privileges are tied to a real unique identifier, not just a name string

### How It Works

When a user visits the app for the first time, the client silently generates a **UUID v4** and stores it in `localStorage` under the key `placeless_player_id`. This happens before they even enter a username. This UUID is the player's true identity for all database operations.

```
localStorage key: placeless_player_id
value: e.g. "a3f8c21d-7b4e-4e09-91a0-df6e2c3b19aa"
```

- The UUID is **never shown to the user** — it is purely internal
- The UUID **persists across sessions** as long as the browser storage is not cleared
- The display **username** is separate — human-readable, user-chosen, shown in-game
- Two players can have the same username; the UUID is what uniquely identifies them in the database
- If a player clears localStorage or uses a different browser/device, a new UUID is generated and they are treated as a new player

### Refresh / Reconnect Behaviour

If a player refreshes mid-game:
1. The app reads `placeless_player_id` from localStorage
2. Queries Supabase for a player row matching that UUID + the current room code
3. If found and the game is still active → seamlessly drop them back in to the correct game state
4. If not found (room expired or they were removed) → redirect to `/play` with a friendly message

---

## 4. URL Structure / Pages

| Route | Page | Description |
|---|---|---|
| `/` | Homepage | Marketing page — features, how to play, CTA buttons |
| `/play` | Play Hub | Choose to Create Room or Join Room |
| `/play/join` | Join Room | Standalone join form — username + room code |
| `/play/how-to-play` | Rules Page | Detailed rules explanation |
| `/room/:code` | Game Room | Live game session — lobby → playing → voting → results |

**Notes:**
- Homepage "Create Room" and "Join Room" buttons both route to `/play`
- `/play` presents both Create and Join as two options on the same page
- `/play/join` is a direct deep-linkable standalone version of the join form
- No `/login` route — accounts are out of scope

---

## 5. User Flow

### Creating a Room
1. User visits `/play`, selects "Create Room"
2. Enters a **display username** (no password, no email)
3. App reads or generates their `placeless_player_id` UUID from localStorage
4. App creates a room row in Supabase, generates a **4-character room code** (e.g. `XKQT`)
5. Player is inserted into the `players` table as the **Host**
6. User is redirected to `/room/XKQT` — the Lobby screen

### Joining a Room
1. User visits `/play` or `/play/join`
2. Enters **display username** + **room code**
3. App reads or generates their UUID from localStorage
4. App validates: room exists, room status is `lobby`, player count < 10, game not already started
5. Player is inserted into `players` table as a regular player
6. User is redirected to `/room/XKQT` — the Lobby screen

### Lobby
- Room code displayed prominently so host can share it
- Live list of all players as they join (via Supabase Realtime)
- Host sees a **timer duration selector** (3–15 minutes, 1-minute increments)
- All non-host players see the selected timer duration (read-only)
- Host sees a **"Start Game"** button (disabled until minimum 3 players present)
- Non-host players see a **"Waiting for host to start..."** message
- If a player joins and a game is already `playing`, they are rejected with a message

### Role Reveal
1. Host clicks Start Game
2. Supabase assigns roles server-side (one Spy chosen randomly, everyone else gets the location)
3. Room status transitions to `playing`
4. Each player's screen shows their private card:
   - **Regular players:** Location name + a brief flavour description
   - **Spy:** "You are the Spy" — no location shown
5. A "Got it" or "I'm Ready" button lets each player acknowledge their role before the timer starts
6. Once all players ready up (or a short countdown expires), the Game Phase begins

### Game Phase
- Countdown timer visible to all players simultaneously (server-anchored)
- Player list visible — shows all usernames
- Any player can click **"Accuse"** at any time to trigger a vote
- The Spy additionally sees a **"Guess Location"** button
- No in-app chat — players converse by voice or video outside the app

### Voting Phase
- Triggered when any player clicks "Accuse"
- All players see a list of other players to vote on as the Spy
- Each player submits exactly one vote
- Live vote tally updates as votes come in
- Once all votes are in (or a short timeout expires), results are calculated
- Timer is paused during voting

### Results Screen
- Spy is revealed (their username + "was the Spy")
- Location is revealed to everyone
- Winner is announced
- Host sees a **"Play Again"** button — resets the room to Lobby, keeps the same players
- All players see a **"Leave Room"** button

---

## 6. Game Rules & Logic

### Role Assignment
- Exactly **one Spy** per round, selected randomly at game start
- All other players receive the same location
- Role assignment is performed **server-side** (Supabase database function or Edge Function)
- The `is_spy` column is protected by Row Level Security — a player can only ever read their own row's value, never another player's

### Locations
- 30+ locations stored as a hardcoded array in the app codebase
- One is randomly selected per round at game start
- The full location list is shown to the Spy on the "Guess Location" screen so they have a fair chance to guess
- Locations span diverse settings to keep rounds fresh

**Included locations:**

Space Station, Pirate Ship, Hospital, Casino, Beach, Police Station, School, Supermarket, Movie Studio, Military Base, Passenger Train, Cruise Ship, Restaurant, Bank, Hotel, Airport, Museum, Theater, Circus, Embassy, Submarine, Cathedral, Spa, Polar Station, Ocean Liner, Service Station, University, Corporate Party, Jail, Medieval Tournament, Coal Mine, Vineyard, Sports Stadium

### Timer
- Host selects duration before starting: **3 to 15 minutes** in 1-minute increments
- Timer start timestamp (`started_at`) is stored in the `rooms` table when the game begins
- All clients calculate the countdown independently using `started_at` + `timer_duration` — this means the timer stays in sync even on refresh
- When timer reaches 0 → Spy wins automatically, results screen shown to all

### Win Conditions

| Condition | Winner |
|---|---|
| Majority vote correctly identifies the Spy | Non-spies win |
| Majority vote selects the wrong person | Spy wins |
| Spy correctly guesses the location | Spy wins |
| Timer expires with no successful vote | Spy wins |

### Player Count
- Minimum **3 players** to start
- Maximum **10 players** per room
- Attempting to join a full room returns an error: "This room is full"
- Attempting to join a room mid-game returns an error: "Game already in progress"

---

## 7. Realtime Event Sync

All game state changes must propagate to every connected client instantly via Supabase Realtime channel subscriptions. No polling.

| Event | All Players See |
|---|---|
| Player joins lobby | Player list updates live |
| Player leaves lobby | Player list removes them |
| Host changes timer setting | Updated duration shown to all |
| Host starts game | All transition to role reveal screen |
| All players ready up | Timer starts, game phase begins |
| Accusation triggered | All transition to voting screen, timer pauses |
| A vote is submitted | Live vote tally updates |
| Voting resolves | All transition to results screen |
| Spy clicks Guess Location | All transition to results screen immediately |
| Timer hits zero | All transition to results screen (Spy wins) |
| Host clicks Play Again | All return to lobby, player list preserved |
| Host leaves the room | A new host is promoted (next player in join order) |

---

## 8. Database Schema

### `rooms`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `room_code` | text | Unique, 4-char uppercase alphanumeric e.g. `XKQT` |
| `status` | text | `lobby` / `playing` / `voting` / `ended` |
| `location` | text | Null until game starts; hidden via RLS until `ended` |
| `timer_duration` | int | Duration in minutes, set by host, default 8 |
| `started_at` | timestamptz | Set when game starts; used to compute live countdown |
| `created_at` | timestamptz | Auto — used for cleanup |
| `last_activity_at` | timestamptz | Updated on any game event — used for cleanup |

### `players`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `player_uuid` | uuid | The anonymous identity from localStorage — unique per human |
| `room_code` | text | Foreign key → rooms.room_code |
| `username` | text | Display name chosen by user |
| `is_host` | boolean | One host per room |
| `is_spy` | boolean | Protected by RLS — readable only by the owning player |
| `is_ready` | boolean | Whether the player has acknowledged their role card |
| `joined_at` | timestamptz | Auto — used for host promotion ordering |

### `votes`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `room_code` | text | Foreign key |
| `round` | int | Round number (for play again support) |
| `voter_id` | uuid | `players.id` of the player voting |
| `accused_id` | uuid | `players.id` of the player being accused |
| `created_at` | timestamptz | Auto |

### `events` _(optional but recommended for debugging and replay)_

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `room_code` | text | Foreign key |
| `type` | text | `game_start`, `accusation`, `vote_cast`, `spy_guess`, `timer_end`, `game_end`, `player_join`, `player_leave` |
| `payload` | jsonb | Any extra structured data relevant to the event |
| `created_at` | timestamptz | Auto |

---

## 9. Row Level Security (RLS) Policies

RLS is critical because Supabase exposes the database directly to the browser client. Without it, players could query other players' roles and cheat.

### `rooms` table
- Anyone can **read** a room row (to display lobby info, timer, status)
- Only the host (`player_uuid` matches + `is_host = true`) can **update** the room (change timer, start game)
- `location` column is **hidden** (returned as null) until `status = ended`

### `players` table
- Anyone in the same room can read: `id`, `username`, `is_host`, `is_ready`, `joined_at`
- `is_spy` is **only readable** by the player whose `player_uuid` matches the requesting client
- Players can only **insert** their own row (one row per `player_uuid` per `room_code`)
- Players can only **update** their own row (e.g. marking `is_ready = true`)

### `votes` table
- Players can **insert** one vote per round (enforced by unique constraint on `room_code + round + voter_id`)
- Players can **read** votes in their room (for live tally display)
- Players cannot **update or delete** votes

### `events` table
- Read-only for all clients
- Insert allowed from server-side functions only

---

## 10. Cleanup System

Without cleanup, the database will accumulate stale rooms, ghost players, and orphaned votes indefinitely. The following automated cleanup keeps things tidy.

### What Gets Cleaned Up

| Data | Cleanup Trigger |
|---|---|
| Rooms with `status = ended` | 2 hours after `last_activity_at` |
| Rooms stuck in `lobby` with no activity | 1 hour after `last_activity_at` |
| Rooms stuck in `playing` (abandoned mid-game) | 4 hours after `last_activity_at` |
| Players with no associated active room | Cascade delete when room is deleted |
| Votes with no associated active room | Cascade delete when room is deleted |
| Events with no associated active room | Cascade delete when room is deleted |

### Implementation

Use a **Supabase scheduled cron job** (available via the Supabase dashboard under Database → Extensions → pg_cron):

```sql
-- Run every hour
SELECT cron.schedule(
  'cleanup-stale-rooms',
  '0 * * * *',
  $$
    DELETE FROM rooms
    WHERE
      (status = 'ended' AND last_activity_at < now() - interval '2 hours')
      OR (status = 'lobby' AND last_activity_at < now() - interval '1 hour')
      OR (status IN ('playing', 'voting') AND last_activity_at < now() - interval '4 hours');
  $$
);
```

Because all child tables (`players`, `votes`, `events`) have `ON DELETE CASCADE` set on their `room_code` foreign keys, deleting a room automatically deletes all associated data.

### `last_activity_at` Updates

The `last_activity_at` column on `rooms` should be updated (touched) on any meaningful game event:
- Player joins or leaves
- Host changes timer
- Game starts
- Vote is cast
- Game ends
- Host clicks Play Again

This ensures active rooms are never accidentally cleaned up.

### localStorage Cleanup

The `placeless_player_id` in localStorage has no server-side expiry — it lives in the browser until cleared. This is intentional. There is nothing sensitive stored server-side against the UUID except game participation records, which are deleted with the room.

---

## 11. Host Promotion

If the host disconnects or leaves the room:
- The next player by `joined_at` (earliest join time) is promoted to host
- Their `is_host` is set to `true`; the original host's row is deleted
- This is handled client-side: when a Realtime update shows the host player removed, each client checks if they are now the eldest remaining player and if so, promotes themselves via an update call (guarded by RLS to prevent races)

---

## 12. Pages & Component Breakdown

### Homepage `/`
- Navbar: logo left, "How to Play" link right
- Hero: headline, subheadline, "Play Now" button + "Join Room" button (both → `/play`)
- Features strip: 3–10 Players / 3–15 Min Rounds / 30+ Locations
- How to Play: 4-step visual breakdown
- Testimonials section (static)
- Footer: How to Play, GitHub repo link

### Play Hub `/play`
- Two option cards side by side: **Create Room** and **Join Room**
- Create Room card: username input + "Create" button
- Join Room card: username input + room code input + "Join" button
- Validation on both: username required, min 2 chars, max 20 chars
- Room code: 4 chars, auto-uppercased

### Join Page `/play/join`
- Identical to the Join Room card on `/play` but as a full standalone page
- Useful for when someone shares a direct link

### How to Play `/play/how-to-play`
- Static content page explaining all 4 phases with clear headings
- Link back to `/play`

### Game Room `/room/:code`
Single route, renders different UI based on `rooms.status`:

| Status | UI Rendered |
|---|---|
| `lobby` | Player list, room code, timer selector (host), Start button (host), waiting message (others) |
| `playing` (role reveal) | Private role card per player, "I'm Ready" button, ready count |
| `playing` (main game) | Timer countdown, player list, Accuse button, Guess Location button (spy only) |
| `voting` | Player list to vote on, live vote tally, waiting for all votes |
| `ended` | Spy revealed, location revealed, winner banner, Play Again (host), Leave Room (all) |

---

## 13. Validation Rules

| Field | Rule |
|---|---|
| Username | Required, 2–20 characters, trimmed whitespace |
| Room code | Required, exactly 4 characters, letters and numbers only, auto-uppercased |
| Room join | Room must exist, status must be `lobby`, player count must be < 10 |
| Start game | Minimum 3 players must be in the room |
| Vote | One vote per player per round, cannot vote for yourself |
| Spy guess | Must select from the predefined location list |

---

## 14. Non-Functional Requirements

- **Mobile responsive** — most players will join on phones; all screens must be fully usable on small viewports
- **No page reload required** — all state transitions are reactive via Supabase Realtime subscriptions
- **Server-anchored timer** — timer is calculated from `started_at` in DB, not client-side, so refreshing does not desync the countdown
- **Graceful disconnection** — if a non-host player drops, the game continues unaffected; if the host drops, host is promoted to next player
- **No duplicate usernames per room** — validated on join; two players in the same room cannot share a display username (even though their UUIDs differ)
- **Fast initial load** — no heavy assets; target < 2s to interactive on a standard connection
- **Room code collision handling** — if a generated 4-char code already exists in the DB, regenerate until unique

---

## 15. Out of Scope (v1)

- User accounts / login / profiles (unlikely to implement)
- In-app text (there might be chat later down the line)
- voice chat (this will never happen)
- Custom locations (host-created)
- Spectator mode
- Game history or statistics
- Multiple spies per round
- Mobile native app (web only)
- Paid features or ads (will never happen)
