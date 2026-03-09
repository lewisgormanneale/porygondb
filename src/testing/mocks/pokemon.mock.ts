import type { Pokemon, PokemonSpecies } from '../../app/shared/interfaces/pokeapi';

export function createPokemonMock(overrides: Partial<Pokemon> = {}): Pokemon {
  const base: Pokemon = {
    id: 1,
    name: 'bulbasaur',
    base_experience: 64,
    height: 7,
    is_default: true,
    order: 1,
    weight: 69,
    abilities: [
      {
        ability: { name: 'overgrow', url: 'https://pokeapi.co/api/v2/ability/65/' },
        is_hidden: false,
        slot: 1,
      },
    ],
    forms: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-form/1/' }],
    game_indices: [],
    held_items: [],
    location_area_encounters: 'https://pokeapi.co/api/v2/pokemon/1/encounters',
    moves: [],
    species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
    sprites: {
      front_default:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      front_shiny: null,
      front_female: null,
      front_shiny_female: null,
      back_default: null,
      back_shiny: null,
      back_female: null,
      back_shiny_female: null,
      other: {
        home: {
          front_default:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/1.png',
          front_female: null,
          front_shiny: null,
          front_shiny_female: null,
        },
      },
    },
    stats: [],
    types: [],
    past_types: [],
  };

  return {
    ...base,
    ...overrides,
  };
}

export function createPokemonSpeciesMock(overrides: Partial<PokemonSpecies> = {}): PokemonSpecies {
  const base: PokemonSpecies = {
    id: 1,
    name: 'bulbasaur',
    order: 1,
    gender_rate: 1,
    capture_rate: 45,
    base_happiness: 50,
    is_baby: false,
    is_legendary: false,
    is_mythical: false,
    hatch_counter: 20,
    has_gender_differences: false,
    forms_switchable: false,
    growth_rate: { name: 'medium-slow', url: 'https://pokeapi.co/api/v2/growth-rate/4/' },
    pokedex_numbers: [
      {
        entry_number: 1,
        pokedex: { name: 'kanto', url: 'https://pokeapi.co/api/v2/pokedex/2/' },
      },
    ],
    egg_groups: [{ name: 'monster', url: 'https://pokeapi.co/api/v2/egg-group/1/' }],
    color: { name: 'green', url: 'https://pokeapi.co/api/v2/pokemon-color/5/' },
    shape: { name: 'quadruped', url: 'https://pokeapi.co/api/v2/pokemon-shape/8/' },
    evolves_from_species: null,
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
    habitat: { name: 'grassland', url: 'https://pokeapi.co/api/v2/pokemon-habitat/3/' },
    generation: { name: 'generation-i', url: 'https://pokeapi.co/api/v2/generation/1/' },
    names: [
      { name: 'Bulbasaur', language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' } },
    ],
    flavor_text_entries: [],
    form_descriptions: [],
    genera: [
      {
        genus: 'Seed Pokémon',
        language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
      },
    ],
    varieties: [
      {
        is_default: true,
        pokemon: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      },
    ],
  };

  return {
    ...base,
    ...overrides,
  };
}
