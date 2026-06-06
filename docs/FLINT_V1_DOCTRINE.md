# Flint V1 Doctrine

The record is the app.

This document is the strict implementation authority for Flint V1. When product vision and V1 doctrine conflict, V1 doctrine wins.

## V1 Product Shape

Flint V1 has only three screens:

- Add
- List
- Detail

Flint V1 has one table/object:

- Record

Build the capture habit first. Every V1 decision should make adding and rereading a record feel lighter, not more structured.

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

`when` and `where` are plain text. V1 does not parse, normalize, split, geocode, or otherwise structure them.

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

The only V1 test:

> Does adding a record feel like jotting in a notebook?

If yes, ship it.
If no, simplify.

## Deferred / Do Not Build in V1

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
