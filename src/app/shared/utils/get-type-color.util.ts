export function getPokemonTypeColor(typeName: string): string {
  const typeColors: { [key: string]: string } = {
    normal: "#6D6D4E",
    fire: "#B22222",
    water: "#1E90FF",
    electric: "#B8860B",
    grass: "#228B22",
    ice: "#4682B4",
    fighting: "#8B0000",
    poison: "#8A2BE2",
    ground: "#8B4513",
    flying: "#6A5ACD",
    psychic: "#8B008B",
    bug: "#556B2F",
    rock: "#8B4513",
    ghost: "#4B0082",
    dragon: "#4B0082",
    dark: "#2F4F4F",
    steel: "#708090",
    fairy: "#C71585",
    unknown: "#556B2F",
    shadow: "#556B2F",
  };

  return typeColors[typeName.toLowerCase()] || typeColors["unknown"];
}
