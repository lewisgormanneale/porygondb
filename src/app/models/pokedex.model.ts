export interface PokedexResponse {
    count: number;
    next: string;
    previous: string | null;
    results: PokedexResult[];
}

export interface PokedexResult {
    name: string;
    url: string;
}
