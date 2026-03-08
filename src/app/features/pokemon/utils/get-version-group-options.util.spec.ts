import { getVersionGroupOptions } from './get-version-group-options.util';
import type { StoredVersionGroup } from '../../../core/interfaces/stored-version-group.interface';
import type { Pokemon, PokemonSpecies } from '../../../shared/interfaces/pokeapi';

describe('getVersionGroupOptions', () => {
  const versionGroups: StoredVersionGroup[] = [
    {
      name: 'red-blue',
      formattedName: 'Red/Blue',
      pokedexes: [{ name: 'kanto', formattedName: 'Kanto' }],
      id: 1,
    },
    {
      name: 'gold-silver',
      formattedName: 'Gold/Silver',
      pokedexes: [{ name: 'johto', formattedName: 'Johto' }],
      id: 2,
    },
  ];

  it('returns current route option when pokemon/species data is unavailable', () => {
    const result = getVersionGroupOptions({
      versionGroups,
      selectedPokemon: undefined,
      speciesDetails: undefined,
      currentVersionGroupName: 'red-blue',
      currentPokedexName: 'kanto',
    });

    expect(result).toEqual([
      {
        versionGroupName: 'red-blue',
        versionGroupFormattedName: 'Red/Blue',
        pokedexName: 'kanto',
        pokedexFormattedName: 'Kanto',
      },
    ]);
  });

  it('builds options from move and pokedex intersections', () => {
    const selectedPokemon: Pick<Pokemon, 'moves'> = {
      moves: [
        {
          move: { name: 'tackle', url: 'https://pokeapi.co/api/v2/move/33/' },
          version_group_details: [
            {
              version_group: {
                name: 'red-blue',
                url: 'https://pokeapi.co/api/v2/version-group/1/',
              },
              move_learn_method: {
                name: 'level-up',
                url: 'https://pokeapi.co/api/v2/move-learn-method/1/',
              },
              level_learned_at: 1,
            },
          ],
        },
        {
          move: { name: 'growl', url: 'https://pokeapi.co/api/v2/move/45/' },
          version_group_details: [
            {
              version_group: {
                name: 'gold-silver',
                url: 'https://pokeapi.co/api/v2/version-group/3/',
              },
              move_learn_method: {
                name: 'level-up',
                url: 'https://pokeapi.co/api/v2/move-learn-method/1/',
              },
              level_learned_at: 3,
            },
          ],
        },
      ],
    };
    const speciesDetails: Pick<PokemonSpecies, 'pokedex_numbers'> = {
      pokedex_numbers: [
        {
          entry_number: 1,
          pokedex: { name: 'kanto', url: 'https://pokeapi.co/api/v2/pokedex/2/' },
        },
      ],
    };

    const result = getVersionGroupOptions({
      versionGroups,
      selectedPokemon,
      speciesDetails,
      currentVersionGroupName: 'red-blue',
      currentPokedexName: 'kanto',
    });

    expect(result).toHaveLength(1);
    expect(result[0].versionGroupName).toBe('red-blue');
  });

  it('prepends current route option when not in computed intersections', () => {
    const selectedPokemon: Pick<Pokemon, 'moves'> = {
      moves: [
        {
          move: { name: 'growl', url: 'https://pokeapi.co/api/v2/move/45/' },
          version_group_details: [
            {
              version_group: {
                name: 'gold-silver',
                url: 'https://pokeapi.co/api/v2/version-group/3/',
              },
              move_learn_method: {
                name: 'level-up',
                url: 'https://pokeapi.co/api/v2/move-learn-method/1/',
              },
              level_learned_at: 3,
            },
          ],
        },
      ],
    };
    const speciesDetails: Pick<PokemonSpecies, 'pokedex_numbers'> = {
      pokedex_numbers: [
        {
          entry_number: 152,
          pokedex: { name: 'johto', url: 'https://pokeapi.co/api/v2/pokedex/7/' },
        },
      ],
    };

    const result = getVersionGroupOptions({
      versionGroups,
      selectedPokemon,
      speciesDetails,
      currentVersionGroupName: 'red-blue',
      currentPokedexName: 'kanto',
    });

    expect(result[0]).toMatchObject({
      versionGroupName: 'red-blue',
      pokedexName: 'kanto',
    });
    expect(result[1]).toMatchObject({
      versionGroupName: 'gold-silver',
      pokedexName: 'johto',
    });
  });
});
