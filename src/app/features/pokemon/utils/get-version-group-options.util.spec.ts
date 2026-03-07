import { getVersionGroupOptions } from './get-version-group-options.util';

describe('getVersionGroupOptions', () => {
  const versionGroups: any[] = [
    {
      name: 'red-blue',
      formattedName: 'Red/Blue',
      pokedexes: [{ name: 'kanto', formattedName: 'Kanto' }],
    },
    {
      name: 'gold-silver',
      formattedName: 'Gold/Silver',
      pokedexes: [{ name: 'johto', formattedName: 'Johto' }],
    },
  ];

  it('returns current route option when pokemon/species data is unavailable', () => {
    const result = getVersionGroupOptions({
      versionGroups: versionGroups as any,
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
    const selectedPokemon: any = {
      moves: [
        { version_group_details: [{ version_group: { name: 'red-blue' } }] },
        { version_group_details: [{ version_group: { name: 'gold-silver' } }] },
      ],
    };
    const speciesDetails: any = {
      pokedex_numbers: [{ pokedex: { name: 'kanto' } }],
    };

    const result = getVersionGroupOptions({
      versionGroups: versionGroups as any,
      selectedPokemon,
      speciesDetails,
      currentVersionGroupName: 'red-blue',
      currentPokedexName: 'kanto',
    });

    expect(result).toHaveLength(1);
    expect(result[0].versionGroupName).toBe('red-blue');
  });

  it('prepends current route option when not in computed intersections', () => {
    const selectedPokemon: any = {
      moves: [{ version_group_details: [{ version_group: { name: 'gold-silver' } }] }],
    };
    const speciesDetails: any = {
      pokedex_numbers: [{ pokedex: { name: 'johto' } }],
    };

    const result = getVersionGroupOptions({
      versionGroups: versionGroups as any,
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
