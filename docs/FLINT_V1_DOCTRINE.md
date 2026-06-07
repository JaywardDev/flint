# Flint V1 Doctrine

The record is the app.

This document is the strict implementation authority for Flint V1 Core and for the lightweight post-V1 expansion that may now follow it. When product vision and this doctrine conflict, this doctrine wins.

## Product Stage

Flint V1 Core is functionally complete.

The original V1 doctrine remains intact because it defines the foundation that proved the capture habit: Add, List, Detail, and one Record shape. That foundation should not be deleted, weakened, or reinterpreted as permission to add heavy structure to capture.

Future implementation work must distinguish between:

1. **V1 Core** — the completed foundation: Add, List, Detail, and the core Record model.
2. **Post-V1 Lightweight Expansion** — secondary views that may help users reread existing records without changing the capture habit.

The core record model remains the foundation of the app. New views must orbit the record; they must not become new product systems.

## V1 Product Shape

Flint V1 Core has only three primary screens:

- Add
- List
- Detail

Flint V1 Core has one table/object:

- Record

Build the capture habit first. Every V1 Core decision should make adding and rereading a record feel lighter, not more structured.

## Record

A V1 Record has only these fields:

- id
- user_id
- type
- title
- summary
- when
- where
- created_at
- updated_at

Allowed `type` values are:

- person
- event
- place
- object
- note

Required fields for user entry:

- type
- title

Optional fields for user entry:

- summary
- when
- where

`when` and `where` are plain text. V1 Core does not parse, normalize, split, geocode, or otherwise structure them.

## Screens

### Add

A small notebook-like form for quickly adding one Record.

Fields:

- type
- title
- summary
- when
- where

No extra fields. No heavy capture flow.

### List

A simple reverse-chronological list of Records by `created_at`.

List may include one small basic search input. Search may only inspect V1 Record fields:

- type
- title
- summary
- when
- where

No alternate modes or controls.

### Detail

A clear view of one Record.

Show only:

- type
- title
- summary
- when
- where
- created_at
- updated_at

Minimal editing is allowed only if it preserves the exact V1 fields and does not add new concepts.

## V1 Test

The V1 Core test remains:

> Does adding a record feel like jotting in a notebook?

If yes, ship it.
If no, simplify.

This test still applies after V1 Core. No post-V1 view may make adding a record feel heavier, slower, more structured, or less notebook-like.

## Deferred / Do Not Build in V1 Core

These items were intentionally deferred from V1 Core and must not be introduced into the core capture model:

- tags
- sources
- coordinates
- structured dates
- timeline features
- maps
- graphs
- Sparks
- collections
- filters
- sorting options
- advanced search

This list means “not part of V1 Core.” It does not mean every item is forbidden forever. Post-V1 work may add approved lightweight secondary views under the rules below.

## Post-V1 Lightweight Expansion

Post-V1 lightweight expansion may add secondary views only when they remain lenses over existing Records.

Allowed secondary views at this stage:

- `/timeline`
- `/sparks`

These views are allowed because V1 Core is complete. They must not redefine Flint’s foundation. Flint V1 Core remains Add, List, and Detail. The core Record model remains the foundation of the app.

### Timeline

Timeline may exist as a read-only time-based view over existing Records.

Timeline may:

- Display existing records through a time-oriented lens.
- Use the existing `when` field where useful.
- Fall back to `created_at` where appropriate.
- Use UI-only grouping, empty states, density indicators, and navigation.
- Link back to existing Record detail pages.

Timeline must derive from existing Record data wherever possible. It must not require the user to enter more structure before saving a record.

### Sparks

Sparks may exist as a placeholder or future surface for discovered connections.

Sparks may:

- Introduce the concept of possible future connections.
- Use empty states, lightweight explanatory copy, and navigation.
- Show simple UI-only groupings or prompts derived from existing Records.
- Link back to existing Record detail pages.

Sparks must remain a secondary view. It must not introduce connection infrastructure as a core dependency yet.

### Allowed Lightweight View Behavior

Post-V1 views may use:

- UI-only grouping.
- Empty states.
- Density indicators.
- Simple navigation.
- Plain TypeScript derivations from existing Record data.
- Small reusable UI components.

Post-V1 views must:

- Derive from existing Record data wherever possible.
- Keep Record capture fast.
- Avoid new required fields.
- Avoid any flow that makes saving a Record slower.
- Preserve the feeling of jotting in a notebook.

### Still Not Allowed at This Stage

The following remain forbidden unless the user explicitly approves a later doctrine change:

- No new timeline-specific tables.
- No persisted era labels unless specifically approved later.
- No graph database.
- No connection tables for Sparks yet.
- No required tags.
- No required collections.
- No AI-generated connection infrastructure as a core dependency.
- No complex filtering system.
- No structured date UX that makes record capture heavier.
- No feature that makes adding a record feel less like jotting in a notebook.

## Implementation Rule for Future Agents

When implementing post-V1 views, prefer boring architecture: server components, existing Supabase helpers, existing Record data, plain TypeScript derivations, and small reusable UI components. Do not add new infrastructure unless the user explicitly approves it.
