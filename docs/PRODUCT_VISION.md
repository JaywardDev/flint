# Flint — Product Vision & Architecture Doctrine

## 1. Core Idea

**Flint helps you collect small sparks of history until something catches fire.**

Flint is a personal history-learning tool for capturing short, precise records about people, places, events, objects, and observations. Over time, these records may reveal hidden patterns, overlaps, and connections.

Flint is not about building a perfect knowledge graph from day one. It is about accumulating small pieces of historical understanding in a way that is easy to absorb, easy to return to, and capable of surprising the user later.

The spark is not always created when a record is added.

Sometimes the spark appears months or years later, when two pieces of knowledge accidentally strike each other.

---

## 2. What Flint Is

Flint is a:

- Personal historical memory system
- Historical commonplace book
- Lightweight learning archive
- Time-anchored and place-aware note system
- Tool for noticing historical proximity and patterns

Flint is designed for personal learning first.

The user may not know what connects yet. That is the point. Flint should help preserve observations clearly enough that connections can emerge later.

---

## 3. What Flint Is Not

Flint is not:

- A Wikipedia clone
- A full encyclopedia
- A citation manager
- A graph database explorer
- A social research platform
- A collaborative wiki
- A long-form writing app
- A timeline database only
- A map app only

Flint should avoid becoming bloated, academic, or exhausting to maintain.

The goal is not to record everything.

The goal is to capture the compressed essence of what was learned.

---

## 4. Product Philosophy

### Accumulation-first

Flint should not force the user to create connections immediately.

The app starts with accumulation: short, useful records gathered over time.

Connections are not required. Connections are earned.

### Record-first

The record is the atomic unit of Flint.

Every experience should come back to the record: a person, event, place, object, or note.

### Discovery-led

Flint should quietly help the user notice possible relationships between records.

The app should not demand that every relationship be manually declared.

### Time-anchored

Time is the natural spine of history.

Every record should support a date, date range, era, or approximate time period where possible.

### Place-aware

Place is the second major anchor.

Records may have a location, region, historical place name, or geographic context.

### Source-light

Sources should support trust and recall, but they should not dominate the experience.

Source information should be optional, quiet, and secondary.

The user-facing experience should be:

> Understand first. Verify when needed.

---

## 5. The Core Design Challenge

The record creation experience is the most important design decision in Flint.

It is more important than Sparks, the map view, the timeline view, or any future graph feature.

If adding a record feels like filling out a form, Flint dies.

The collection will never grow dense enough for sparks to happen.

Adding a record should feel like jotting something in a notebook:

- Fast
- Low-friction
- Light
- Almost disposable
- Easy to save before the thought disappears

But underneath that simple surface, Flint should quietly preserve useful structure:

- Type
- Time
- Place
- Tags or themes
- Optional source
- Optional people or objects mentioned

This tension is central to the product:

> Structured underneath. Effortless on the surface.

Get that right and everything else follows.

---

## 6. Record Style

Every record should be short, precise, and absorbable.

A record should feel like a single breath.

Recommended structure:

```text
Title
Type
When
Where
Short summary
Why it matters / why it caught my attention
Optional source
Tags / themes
```

A good Flint record should usually contain:

- One-line summary
- Three to five sentence explanation
- Optional personal note
- Optional source or reference

Flint should resist long Wikipedia-style entries.

The user should be able to quickly read a record and understand why it matters.

---

## 7. Core Record Types

### Person

A human actor.

Examples:

- Julius Caesar
- Cleopatra
- Te Puea Hērangi
- Abraham Lincoln
- José Rizal

A Person record may include:

- Lifespan or active period
- Main places associated with them
- Short explanation of who they were
- Why they matter
- Related records discovered later

---

### Event

A moment or period in time.

Examples:

- The signing of the Treaty of Waitangi
- The fall of Constantinople
- The assassination of Archduke Franz Ferdinand
- The EDSA People Power Revolution

An Event record may include:

- Date or date range
- Location
- Main people involved
- Short description of what happened
- Why it matters
- Possible related records

---

### Place

A location with historical meaning.

Examples:

- Rome
- Waitangi
- Manila
- Constantinople
- The Silk Road
- Gallipoli

A Place record may include:

- Current name
- Historical name or names
- Region
- Period of relevance
- Why the place matters
- Events, people, or objects linked by proximity

---

### Object

A physical artifact, text, tool, weapon, ship, treaty, artwork, or material thing.

Examples:

- Magna Carta
- A Roman gladius
- The Rosetta Stone
- The Treaty of Waitangi document
- The HMS Endeavour
- A printing press

Object records are important to Flint’s identity.

Objects make history tangible.

An Object record may include:

- What it is
- When it was created or used
- Where it came from
- Who used, created, owned, signed, or discovered it
- Why it matters

---

### Note

A freeform observation, thought, quote, question, or learning fragment.

Examples:

- “This reminds me of another empire collapsing from internal pressure.”
- “I keep seeing trade routes appear before major cultural exchange.”
- “Was this event connected to migration patterns?”
- “Interesting that this person was alive during this other event.”

Notes allow Flint to stay personal.

Ideas, questions, and sources can initially live inside Notes rather than becoming separate complex entities too early.

---

## 8. Deferred or Secondary Entities

### Source

Sources should exist, but quietly.

In early versions, a Source can be simple:

- URL
- Book title
- Video title
- Article name
- Personal note
- Optional date accessed

Sources should not become a full citation-management system in the early product.

### Idea

Ideas are important but difficult.

Examples:

- Nationalism
- Stoicism
- Christianity
- Democracy
- Imperialism
- Mercantilism

Ideas are hard to date, locate, and define cleanly.

In early versions, ideas should be handled through Notes or tags.

A formal Idea entity may come later once the simpler record types are solid.

---

## 9. Sparks

Sparks are the signature discovery concept of Flint.

A Spark is a gentle suggestion that two or more records may be worth looking at together.

A Spark is not a forced connection.

A Spark may appear because records share:

- A time period
- A location
- A person
- An object
- A tag or theme
- A similar phrase
- A nearby date
- A nearby place
- A historical overlap

Examples:

```text
Caesar was alive during this event.
This object was created near the same period as this war.
These two records both involve Manila.
This place appears in three records from different centuries.
This event happened shortly before another record you saved.
```

Sparks should feel like quiet discoveries, not homework.

The user should be able to ignore, save, dismiss, or explore a Spark.

A Spark may eventually become a confirmed connection, but it does not have to.

---

## 10. Connections

Connections are not the starting point of Flint.

Connections may emerge from accumulated records.

In early versions, Flint should not require manual connection-building.

Later, the app may support confirmed relationships such as:

```text
Person participated in Event
Person created Object
Object was used in Event
Event happened at Place
Place was renamed from another Place
Event influenced another Event
Person was alive during Event
```

But this should not dominate the first version.

Principle:

> Do not force connections. Preserve observations. Let sparks emerge.

---

## 11. Views and Navigation

Views are lenses, not separate products.

Flint should avoid making Timeline, Map, Graph, and Story feel like equal top-level modes.

The record is the center.

Views help the user see records differently.

### Core Views

#### Timeline

The natural historical spine.

Useful for seeing records in chronological order and noticing overlaps.

#### Map

Useful for seeing where records happened and what else happened nearby.

#### Collection

A personal grouping of records around a topic, place, period, person, or curiosity.

#### Sparks

A discovery surface that shows possible overlaps and patterns.

### Deferred Views

#### Graph

A graph view may look impressive, but it should not be built first.

It can easily become visual noise.

If built later, it should be a navigation aid, not the main experience.

#### Story

Story-building is useful later but should not be part of the early foundation.

Story implies sequencing, narration, export, and editorial structure.

That can distort the MVP.

---

## 12. Suggested Navigation

Keep navigation simple.

Recommended early navigation:

```text
Home
Add
Timeline
Collections
Sparks
Search
```

Alternative:

```text
Today
Add
Timeline
Places
Collections
Search
```

Avoid putting Graph in the main navigation early.

Avoid making the user choose a “mode” before they know what they want to explore.

---

## 13. MVP Scope

The simplest MVP that preserves the long-term vision:

```text
Add Record
Record Detail Page
Timeline View
Basic Place View
Collections
Search
Optional Sparks
```

### MVP Record Types

Start with:

```text
Person
Event
Place
Object
Note
```

### MVP Record Fields

```text
Title
Type
When
Where
Short summary
Why it matters / why it caught my attention
Optional source
Tags
```

### MVP Rules

- Records must be quick to create.
- Records must be short.
- Sources are optional.
- Connections are optional or deferred.
- No graph view in v1.
- No formal citation system in v1.
- No collaboration in v1.
- No attempt to pre-populate all of history.
- No Wikipedia-style long articles.
- No Story builder in v1.

---

## 14. Cold Start Strategy

Flint has a cold start risk.

A personal historical memory system becomes more valuable as records accumulate.

To reduce the cold start problem, Flint may include:

- A small curated starter pack
- Example records
- Example Sparks
- Suggested prompts
- “Today I learned” style capture
- Import from user notes later

Starter packs should be small and curated.

Do not try to preload all of history.

Possible starter packs:

- Roman Republic
- World War I
- Age of Exploration
- Philippine Revolution
- New Zealand history
- Silk Road
- Ancient tools and materials
- Empires and trade routes

The goal of starter content is to demonstrate the feeling of Flint, not to become an encyclopedia.

---

## 15. Tone and Writing Style

Flint’s content should be:

- Short
- Precise
- Calm
- Clear
- Dense but readable
- Easy to absorb
- Non-academic unless needed
- Personal-learning friendly

Avoid:

- Long essays
- Overly formal academic prose
- Citation-heavy presentation
- Generic AI summaries
- Unstructured note dumps
- Shallow trivia

Each record should answer:

```text
What is this?
When and where does it belong?
Why does it matter?
Why did I save it?
```

---

## 16. Product Risks

### Risk 1: Record creation feels like a form

This is the biggest risk.

If capture feels heavy, the user stops adding records.

Without records, there are no Sparks.

### Risk 2: Flint becomes Wikipedia

Avoid exhaustive articles.

Flint is for personal understanding, not complete reference.

### Risk 3: Sources become noise

Sources should be available but not intrusive.

Do not make every record feel like an academic citation task.

### Risk 4: Graph view distracts the product

A graph is visually tempting but not the core.

Build it only after records, timeline, place, and Sparks are useful.

### Risk 5: Ideas create scope creep

Formal Idea records are powerful but messy.

Keep ideas in Notes or tags early.

### Risk 6: Too much structure kills capture

The system needs structure underneath, but the surface must stay light.

Structured underneath. Effortless on the surface.

### Risk 7: Too little structure kills discovery

If records have no time, place, type, or tags, Sparks become weak.

The app must quietly capture enough structure to support future discovery.

---

## 17. Long-Term Direction

Flint may eventually support:

- Suggested Sparks
- Confirmed connections
- Historical overlap detection
- Map-based browsing
- Graph navigation
- Story creation
- Learning trails
- Source collections
- Import from books, articles, videos, and notes
- Personal review prompts
- “What did I learn this month?” summaries
- Topic packs
- Era packs
- Object-focused historical trails

But the foundation must remain simple:

```text
Capture small records.
Anchor them in time and place.
Let sparks emerge.
```

---

## 18. Non-Negotiable Principles

1. Flint helps you collect small sparks of history until something catches fire.
2. The record is the atomic unit of Flint.
3. Adding a record must feel like jotting in a notebook, not filling out a form.
4. Records should be short, precise, and absorbable.
5. Time is the primary anchor.
6. Place is the secondary anchor.
7. Sources are quiet and optional.
8. Connections are discovered, not required.
9. Sparks are suggestions, not obligations.
10. Graph view is not the product.
11. Story-building is not v1.
12. Flint is for personal learning first.
13. Do not build Wikipedia.
14. Do not over-structure the capture experience.
15. Structured underneath. Effortless on the surface.

---

## 19. One-Sentence Product Definition

**Flint is a personal history-learning tool for capturing short, time-anchored records about people, places, events, objects, and observations, so hidden patterns and connections can reveal themselves over time.**

---

## 20. Brand Line

**Collect the sparks. Discover the fire.**
