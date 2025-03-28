# PorygonDB

Pokédex built using Angular with Angular Material, powered by [PokéAPI](https://pokeapi.co/).

I created this site primarily to get more familiar with two technologies:
- [ngrx/signals](https://ngrx.io/guide/signals) - a reactive state management solution and a set of utilities for Angular Signals
- [Angular Material](https://material.angular.io) - Material Design components for Angular

Given the large amount of data relating to the Pokémon games, the project seemed like a good candidate to explore state management with Signal Stores and how I could implement elements like pagination into that. I explored a lot around [custom store features](https://ngrx.io/guide/signals/signal-store/custom-store-features) as a result. 

As for Angular Material, it was good to get my head around things like how things like style overrides worked with it. Once I [designed my own theme for it](https://material-foundation.github.io/material-theme-builder/), and implemented a Dark/Light Mode toggle, I was generally pretty happy with it as far as component libraries go. I stopped myself from using TailwindCSS for this project, which is normally my go-to, but I didn't want to stray from Material Design principles and tailwind made that a bit too easy. Plus, I don't want my standard CSS knowledge to get rusty.


## View Live
### [https://porygondb.lewisgormanneale.com](https://porygondb.lewisgormanneale.com/pokedex/red-blue)

## Features

- Pokédex Page
    - Switch between Version Groups and see the relevant Pokédexes for those game versions, with Pokémon displayed in that order
    - Pagination for entries, with ability to change pagination size, or go straight to the first/last page.
- Pokémon Page
    - Switch between a Pokémon's forms and see the appropriate information update to reflect any changes
    - Tabs for Pokémon Details and Stats
    - Sortable table for stats - sort by the Pokémon's highest or lowest stats
    - Visualised gender ratio, if abilities are hidden
    - Types are displayed with their associated colour
- Other
    - Theme Toggle (Default theme will be based on system)
    - High contrast modes supported

## Run Locally

Clone the project

```bash
  git clone https://github.com/lewisgormanneale/porygondb.git
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

## Screenshots
![image](https://github.com/user-attachments/assets/dadf382e-d4d0-44a6-bb75-2a24bcc406cd)
![image](https://github.com/user-attachments/assets/bce689d1-4885-4d59-8933-7ac09cdf6f23)
![image](https://github.com/user-attachments/assets/a29f4c1a-ed9b-40d9-9049-ac7293714d58)

## Future Roadmap

As said above, this project was mainly done to get my head around signal stores and Angular Material. However, if I want more practice in these areas, or just fancy coming back to this project, there's plenty of additional features I'd like to add:
- Additional Pokémon information - evolution trees, movesets, locations, and so on. (PokéAPI makes it hard to retrieve a lot of this information efficiently without using something like the rate-restricted GraphQL API, so I stayed away from being too ambitous here).
- Toggles to see things like shiny sprites on the Pokédex/Pokémon pages.
- A way to save favourite Pokémon, or even a team builder.
- A lot more tests, especially as I'm still getting my head around unit testing signal stores at work.
