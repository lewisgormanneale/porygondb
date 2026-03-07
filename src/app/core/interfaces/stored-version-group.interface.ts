import { VersionGroup } from '../../shared/interfaces/pokeapi';

export interface StoredVersionGroup {
  id: number;
  name: string;
  formattedName: string;
  pokedexes: {
    name: string;
    formattedName: string;
  }[];
  versionGroupInformation?: VersionGroup;
}
