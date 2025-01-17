export interface PokedexResponse {
    count: number;
    next: string;
    previous: string | null;
    results: PokedexResult[];
}

export interface PokedexResult {
    name: string;
    url: string;
    details?: PokemonDetails;
}


export interface PokemonDetails {
    id: number;
    name: string;
    sprites: {
        front_default: string;
    };
    // Add other properties as needed
}