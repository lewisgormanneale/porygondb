# Copilot Instructions for `porygondb`

## Core Architectural Rules

- Keep Pokémon navigation URL-driven only.
- Canonical routes are:
  - `/pokedex/:versionGroupName/:pokedexName`
  - `/pokedex/:versionGroupName/:pokedexName/:name`
- Do **not** re-introduce session/local storage navigation context for Pokémon prev/next/back behavior.
- Keep `/pokemon/*`-style route patterns out of new code.

## Data & State Patterns

- Prefer cancel-safe reactive flows (`switchMap`, `combineLatest`, `takeUntilDestroyed`) over nested subscriptions.
- Keep async loading streams resilient to rapid param changes.
- Prefer extracted pure utilities for derived view options (e.g. version-group option derivation).

## UI/UX Constraints

- Keep the Pokémon page section-based (summary/details/evolution/stats/moves/locations) and Material-consistent.
- Preserve current ordering decisions already agreed in the project.
- Keep gender ratio visual treatment unchanged unless explicitly requested.

## Testing Standards

- Test runner is **Vitest via Angular unit-test builder** (`ng test`).
- Write tests with native Vitest APIs (`vi.fn`, `vi.spyOn`) and Vitest globals.
- Avoid Jest compatibility shims unless there is an explicit temporary migration reason.
- Keep component specs focused on behavior, route params, and rendering states.
- Tests should use real API-aligned types (`Pokemon`, `PokemonSpecies`, etc.) or `Pick<>`/`Omit<>` derived from them, not ad-hoc duplicated `*Like` shapes.
- Prefer reusable typed mock factories in `src/testing/mocks` with override parameters for complex objects.
- Prefer user-like interaction tests (clicking, typing, DOM events) over directly toggling component internals when practical.
- Use `data-testid` attributes as stable test selectors for interactive elements; avoid styling/class selectors for behavior assertions.

## Type Safety Requirements

- Minimize `as` casts (`as any`, `as unknown as`) in both app code and tests.
- Prefer narrow interfaces, `Pick<>`, and `satisfies` for test doubles.
- If a utility only needs part of a large API type, define a smaller input contract.

## Important Project Takeaways

- Pokedex entries loading supports no-arg pagination calls (`loadPokemonSpecies()`).
- Version-group switching on Pokémon pages must preserve canonical route context.
- Moves section supports method tabs + pagination and must clamp stale page indices.
- Locations section filters by selected version group and must remain cancel-safe.
- Keep test output clean when practical (for example, avoid avoidable framework warnings in specs).
