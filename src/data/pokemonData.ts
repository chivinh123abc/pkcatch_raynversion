import { CombatEffect, PokemonSpecies, PokemonStats, PokemonType } from '../types/game';
import { getTypeMultiplier } from './typeChart';

export const POKEMON_SPECIES_MAP: Record<number, PokemonSpecies> = {
  1: {
    id: 1,
    name: "Bulbasaur",
    types: ["Grass","Poison"],
    baseStats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
    catchRate: 45,
    baseExp: 64,
    evolvesTo: {"speciesId":2,"level":16}
  },
  2: {
    id: 2,
    name: "Ivysaur",
    types: ["Grass","Poison"],
    baseStats: { hp: 60, attack: 62, defense: 63, spAttack: 80, spDefense: 80, speed: 60 },
    catchRate: 45,
    baseExp: 142,
    evolvesTo: {"speciesId":3,"level":32}
  },
  3: {
    id: 3,
    name: "Venusaur",
    types: ["Grass","Poison"],
    baseStats: { hp: 80, attack: 82, defense: 83, spAttack: 100, spDefense: 100, speed: 80 },
    catchRate: 45,
    baseExp: 236
  },
  4: {
    id: 4,
    name: "Charmander",
    types: ["Fire"],
    baseStats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
    catchRate: 45,
    baseExp: 62,
    evolvesTo: {"speciesId":5,"level":16}
  },
  5: {
    id: 5,
    name: "Charmeleon",
    types: ["Fire"],
    baseStats: { hp: 58, attack: 64, defense: 58, spAttack: 80, spDefense: 65, speed: 80 },
    catchRate: 45,
    baseExp: 142,
    evolvesTo: {"speciesId":6,"level":36}
  },
  6: {
    id: 6,
    name: "Charizard",
    types: ["Fire","Flying"],
    baseStats: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 },
    catchRate: 45,
    baseExp: 240
  },
  7: {
    id: 7,
    name: "Squirtle",
    types: ["Water"],
    baseStats: { hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 },
    catchRate: 45,
    baseExp: 63,
    evolvesTo: {"speciesId":8,"level":16}
  },
  8: {
    id: 8,
    name: "Wartortle",
    types: ["Water"],
    baseStats: { hp: 59, attack: 63, defense: 80, spAttack: 65, spDefense: 80, speed: 58 },
    catchRate: 45,
    baseExp: 142,
    evolvesTo: {"speciesId":9,"level":36}
  },
  9: {
    id: 9,
    name: "Blastoise",
    types: ["Water"],
    baseStats: { hp: 79, attack: 83, defense: 100, spAttack: 85, spDefense: 105, speed: 78 },
    catchRate: 45,
    baseExp: 239
  },
  10: {
    id: 10,
    name: "Caterpie",
    types: ["Bug"],
    baseStats: { hp: 45, attack: 30, defense: 35, spAttack: 20, spDefense: 20, speed: 45 },
    catchRate: 255,
    baseExp: 39,
    evolvesTo: {"speciesId":11,"level":7}
  },
  11: {
    id: 11,
    name: "Metapod",
    types: ["Bug"],
    baseStats: { hp: 50, attack: 20, defense: 55, spAttack: 25, spDefense: 25, speed: 30 },
    catchRate: 120,
    baseExp: 72,
    evolvesTo: {"speciesId":12,"level":10}
  },
  12: {
    id: 12,
    name: "Butterfree",
    types: ["Bug","Flying"],
    baseStats: { hp: 60, attack: 45, defense: 50, spAttack: 90, spDefense: 80, speed: 70 },
    catchRate: 45,
    baseExp: 178
  },
  13: {
    id: 13,
    name: "Weedle",
    types: ["Bug","Poison"],
    baseStats: { hp: 40, attack: 35, defense: 30, spAttack: 20, spDefense: 20, speed: 50 },
    catchRate: 255,
    baseExp: 39,
    evolvesTo: {"speciesId":14,"level":7}
  },
  14: {
    id: 14,
    name: "Kakuna",
    types: ["Bug","Poison"],
    baseStats: { hp: 45, attack: 25, defense: 50, spAttack: 25, spDefense: 25, speed: 35 },
    catchRate: 120,
    baseExp: 72,
    evolvesTo: {"speciesId":15,"level":10}
  },
  15: {
    id: 15,
    name: "Beedrill",
    types: ["Bug","Poison"],
    baseStats: { hp: 65, attack: 90, defense: 40, spAttack: 45, spDefense: 80, speed: 75 },
    catchRate: 45,
    baseExp: 178
  },
  16: {
    id: 16,
    name: "Pidgey",
    types: ["Normal","Flying"],
    baseStats: { hp: 40, attack: 45, defense: 40, spAttack: 35, spDefense: 35, speed: 56 },
    catchRate: 255,
    baseExp: 50,
    evolvesTo: {"speciesId":17,"level":18}
  },
  17: {
    id: 17,
    name: "Pidgeotto",
    types: ["Normal","Flying"],
    baseStats: { hp: 63, attack: 60, defense: 55, spAttack: 50, spDefense: 50, speed: 71 },
    catchRate: 120,
    baseExp: 122,
    evolvesTo: {"speciesId":18,"level":36}
  },
  18: {
    id: 18,
    name: "Pidgeot",
    types: ["Normal","Flying"],
    baseStats: { hp: 83, attack: 80, defense: 75, spAttack: 70, spDefense: 70, speed: 101 },
    catchRate: 45,
    baseExp: 216
  },
  19: {
    id: 19,
    name: "Rattata",
    types: ["Normal"],
    baseStats: { hp: 30, attack: 56, defense: 35, spAttack: 25, spDefense: 35, speed: 72 },
    catchRate: 255,
    baseExp: 51,
    evolvesTo: {"speciesId":20,"level":20}
  },
  20: {
    id: 20,
    name: "Raticate",
    types: ["Normal"],
    baseStats: { hp: 55, attack: 81, defense: 60, spAttack: 50, spDefense: 70, speed: 97 },
    catchRate: 127,
    baseExp: 145
  },
  21: {
    id: 21,
    name: "Spearow",
    types: ["Normal","Flying"],
    baseStats: { hp: 40, attack: 60, defense: 30, spAttack: 31, spDefense: 31, speed: 70 },
    catchRate: 255,
    baseExp: 52,
    evolvesTo: {"speciesId":22,"level":20}
  },
  22: {
    id: 22,
    name: "Fearow",
    types: ["Normal","Flying"],
    baseStats: { hp: 65, attack: 90, defense: 65, spAttack: 61, spDefense: 61, speed: 100 },
    catchRate: 90,
    baseExp: 155
  },
  23: {
    id: 23,
    name: "Ekans",
    types: ["Poison"],
    baseStats: { hp: 35, attack: 60, defense: 44, spAttack: 40, spDefense: 54, speed: 55 },
    catchRate: 255,
    baseExp: 58,
    evolvesTo: {"speciesId":24,"level":22}
  },
  24: {
    id: 24,
    name: "Arbok",
    types: ["Poison"],
    baseStats: { hp: 60, attack: 95, defense: 69, spAttack: 65, spDefense: 79, speed: 80 },
    catchRate: 90,
    baseExp: 157
  },
  25: {
    id: 25,
    name: "Pikachu",
    types: ["Electric"],
    baseStats: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 },
    catchRate: 190,
    baseExp: 112,
    evolvesTo: {"speciesId":26,"level":30}
  },
  26: {
    id: 26,
    name: "Raichu",
    types: ["Electric"],
    baseStats: { hp: 60, attack: 90, defense: 55, spAttack: 90, spDefense: 80, speed: 110 },
    catchRate: 75,
    baseExp: 218
  },
  27: {
    id: 27,
    name: "Sandshrew",
    types: ["Ground"],
    baseStats: { hp: 50, attack: 75, defense: 85, spAttack: 20, spDefense: 30, speed: 40 },
    catchRate: 255,
    baseExp: 60,
    evolvesTo: {"speciesId":28,"level":22}
  },
  28: {
    id: 28,
    name: "Sandslash",
    types: ["Ground"],
    baseStats: { hp: 75, attack: 100, defense: 110, spAttack: 45, spDefense: 55, speed: 65 },
    catchRate: 90,
    baseExp: 158
  },
  29: {
    id: 29,
    name: "Nidoran♀",
    types: ["Poison"],
    baseStats: { hp: 55, attack: 47, defense: 52, spAttack: 40, spDefense: 40, speed: 41 },
    catchRate: 235,
    baseExp: 55,
    evolvesTo: {"speciesId":30,"level":16}
  },
  30: {
    id: 30,
    name: "Nidorina",
    types: ["Poison"],
    baseStats: { hp: 70, attack: 62, defense: 67, spAttack: 55, spDefense: 55, speed: 56 },
    catchRate: 120,
    baseExp: 128,
    evolvesTo: {"speciesId":31,"level":36}
  },
  31: {
    id: 31,
    name: "Nidoqueen",
    types: ["Poison","Ground"],
    baseStats: { hp: 90, attack: 92, defense: 87, spAttack: 75, spDefense: 85, speed: 76 },
    catchRate: 45,
    baseExp: 227
  },
  32: {
    id: 32,
    name: "Nidoran♂",
    types: ["Poison"],
    baseStats: { hp: 46, attack: 57, defense: 40, spAttack: 40, spDefense: 40, speed: 50 },
    catchRate: 235,
    baseExp: 55,
    evolvesTo: {"speciesId":33,"level":16}
  },
  33: {
    id: 33,
    name: "Nidorino",
    types: ["Poison"],
    baseStats: { hp: 61, attack: 72, defense: 57, spAttack: 55, spDefense: 55, speed: 65 },
    catchRate: 120,
    baseExp: 128,
    evolvesTo: {"speciesId":34,"level":36}
  },
  34: {
    id: 34,
    name: "Nidoking",
    types: ["Poison","Ground"],
    baseStats: { hp: 81, attack: 102, defense: 77, spAttack: 85, spDefense: 75, speed: 85 },
    catchRate: 45,
    baseExp: 227
  },
  35: {
    id: 35,
    name: "Clefairy",
    types: ["Fairy"],
    baseStats: { hp: 70, attack: 45, defense: 48, spAttack: 60, spDefense: 65, speed: 35 },
    catchRate: 150,
    baseExp: 113
  },
  36: {
    id: 36,
    name: "Clefable",
    types: ["Fairy"],
    baseStats: { hp: 95, attack: 70, defense: 73, spAttack: 95, spDefense: 90, speed: 60 },
    catchRate: 25,
    baseExp: 217
  },
  37: {
    id: 37,
    name: "Vulpix",
    types: ["Fire"],
    baseStats: { hp: 38, attack: 41, defense: 40, spAttack: 50, spDefense: 65, speed: 65 },
    catchRate: 190,
    baseExp: 60
  },
  38: {
    id: 38,
    name: "Ninetales",
    types: ["Fire"],
    baseStats: { hp: 73, attack: 76, defense: 75, spAttack: 81, spDefense: 100, speed: 100 },
    catchRate: 75,
    baseExp: 177
  },
  39: {
    id: 39,
    name: "Jigglypuff",
    types: ["Normal","Fairy"],
    baseStats: { hp: 115, attack: 45, defense: 20, spAttack: 45, spDefense: 25, speed: 20 },
    catchRate: 170,
    baseExp: 95
  },
  40: {
    id: 40,
    name: "Wigglytuff",
    types: ["Normal","Fairy"],
    baseStats: { hp: 140, attack: 70, defense: 45, spAttack: 85, spDefense: 50, speed: 45 },
    catchRate: 50,
    baseExp: 196
  },
  41: {
    id: 41,
    name: "Zubat",
    types: ["Poison","Flying"],
    baseStats: { hp: 40, attack: 45, defense: 35, spAttack: 30, spDefense: 40, speed: 55 },
    catchRate: 255,
    baseExp: 49,
    evolvesTo: {"speciesId":42,"level":22}
  },
  42: {
    id: 42,
    name: "Golbat",
    types: ["Poison","Flying"],
    baseStats: { hp: 75, attack: 80, defense: 70, spAttack: 65, spDefense: 75, speed: 90 },
    catchRate: 90,
    baseExp: 159
  },
  43: {
    id: 43,
    name: "Oddish",
    types: ["Grass","Poison"],
    baseStats: { hp: 45, attack: 50, defense: 55, spAttack: 75, spDefense: 65, speed: 30 },
    catchRate: 255,
    baseExp: 64,
    evolvesTo: {"speciesId":44,"level":21}
  },
  44: {
    id: 44,
    name: "Gloom",
    types: ["Grass","Poison"],
    baseStats: { hp: 60, attack: 65, defense: 70, spAttack: 85, spDefense: 75, speed: 40 },
    catchRate: 120,
    baseExp: 138,
    evolvesTo: {"speciesId":45,"level":36}
  },
  45: {
    id: 45,
    name: "Vileplume",
    types: ["Grass","Poison"],
    baseStats: { hp: 75, attack: 80, defense: 85, spAttack: 110, spDefense: 90, speed: 50 },
    catchRate: 45,
    baseExp: 221
  },
  46: {
    id: 46,
    name: "Paras",
    types: ["Bug","Grass"],
    baseStats: { hp: 35, attack: 70, defense: 55, spAttack: 45, spDefense: 55, speed: 25 },
    catchRate: 190,
    baseExp: 57,
    evolvesTo: {"speciesId":47,"level":24}
  },
  47: {
    id: 47,
    name: "Parasect",
    types: ["Bug","Grass"],
    baseStats: { hp: 60, attack: 95, defense: 80, spAttack: 60, spDefense: 80, speed: 30 },
    catchRate: 75,
    baseExp: 142
  },
  48: {
    id: 48,
    name: "Venonat",
    types: ["Bug","Poison"],
    baseStats: { hp: 60, attack: 55, defense: 50, spAttack: 40, spDefense: 55, speed: 45 },
    catchRate: 190,
    baseExp: 61,
    evolvesTo: {"speciesId":49,"level":31}
  },
  49: {
    id: 49,
    name: "Venomoth",
    types: ["Bug","Poison"],
    baseStats: { hp: 70, attack: 65, defense: 60, spAttack: 90, spDefense: 75, speed: 90 },
    catchRate: 75,
    baseExp: 158
  },
  50: {
    id: 50,
    name: "Diglett",
    types: ["Ground"],
    baseStats: { hp: 10, attack: 55, defense: 25, spAttack: 35, spDefense: 45, speed: 95 },
    catchRate: 255,
    baseExp: 53,
    evolvesTo: {"speciesId":51,"level":26}
  },
  51: {
    id: 51,
    name: "Dugtrio",
    types: ["Ground"],
    baseStats: { hp: 35, attack: 100, defense: 50, spAttack: 50, spDefense: 70, speed: 120 },
    catchRate: 50,
    baseExp: 149
  },
  52: {
    id: 52,
    name: "Meowth",
    types: ["Normal"],
    baseStats: { hp: 40, attack: 45, defense: 35, spAttack: 40, spDefense: 40, speed: 90 },
    catchRate: 255,
    baseExp: 58,
    evolvesTo: {"speciesId":53,"level":28}
  },
  53: {
    id: 53,
    name: "Persian",
    types: ["Normal"],
    baseStats: { hp: 65, attack: 70, defense: 60, spAttack: 65, spDefense: 65, speed: 115 },
    catchRate: 90,
    baseExp: 154
  },
  54: {
    id: 54,
    name: "Psyduck",
    types: ["Water"],
    baseStats: { hp: 50, attack: 52, defense: 48, spAttack: 65, spDefense: 50, speed: 55 },
    catchRate: 190,
    baseExp: 64,
    evolvesTo: {"speciesId":55,"level":33}
  },
  55: {
    id: 55,
    name: "Golduck",
    types: ["Water"],
    baseStats: { hp: 80, attack: 82, defense: 78, spAttack: 95, spDefense: 80, speed: 85 },
    catchRate: 75,
    baseExp: 175
  },
  56: {
    id: 56,
    name: "Mankey",
    types: ["Fighting"],
    baseStats: { hp: 40, attack: 80, defense: 35, spAttack: 35, spDefense: 45, speed: 70 },
    catchRate: 190,
    baseExp: 61,
    evolvesTo: {"speciesId":57,"level":28}
  },
  57: {
    id: 57,
    name: "Primeape",
    types: ["Fighting"],
    baseStats: { hp: 65, attack: 105, defense: 60, spAttack: 60, spDefense: 70, speed: 95 },
    catchRate: 75,
    baseExp: 159
  },
  58: {
    id: 58,
    name: "Growlithe",
    types: ["Fire"],
    baseStats: { hp: 55, attack: 70, defense: 45, spAttack: 70, spDefense: 50, speed: 60 },
    catchRate: 190,
    baseExp: 70
  },
  59: {
    id: 59,
    name: "Arcanine",
    types: ["Fire"],
    baseStats: { hp: 90, attack: 110, defense: 80, spAttack: 100, spDefense: 80, speed: 95 },
    catchRate: 75,
    baseExp: 213
  },
  60: {
    id: 60,
    name: "Poliwag",
    types: ["Water"],
    baseStats: { hp: 40, attack: 50, defense: 40, spAttack: 40, spDefense: 40, speed: 90 },
    catchRate: 255,
    baseExp: 60,
    evolvesTo: {"speciesId":61,"level":25}
  },
  61: {
    id: 61,
    name: "Poliwhirl",
    types: ["Water"],
    baseStats: { hp: 65, attack: 65, defense: 65, spAttack: 50, spDefense: 50, speed: 90 },
    catchRate: 120,
    baseExp: 135
  },
  62: {
    id: 62,
    name: "Poliwrath",
    types: ["Water","Fighting"],
    baseStats: { hp: 90, attack: 95, defense: 95, spAttack: 70, spDefense: 90, speed: 70 },
    catchRate: 45,
    baseExp: 230
  },
  63: {
    id: 63,
    name: "Abra",
    types: ["Psychic"],
    baseStats: { hp: 25, attack: 20, defense: 15, spAttack: 105, spDefense: 55, speed: 90 },
    catchRate: 200,
    baseExp: 62,
    evolvesTo: {"speciesId":64,"level":16}
  },
  64: {
    id: 64,
    name: "Kadabra",
    types: ["Psychic"],
    baseStats: { hp: 40, attack: 35, defense: 30, spAttack: 120, spDefense: 70, speed: 105 },
    catchRate: 100,
    baseExp: 140,
    evolvesTo: {"speciesId":65,"level":36}
  },
  65: {
    id: 65,
    name: "Alakazam",
    types: ["Psychic"],
    baseStats: { hp: 55, attack: 50, defense: 45, spAttack: 135, spDefense: 95, speed: 120 },
    catchRate: 50,
    baseExp: 225
  },
  66: {
    id: 66,
    name: "Machop",
    types: ["Fighting"],
    baseStats: { hp: 70, attack: 80, defense: 50, spAttack: 35, spDefense: 35, speed: 35 },
    catchRate: 180,
    baseExp: 61,
    evolvesTo: {"speciesId":67,"level":28}
  },
  67: {
    id: 67,
    name: "Machoke",
    types: ["Fighting"],
    baseStats: { hp: 80, attack: 100, defense: 70, spAttack: 50, spDefense: 60, speed: 45 },
    catchRate: 90,
    baseExp: 142,
    evolvesTo: {"speciesId":68,"level":36}
  },
  68: {
    id: 68,
    name: "Machamp",
    types: ["Fighting"],
    baseStats: { hp: 90, attack: 130, defense: 80, spAttack: 65, spDefense: 85, speed: 55 },
    catchRate: 45,
    baseExp: 227
  },
  69: {
    id: 69,
    name: "Bellsprout",
    types: ["Grass","Poison"],
    baseStats: { hp: 50, attack: 75, defense: 35, spAttack: 70, spDefense: 30, speed: 40 },
    catchRate: 255,
    baseExp: 60,
    evolvesTo: {"speciesId":70,"level":21}
  },
  70: {
    id: 70,
    name: "Weepinbell",
    types: ["Grass","Poison"],
    baseStats: { hp: 65, attack: 90, defense: 50, spAttack: 85, spDefense: 45, speed: 55 },
    catchRate: 120,
    baseExp: 137,
    evolvesTo: {"speciesId":71,"level":36}
  },
  71: {
    id: 71,
    name: "Victreebel",
    types: ["Grass","Poison"],
    baseStats: { hp: 80, attack: 105, defense: 65, spAttack: 100, spDefense: 70, speed: 70 },
    catchRate: 45,
    baseExp: 221
  },
  72: {
    id: 72,
    name: "Tentacool",
    types: ["Water","Poison"],
    baseStats: { hp: 40, attack: 40, defense: 35, spAttack: 50, spDefense: 100, speed: 70 },
    catchRate: 190,
    baseExp: 67,
    evolvesTo: {"speciesId":73,"level":30}
  },
  73: {
    id: 73,
    name: "Tentacruel",
    types: ["Water","Poison"],
    baseStats: { hp: 80, attack: 70, defense: 65, spAttack: 80, spDefense: 120, speed: 100 },
    catchRate: 60,
    baseExp: 180
  },
  74: {
    id: 74,
    name: "Geodude",
    types: ["Rock","Ground"],
    baseStats: { hp: 40, attack: 80, defense: 100, spAttack: 30, spDefense: 30, speed: 20 },
    catchRate: 255,
    baseExp: 60,
    evolvesTo: {"speciesId":75,"level":25}
  },
  75: {
    id: 75,
    name: "Graveler",
    types: ["Rock","Ground"],
    baseStats: { hp: 55, attack: 95, defense: 115, spAttack: 45, spDefense: 45, speed: 35 },
    catchRate: 120,
    baseExp: 137,
    evolvesTo: {"speciesId":76,"level":36}
  },
  76: {
    id: 76,
    name: "Golem",
    types: ["Rock","Ground"],
    baseStats: { hp: 80, attack: 120, defense: 130, spAttack: 55, spDefense: 65, speed: 45 },
    catchRate: 45,
    baseExp: 223
  },
  77: {
    id: 77,
    name: "Ponyta",
    types: ["Fire"],
    baseStats: { hp: 50, attack: 85, defense: 55, spAttack: 65, spDefense: 65, speed: 90 },
    catchRate: 190,
    baseExp: 82,
    evolvesTo: {"speciesId":78,"level":40}
  },
  78: {
    id: 78,
    name: "Rapidash",
    types: ["Fire"],
    baseStats: { hp: 65, attack: 100, defense: 70, spAttack: 80, spDefense: 80, speed: 105 },
    catchRate: 60,
    baseExp: 175
  },
  79: {
    id: 79,
    name: "Slowpoke",
    types: ["Water","Psychic"],
    baseStats: { hp: 90, attack: 65, defense: 65, spAttack: 40, spDefense: 40, speed: 15 },
    catchRate: 190,
    baseExp: 63,
    evolvesTo: {"speciesId":80,"level":37}
  },
  80: {
    id: 80,
    name: "Slowbro",
    types: ["Water","Psychic"],
    baseStats: { hp: 95, attack: 75, defense: 110, spAttack: 100, spDefense: 80, speed: 30 },
    catchRate: 75,
    baseExp: 172
  },
  81: {
    id: 81,
    name: "Magnemite",
    types: ["Electric","Steel"],
    baseStats: { hp: 25, attack: 35, defense: 70, spAttack: 95, spDefense: 55, speed: 45 },
    catchRate: 190,
    baseExp: 65,
    evolvesTo: {"speciesId":82,"level":30}
  },
  82: {
    id: 82,
    name: "Magneton",
    types: ["Electric","Steel"],
    baseStats: { hp: 50, attack: 60, defense: 95, spAttack: 120, spDefense: 70, speed: 70 },
    catchRate: 60,
    baseExp: 163
  },
  83: {
    id: 83,
    name: "Farfetch'd",
    types: ["Normal","Flying"],
    baseStats: { hp: 52, attack: 90, defense: 55, spAttack: 58, spDefense: 62, speed: 60 },
    catchRate: 45,
    baseExp: 132
  },
  84: {
    id: 84,
    name: "Doduo",
    types: ["Normal","Flying"],
    baseStats: { hp: 35, attack: 85, defense: 45, spAttack: 35, spDefense: 35, speed: 75 },
    catchRate: 190,
    baseExp: 62,
    evolvesTo: {"speciesId":85,"level":31}
  },
  85: {
    id: 85,
    name: "Dodrio",
    types: ["Normal","Flying"],
    baseStats: { hp: 60, attack: 110, defense: 70, spAttack: 60, spDefense: 60, speed: 110 },
    catchRate: 45,
    baseExp: 165
  },
  86: {
    id: 86,
    name: "Seel",
    types: ["Water"],
    baseStats: { hp: 65, attack: 45, defense: 55, spAttack: 45, spDefense: 70, speed: 45 },
    catchRate: 190,
    baseExp: 65,
    evolvesTo: {"speciesId":87,"level":34}
  },
  87: {
    id: 87,
    name: "Dewgong",
    types: ["Water","Ice"],
    baseStats: { hp: 90, attack: 70, defense: 80, spAttack: 70, spDefense: 95, speed: 70 },
    catchRate: 75,
    baseExp: 166
  },
  88: {
    id: 88,
    name: "Grimer",
    types: ["Poison"],
    baseStats: { hp: 80, attack: 80, defense: 50, spAttack: 40, spDefense: 50, speed: 25 },
    catchRate: 190,
    baseExp: 65,
    evolvesTo: {"speciesId":89,"level":38}
  },
  89: {
    id: 89,
    name: "Muk",
    types: ["Poison"],
    baseStats: { hp: 105, attack: 105, defense: 75, spAttack: 65, spDefense: 100, speed: 50 },
    catchRate: 75,
    baseExp: 175
  },
  90: {
    id: 90,
    name: "Shellder",
    types: ["Water"],
    baseStats: { hp: 30, attack: 65, defense: 100, spAttack: 45, spDefense: 25, speed: 40 },
    catchRate: 190,
    baseExp: 61
  },
  91: {
    id: 91,
    name: "Cloyster",
    types: ["Water","Ice"],
    baseStats: { hp: 50, attack: 95, defense: 180, spAttack: 85, spDefense: 45, speed: 70 },
    catchRate: 60,
    baseExp: 184
  },
  92: {
    id: 92,
    name: "Gastly",
    types: ["Ghost","Poison"],
    baseStats: { hp: 30, attack: 35, defense: 30, spAttack: 100, spDefense: 35, speed: 80 },
    catchRate: 190,
    baseExp: 62,
    evolvesTo: {"speciesId":93,"level":25}
  },
  93: {
    id: 93,
    name: "Haunter",
    types: ["Ghost","Poison"],
    baseStats: { hp: 45, attack: 50, defense: 45, spAttack: 115, spDefense: 55, speed: 95 },
    catchRate: 90,
    baseExp: 142,
    evolvesTo: {"speciesId":94,"level":36}
  },
  94: {
    id: 94,
    name: "Gengar",
    types: ["Ghost","Poison"],
    baseStats: { hp: 60, attack: 65, defense: 60, spAttack: 130, spDefense: 75, speed: 110 },
    catchRate: 45,
    baseExp: 225
  },
  95: {
    id: 95,
    name: "Onix",
    types: ["Rock","Ground"],
    baseStats: { hp: 35, attack: 45, defense: 160, spAttack: 30, spDefense: 45, speed: 70 },
    catchRate: 45,
    baseExp: 77
  },
  96: {
    id: 96,
    name: "Drowzee",
    types: ["Psychic"],
    baseStats: { hp: 60, attack: 48, defense: 45, spAttack: 43, spDefense: 90, speed: 42 },
    catchRate: 190,
    baseExp: 66,
    evolvesTo: {"speciesId":97,"level":26}
  },
  97: {
    id: 97,
    name: "Hypno",
    types: ["Psychic"],
    baseStats: { hp: 85, attack: 73, defense: 70, spAttack: 73, spDefense: 115, speed: 67 },
    catchRate: 75,
    baseExp: 169
  },
  98: {
    id: 98,
    name: "Krabby",
    types: ["Water"],
    baseStats: { hp: 30, attack: 105, defense: 90, spAttack: 25, spDefense: 25, speed: 50 },
    catchRate: 225,
    baseExp: 65,
    evolvesTo: {"speciesId":99,"level":28}
  },
  99: {
    id: 99,
    name: "Kingler",
    types: ["Water"],
    baseStats: { hp: 55, attack: 130, defense: 115, spAttack: 50, spDefense: 50, speed: 75 },
    catchRate: 60,
    baseExp: 166
  },
  100: {
    id: 100,
    name: "Voltorb",
    types: ["Electric"],
    baseStats: { hp: 40, attack: 30, defense: 50, spAttack: 55, spDefense: 55, speed: 100 },
    catchRate: 190,
    baseExp: 66,
    evolvesTo: {"speciesId":101,"level":30}
  },
  101: {
    id: 101,
    name: "Electrode",
    types: ["Electric"],
    baseStats: { hp: 60, attack: 50, defense: 70, spAttack: 80, spDefense: 80, speed: 150 },
    catchRate: 60,
    baseExp: 172
  },
  102: {
    id: 102,
    name: "Exeggcute",
    types: ["Grass","Psychic"],
    baseStats: { hp: 60, attack: 40, defense: 80, spAttack: 60, spDefense: 45, speed: 40 },
    catchRate: 90,
    baseExp: 65
  },
  103: {
    id: 103,
    name: "Exeggutor",
    types: ["Grass","Psychic"],
    baseStats: { hp: 95, attack: 95, defense: 85, spAttack: 125, spDefense: 75, speed: 55 },
    catchRate: 45,
    baseExp: 186
  },
  104: {
    id: 104,
    name: "Cubone",
    types: ["Ground"],
    baseStats: { hp: 50, attack: 50, defense: 95, spAttack: 40, spDefense: 50, speed: 35 },
    catchRate: 190,
    baseExp: 64,
    evolvesTo: {"speciesId":105,"level":28}
  },
  105: {
    id: 105,
    name: "Marowak",
    types: ["Ground"],
    baseStats: { hp: 60, attack: 80, defense: 110, spAttack: 50, spDefense: 80, speed: 45 },
    catchRate: 75,
    baseExp: 149
  },
  106: {
    id: 106,
    name: "Hitmonlee",
    types: ["Fighting"],
    baseStats: { hp: 50, attack: 120, defense: 53, spAttack: 35, spDefense: 110, speed: 87 },
    catchRate: 45,
    baseExp: 159
  },
  107: {
    id: 107,
    name: "Hitmonchan",
    types: ["Fighting"],
    baseStats: { hp: 50, attack: 105, defense: 79, spAttack: 35, spDefense: 110, speed: 76 },
    catchRate: 45,
    baseExp: 159
  },
  108: {
    id: 108,
    name: "Lickitung",
    types: ["Normal"],
    baseStats: { hp: 90, attack: 55, defense: 75, spAttack: 60, spDefense: 75, speed: 30 },
    catchRate: 45,
    baseExp: 77
  },
  109: {
    id: 109,
    name: "Koffing",
    types: ["Poison"],
    baseStats: { hp: 40, attack: 65, defense: 95, spAttack: 60, spDefense: 45, speed: 35 },
    catchRate: 190,
    baseExp: 68,
    evolvesTo: {"speciesId":110,"level":35}
  },
  110: {
    id: 110,
    name: "Weezing",
    types: ["Poison"],
    baseStats: { hp: 65, attack: 90, defense: 120, spAttack: 85, spDefense: 70, speed: 60 },
    catchRate: 60,
    baseExp: 172
  },
  111: {
    id: 111,
    name: "Rhyhorn",
    types: ["Ground","Rock"],
    baseStats: { hp: 80, attack: 85, defense: 95, spAttack: 30, spDefense: 30, speed: 25 },
    catchRate: 120,
    baseExp: 69,
    evolvesTo: {"speciesId":112,"level":42}
  },
  112: {
    id: 112,
    name: "Rhydon",
    types: ["Ground","Rock"],
    baseStats: { hp: 105, attack: 130, defense: 120, spAttack: 45, spDefense: 45, speed: 40 },
    catchRate: 60,
    baseExp: 170
  },
  113: {
    id: 113,
    name: "Chansey",
    types: ["Normal"],
    baseStats: { hp: 250, attack: 5, defense: 5, spAttack: 35, spDefense: 105, speed: 50 },
    catchRate: 30,
    baseExp: 395
  },
  114: {
    id: 114,
    name: "Tangela",
    types: ["Grass"],
    baseStats: { hp: 65, attack: 55, defense: 115, spAttack: 100, spDefense: 40, speed: 60 },
    catchRate: 45,
    baseExp: 87
  },
  115: {
    id: 115,
    name: "Kangaskhan",
    types: ["Normal"],
    baseStats: { hp: 105, attack: 95, defense: 80, spAttack: 40, spDefense: 80, speed: 90 },
    catchRate: 45,
    baseExp: 172
  },
  116: {
    id: 116,
    name: "Horsea",
    types: ["Water"],
    baseStats: { hp: 30, attack: 40, defense: 70, spAttack: 70, spDefense: 25, speed: 60 },
    catchRate: 225,
    baseExp: 59,
    evolvesTo: {"speciesId":117,"level":32}
  },
  117: {
    id: 117,
    name: "Seadra",
    types: ["Water"],
    baseStats: { hp: 55, attack: 65, defense: 95, spAttack: 95, spDefense: 45, speed: 85 },
    catchRate: 75,
    baseExp: 154
  },
  118: {
    id: 118,
    name: "Goldeen",
    types: ["Water"],
    baseStats: { hp: 45, attack: 67, defense: 60, spAttack: 35, spDefense: 50, speed: 63 },
    catchRate: 225,
    baseExp: 64,
    evolvesTo: {"speciesId":119,"level":33}
  },
  119: {
    id: 119,
    name: "Seaking",
    types: ["Water"],
    baseStats: { hp: 80, attack: 92, defense: 65, spAttack: 65, spDefense: 80, speed: 68 },
    catchRate: 60,
    baseExp: 158
  },
  120: {
    id: 120,
    name: "Staryu",
    types: ["Water"],
    baseStats: { hp: 30, attack: 45, defense: 55, spAttack: 70, spDefense: 55, speed: 85 },
    catchRate: 225,
    baseExp: 68
  },
  121: {
    id: 121,
    name: "Starmie",
    types: ["Water","Psychic"],
    baseStats: { hp: 60, attack: 75, defense: 85, spAttack: 100, spDefense: 85, speed: 115 },
    catchRate: 60,
    baseExp: 182
  },
  122: {
    id: 122,
    name: "Mr. Mime",
    types: ["Psychic","Fairy"],
    baseStats: { hp: 40, attack: 45, defense: 65, spAttack: 100, spDefense: 120, speed: 90 },
    catchRate: 45,
    baseExp: 161
  },
  123: {
    id: 123,
    name: "Scyther",
    types: ["Bug","Flying"],
    baseStats: { hp: 70, attack: 110, defense: 80, spAttack: 55, spDefense: 80, speed: 105 },
    catchRate: 45,
    baseExp: 100
  },
  124: {
    id: 124,
    name: "Jynx",
    types: ["Ice","Psychic"],
    baseStats: { hp: 65, attack: 50, defense: 35, spAttack: 115, spDefense: 95, speed: 95 },
    catchRate: 45,
    baseExp: 159
  },
  125: {
    id: 125,
    name: "Electabuzz",
    types: ["Electric"],
    baseStats: { hp: 65, attack: 83, defense: 57, spAttack: 95, spDefense: 85, speed: 105 },
    catchRate: 45,
    baseExp: 172
  },
  126: {
    id: 126,
    name: "Magmar",
    types: ["Fire"],
    baseStats: { hp: 65, attack: 95, defense: 57, spAttack: 100, spDefense: 85, speed: 93 },
    catchRate: 45,
    baseExp: 173
  },
  127: {
    id: 127,
    name: "Pinsir",
    types: ["Bug"],
    baseStats: { hp: 65, attack: 125, defense: 100, spAttack: 55, spDefense: 70, speed: 85 },
    catchRate: 45,
    baseExp: 175
  },
  128: {
    id: 128,
    name: "Tauros",
    types: ["Normal"],
    baseStats: { hp: 75, attack: 100, defense: 95, spAttack: 40, spDefense: 70, speed: 110 },
    catchRate: 45,
    baseExp: 172
  },
  129: {
    id: 129,
    name: "Magikarp",
    types: ["Water"],
    baseStats: { hp: 20, attack: 10, defense: 55, spAttack: 15, spDefense: 20, speed: 80 },
    catchRate: 255,
    baseExp: 40,
    evolvesTo: {"speciesId":130,"level":20}
  },
  130: {
    id: 130,
    name: "Gyarados",
    types: ["Water","Flying"],
    baseStats: { hp: 95, attack: 125, defense: 79, spAttack: 60, spDefense: 100, speed: 81 },
    catchRate: 45,
    baseExp: 189
  },
  131: {
    id: 131,
    name: "Lapras",
    types: ["Water","Ice"],
    baseStats: { hp: 130, attack: 85, defense: 80, spAttack: 85, spDefense: 95, speed: 60 },
    catchRate: 45,
    baseExp: 187
  },
  132: {
    id: 132,
    name: "Ditto",
    types: ["Normal"],
    baseStats: { hp: 48, attack: 48, defense: 48, spAttack: 48, spDefense: 48, speed: 48 },
    catchRate: 35,
    baseExp: 101
  },
  133: {
    id: 133,
    name: "Eevee",
    types: ["Normal"],
    baseStats: { hp: 55, attack: 55, defense: 50, spAttack: 45, spDefense: 65, speed: 55 },
    catchRate: 45,
    baseExp: 65
  },
  134: {
    id: 134,
    name: "Vaporeon",
    types: ["Water"],
    baseStats: { hp: 130, attack: 65, defense: 60, spAttack: 110, spDefense: 95, speed: 65 },
    catchRate: 45,
    baseExp: 184
  },
  135: {
    id: 135,
    name: "Jolteon",
    types: ["Electric"],
    baseStats: { hp: 65, attack: 65, defense: 60, spAttack: 110, spDefense: 95, speed: 130 },
    catchRate: 45,
    baseExp: 184
  },
  136: {
    id: 136,
    name: "Flareon",
    types: ["Fire"],
    baseStats: { hp: 65, attack: 130, defense: 60, spAttack: 95, spDefense: 110, speed: 65 },
    catchRate: 45,
    baseExp: 184
  },
  137: {
    id: 137,
    name: "Porygon",
    types: ["Normal"],
    baseStats: { hp: 65, attack: 60, defense: 70, spAttack: 85, spDefense: 75, speed: 40 },
    catchRate: 45,
    baseExp: 79
  },
  138: {
    id: 138,
    name: "Omanyte",
    types: ["Rock","Water"],
    baseStats: { hp: 35, attack: 40, defense: 100, spAttack: 90, spDefense: 55, speed: 35 },
    catchRate: 45,
    baseExp: 71,
    evolvesTo: {"speciesId":139,"level":40}
  },
  139: {
    id: 139,
    name: "Omastar",
    types: ["Rock","Water"],
    baseStats: { hp: 70, attack: 60, defense: 125, spAttack: 115, spDefense: 70, speed: 55 },
    catchRate: 45,
    baseExp: 173
  },
  140: {
    id: 140,
    name: "Kabuto",
    types: ["Rock","Water"],
    baseStats: { hp: 30, attack: 80, defense: 90, spAttack: 55, spDefense: 45, speed: 55 },
    catchRate: 45,
    baseExp: 71,
    evolvesTo: {"speciesId":141,"level":40}
  },
  141: {
    id: 141,
    name: "Kabutops",
    types: ["Rock","Water"],
    baseStats: { hp: 60, attack: 115, defense: 105, spAttack: 65, spDefense: 70, speed: 80 },
    catchRate: 45,
    baseExp: 173
  },
  142: {
    id: 142,
    name: "Aerodactyl",
    types: ["Rock","Flying"],
    baseStats: { hp: 80, attack: 105, defense: 65, spAttack: 60, spDefense: 75, speed: 130 },
    catchRate: 45,
    baseExp: 180
  },
  143: {
    id: 143,
    name: "Snorlax",
    types: ["Normal"],
    baseStats: { hp: 160, attack: 110, defense: 65, spAttack: 65, spDefense: 110, speed: 30 },
    catchRate: 25,
    baseExp: 189
  },
  144: {
    id: 144,
    name: "Articuno",
    types: ["Ice","Flying"],
    baseStats: { hp: 90, attack: 85, defense: 100, spAttack: 95, spDefense: 125, speed: 85 },
    catchRate: 3,
    baseExp: 261
  },
  145: {
    id: 145,
    name: "Zapdos",
    types: ["Electric","Flying"],
    baseStats: { hp: 90, attack: 90, defense: 85, spAttack: 125, spDefense: 90, speed: 100 },
    catchRate: 3,
    baseExp: 261
  },
  146: {
    id: 146,
    name: "Moltres",
    types: ["Fire","Flying"],
    baseStats: { hp: 90, attack: 100, defense: 90, spAttack: 125, spDefense: 85, speed: 90 },
    catchRate: 3,
    baseExp: 261
  },
  147: {
    id: 147,
    name: "Dratini",
    types: ["Dragon"],
    baseStats: { hp: 41, attack: 64, defense: 45, spAttack: 50, spDefense: 50, speed: 50 },
    catchRate: 45,
    baseExp: 60,
    evolvesTo: {"speciesId":148,"level":30}
  },
  148: {
    id: 148,
    name: "Dragonair",
    types: ["Dragon"],
    baseStats: { hp: 61, attack: 84, defense: 65, spAttack: 70, spDefense: 70, speed: 70 },
    catchRate: 45,
    baseExp: 147,
    evolvesTo: {"speciesId":149,"level":55}
  },
  149: {
    id: 149,
    name: "Dragonite",
    types: ["Dragon","Flying"],
    baseStats: { hp: 91, attack: 134, defense: 95, spAttack: 100, spDefense: 100, speed: 80 },
    catchRate: 45,
    baseExp: 270
  },
  150: {
    id: 150,
    name: "Mewtwo",
    types: ["Psychic"],
    baseStats: { hp: 106, attack: 110, defense: 90, spAttack: 154, spDefense: 90, speed: 130 },
    catchRate: 3,
    baseExp: 306
  },
  151: {
    id: 151,
    name: "Mew",
    types: ["Psychic"],
    baseStats: { hp: 100, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100 },
    catchRate: 45,
    baseExp: 270
  },
};

export const ALL_SPECIES = Object.values(POKEMON_SPECIES_MAP);

/**
 * Safe resolver lấy PokemonSpecies, luôn đảm bảo không bao giờ trả về undefined
 */
export function getPokemonSpecies(speciesId: number): PokemonSpecies {
  return POKEMON_SPECIES_MAP[speciesId] || POKEMON_SPECIES_MAP[1];
}

export function calculateStats(base: PokemonStats, level: number): PokemonStats {
  const hp = Math.floor(((2 * base.hp + 31) * level) / 100) + level + 10;
  const calcStat = (val: number) => Math.floor(((2 * val + 31) * level) / 100) + 5;
  return {
    hp,
    attack: calcStat(base.attack),
    defense: calcStat(base.defense),
    spAttack: calcStat(base.spAttack),
    spDefense: calcStat(base.spDefense),
    speed: calcStat(base.speed),
  };
}

export const POKESPRITE_BASE = 'https://raw.githubusercontent.com/msikma/pokesprite/master';

const POKESPRITE_SPECIAL_SLUGS: Record<number, string> = {
  29: 'nidoran-f',
  32: 'nidoran-m',
  83: 'farfetchd',
  122: 'mr-mime',
};

export function getPokemonSpriteUrl(speciesId: number, isShiny: boolean = false): string {
  // Ưu tiên tải trực tiếp từ bộ sprite cục bộ trích xuất từ APK game gốc (1-556)
  if (speciesId >= 1 && speciesId <= 556) {
    return isShiny ? `/assets/shiny/${speciesId}.png` : `/assets/pokemon/${speciesId}.png`;
  }

  const sub = isShiny ? 'shiny' : 'regular';
  
  if (POKESPRITE_SPECIAL_SLUGS[speciesId]) {
    const slug = POKESPRITE_SPECIAL_SLUGS[speciesId];
    return `${POKESPRITE_BASE}/pokemon-gen8/${sub}/${slug}.png`;
  }

  const species = getPokemonSpecies(speciesId);
  const slug = species.name
    .toLowerCase()
    .trim()
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/['.]/g, '')
    .replace(/[^a-z0-9-]/g, '-');

  return `${POKESPRITE_BASE}/pokemon-gen8/${sub}/${slug}.png`;
}

export function getPokemonAnimatedUrl(speciesId: number, isShiny: boolean): string {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated';
  return isShiny ? `${base}/shiny/${speciesId}.gif` : `${base}/${speciesId}.gif`;
}

/**
 * Animated Battle Sprites from Pokémon Showdown (Gen 5 BW style animations)
 * Includes back sprites for the player's Pokémon and front sprites for opponents
 */
export function getPokemonBattleSpriteUrl(
  speciesId: number,
  isShiny: boolean = false,
  isBack: boolean = false
): string {
  const species = getPokemonSpecies(speciesId);
  const slug = species.name
    .toLowerCase()
    .trim()
    .replace(/♀/g, 'f')
    .replace(/♂/g, 'm')
    .replace(/['.\s-]/g, '');

  const sub = isShiny
    ? isBack
      ? 'ani-back-shiny'
      : 'ani-shiny'
    : isBack
    ? 'ani-back'
    : 'ani';

  return `https://play.pokemonshowdown.com/sprites/${sub}/${slug}.gif`;
}

export function getItemSpriteUrl(itemSlug: string): string {
  if (!itemSlug) return '/assets/items/poke-ball.png';
  const clean = itemSlug.toLowerCase().trim().replace(/_/g, '-');

  // Balls
  if (['poke', 'pokeball', 'poke-ball'].includes(clean)) return '/assets/items/poke-ball.png';
  if (['great', 'greatball', 'great-ball'].includes(clean)) return '/assets/items/great-ball.png';
  if (['ultra', 'ultraball', 'ultra-ball'].includes(clean)) return '/assets/items/ultra-ball.png';
  if (['master', 'masterball', 'master-ball'].includes(clean)) return '/assets/items/master-ball.png';
  if (['friend', 'friendball', 'friend-ball'].includes(clean)) return '/assets/items/friend-ball.png';
  if (['love', 'loveball', 'love-ball'].includes(clean)) return '/assets/items/love-ball.png';

  // Berries
  if (['razz', 'razz-berry', 'razzberry'].includes(clean)) return '/assets/items/razz-berry.png';
  if (['nanab', 'nanab-berry', 'nanabberry'].includes(clean)) return '/assets/items/nanab-berry.png';
  if (['pinap', 'pinap-berry', 'pinapberry'].includes(clean)) return '/assets/items/pinap-berry.png';
  if (['golden-razz', 'golden-razz-berry', 'goldenrazz', 'goldenrazzberry'].includes(clean)) return '/assets/items/golden-razz-berry.png';

  // Exp Candies
  if (clean.includes('candy')) return '/assets/items/exp-candy-m.png';
  if (clean.includes('fossil')) return '/assets/items/dome-fossil.png';
  if (clean.includes('stone')) return '/assets/items/water-stone.png';

  return `/assets/items/${clean}.png`;
}

export interface MoveData {
  name: string;
  key: string;
  effectType: CombatEffect['type'];
  type: PokemonType;
  category: 'physical' | 'special';
}

const move = (name: string, key: string, type: PokemonType, category: MoveData['category'], effectType: CombatEffect['type']): MoveData => ({ name, key, type, category, effectType });

export const TYPE_MOVES_MAP: Record<PokemonType, MoveData[]> = {
  Normal: [move('Tackle', 'tackle', 'Normal', 'physical', 'impact'), move('Body Slam', 'body-slam', 'Normal', 'physical', 'impact'), move('Slash', 'slash', 'Normal', 'physical', 'slash'), move('Hyper Beam', 'hyper-beam', 'Normal', 'special', 'impact')],
  Fire: [move('Scratch', 'scratch', 'Normal', 'physical', 'slash'), move('Flamethrower', 'flamethrower', 'Fire', 'special', 'fire'), move('Fire Blast', 'fire-blast', 'Fire', 'special', 'fire'), move('Ember', 'ember', 'Fire', 'special', 'fire')],
  Water: [move('Tackle', 'tackle', 'Normal', 'physical', 'impact'), move('Hydro Pump', 'hydro-pump', 'Water', 'special', 'water'), move('Water Gun', 'water-gun', 'Water', 'special', 'water'), move('Surf', 'surf', 'Water', 'special', 'water'), move('Bubble Beam', 'bubble-beam', 'Water', 'special', 'water')],
  Grass: [move('Razor Leaf', 'razor-leaf', 'Grass', 'physical', 'grass'), move('Solar Beam', 'solar-beam', 'Grass', 'special', 'grass'), move('Vine Whip', 'vine-whip', 'Grass', 'physical', 'grass')],
  Electric: [move('Thunderbolt', 'thunderbolt', 'Electric', 'special', 'electric'), move('Thunder Shock', 'thunder-shock', 'Electric', 'special', 'electric'), move('Thunder', 'thunder', 'Electric', 'special', 'electric')],
  Ice: [move('Ice Beam', 'ice-beam', 'Ice', 'special', 'ice'), move('Blizzard', 'blizzard', 'Ice', 'special', 'ice')],
  Fighting: [move('Close Combat', 'close-combat', 'Fighting', 'physical', 'impact'), move('Karate Chop', 'karate-chop', 'Fighting', 'physical', 'slash'), move('Cross Chop', 'cross-chop', 'Fighting', 'physical', 'slash')],
  Poison: [move('Sludge Bomb', 'sludge-bomb', 'Poison', 'special', 'poison'), move('Poison Sting', 'poison-sting', 'Poison', 'physical', 'poison')],
  Ground: [move('Earthquake', 'earthquake', 'Ground', 'physical', 'ground'), move('Dig', 'dig', 'Ground', 'physical', 'ground')],
  Rock: [move('Rock Slide', 'rock-slide', 'Rock', 'physical', 'rock'), move('Stone Edge', 'stone-edge', 'Rock', 'physical', 'rock'), move('Rock Throw', 'rock-throw', 'Rock', 'physical', 'rock')],
  Flying: [move('Wing Attack', 'wing-attack', 'Flying', 'physical', 'slash'), move('Air Slash', 'air-slash', 'Flying', 'special', 'slash'), move('Drill Peck', 'drill-peck', 'Flying', 'physical', 'slash')],
  Psychic: [move('Psychic', 'psychic', 'Psychic', 'special', 'psychic'), move('Confusion', 'confusion', 'Psychic', 'special', 'psychic')],
  Bug: [move('X-Scissor', 'x-scissor', 'Bug', 'physical', 'bug'), move('Bug Buzz', 'bug-buzz', 'Bug', 'special', 'bug')],
  Ghost: [move('Shadow Ball', 'shadow-ball', 'Ghost', 'special', 'ghost'), move('Lick', 'lick', 'Ghost', 'physical', 'ghost')],
  Dragon: [move('Dragon Claw', 'dragon-claw', 'Dragon', 'physical', 'dragon'), move('Outrage', 'outrage', 'Dragon', 'physical', 'dragon')],
  Steel: [move('Iron Head', 'iron-head', 'Steel', 'physical', 'steel'), move('Metal Claw', 'metal-claw', 'Steel', 'physical', 'steel')],
  Fairy: [move('Moonblast', 'moonblast', 'Fairy', 'special', 'fairy'), move('Dazzling Gleam', 'dazzling-gleam', 'Fairy', 'special', 'fairy')],
};

export function getPokemonMove(types: PokemonType[], enemyTypes?: PokemonType[]): MoveData {
  let chosenType: PokemonType = types[0] || 'Normal';
  if (enemyTypes && enemyTypes.length > 0 && types.length > 1) {
    let bestMult = -1;
    for (const t of types) {
      const mult = getTypeMultiplier([t], enemyTypes);
      if (mult > bestMult) {
        bestMult = mult;
        chosenType = t;
      }
    }
  }
  const movePool = TYPE_MOVES_MAP[chosenType] || TYPE_MOVES_MAP['Normal'];
  return movePool[Math.floor(Math.random() * movePool.length)];
}
