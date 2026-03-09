import { StoredVersionGroup } from '../../../core/interfaces/stored-version-group.interface';
import type { Pokemon, PokemonSpecies } from '../../../shared/interfaces/pokeapi';

export interface PokemonVersionGroupOption {
  versionGroupName: string;
  versionGroupFormattedName: string;
  pokedexName: string;
  pokedexFormattedName: string;
}

interface GetVersionGroupOptionsParams {
  versionGroups: StoredVersionGroup[];
  selectedPokemon: Pick<Pokemon, 'moves'> | undefined;
  speciesDetails: Pick<PokemonSpecies, 'pokedex_numbers'> | undefined;
  currentVersionGroupName: string;
  currentPokedexName: string;
}

export function getVersionGroupOptions({
  versionGroups,
  selectedPokemon,
  speciesDetails,
  currentVersionGroupName,
  currentPokedexName,
}: GetVersionGroupOptionsParams): PokemonVersionGroupOption[] {
  if (!selectedPokemon?.moves?.length || !speciesDetails?.pokedex_numbers?.length) {
    return getCurrentOption(versionGroups, currentVersionGroupName, currentPokedexName);
  }

  const pokemonVersionGroupNames = new Set(
    selectedPokemon.moves.flatMap((move) =>
      move.version_group_details.map((detail) => detail.version_group.name)
    )
  );
  const pokemonPokedexNames = new Set(
    speciesDetails.pokedex_numbers.map((entry) => entry.pokedex.name)
  );

  const options = versionGroups
    .filter((versionGroup) => pokemonVersionGroupNames.has(versionGroup.name))
    .map((versionGroup) => {
      const matchedPokedex = versionGroup.pokedexes.find((pokedex) =>
        pokemonPokedexNames.has(pokedex.name)
      );

      if (!matchedPokedex) {
        return null;
      }

      return {
        versionGroupName: versionGroup.name,
        versionGroupFormattedName: versionGroup.formattedName,
        pokedexName: matchedPokedex.name,
        pokedexFormattedName: matchedPokedex.formattedName,
      };
    })
    .filter((option): option is PokemonVersionGroupOption => option !== null);

  const currentOption = getCurrentOption(
    versionGroups,
    currentVersionGroupName,
    currentPokedexName
  )[0];

  if (
    currentOption &&
    !options.some((option) => option.versionGroupName === currentVersionGroupName)
  ) {
    options.unshift(currentOption);
  }

  return options;
}

function getCurrentOption(
  versionGroups: StoredVersionGroup[],
  currentVersionGroupName: string,
  currentPokedexName: string
): PokemonVersionGroupOption[] {
  if (!currentVersionGroupName || !currentPokedexName) {
    return [];
  }

  const currentVersionGroup = versionGroups.find((entry) => entry.name === currentVersionGroupName);
  const currentPokedex = currentVersionGroup?.pokedexes.find(
    (entry) => entry.name === currentPokedexName
  );

  if (!currentVersionGroup || !currentPokedex) {
    return [];
  }

  return [
    {
      versionGroupName: currentVersionGroup.name,
      versionGroupFormattedName: currentVersionGroup.formattedName,
      pokedexName: currentPokedex.name,
      pokedexFormattedName: currentPokedex.formattedName,
    },
  ];
}
