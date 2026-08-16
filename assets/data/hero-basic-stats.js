const HERO_BASIC_STATS = {
  "The Hood": {
    "basicAttack": {
      "name": "Accursed Pistols",
      "dmgRaw": "Shooting Damage: 26 per round",
      "rateRaw": "Shooting Interval: 0.2s",
      "dps": 130.0
    }
  },
  "Jubilee": {
    "basicAttack": {
      "name": "Energy Plasmoids",
      "dmgRaw": "Damage: 11 per hit",
      "rateRaw": "Fire Rate: 8 per second",
      "dps": 88.0
    },
    "primaryHeal": {
      "name": "Energy Plasmoids",
      "key": "Left Click",
      "hps": 60,
      "raw": "Healing: 15 per hit -- ataque hibrido (el mismo disparo dana O cura segun el objetivo, no las dos cosas a la vez), hps real 120 dividido a la mitad para no contar dano y curacion simultaneos del mismo disparo (pedido de Xavier, 2026-08-16)"
    }
  },
  "Cyclops": {
    "basicAttack": {
      "name": "Optic Blast",
      "dmgRaw": "Damage: 22 per tick, 3 ticks per attack (66 total)",
      "rateRaw": "Attack Interval: 0.6s per attack",
      "dps": 110.0
    }
  },
  "Devil Dinosaur": {
    "basicAttack": {
      "name": "Primal Bite",
      "dmgRaw": "Damage: 75 per hit (3-hit cycle)",
      "rateRaw": "Attack Interval: 1s, 0.9s, 1s (cycle repeats)",
      "dps": 77.6
    }
  },
  "Black Cat": {
    "basicAttack": {
      "name": "FELINE FURY",
      "dmgRaw": "Damage: 35 (verificado en vivo 2026-08-16: la pagina oficial no publica cadencia/intervalo para este ataque, no se puede calcular dps sin inventar un numero)"
    }
  },
  "White Fox": {
    "basicAttack": {
      "name": "Yeowoo Guseul",
      "dmgRaw": "Damage: 40 per round (direct hit, excluye el rebote secundario)",
      "rateRaw": "Fire Rate: 0.45s per round",
      "dps": 88.9
    },
    "primaryHeal": {
      "name": "FOX FORM AWAKENING",
      "key": "E",
      "hps": 25.0,
      "raw": "Healing Amount: 25/s"
    }
  },
  "Elsa Bloodstone": {
    "basicAttack": {
      "name": "Double-Barrel Blaster",
      "dmgRaw": "Damage: 4.5 per round, 10 rounds per cast (45 total)",
      "rateRaw": "Fire Rate: 0.12s between rounds within a cast, 0.8s between casts",
      "dps": 23.9
    }
  },
  "Rogue": {
    "basicAttack": {
      "name": "Power Surge Punch",
      "dmgRaw": "Damage: 35 per hit (first 2 strikes), 45 on 3rd strike (115 total per 3-hit cycle)",
      "rateRaw": "Attack Speed: 0.33s between first 2 strikes, 0.73s before 3rd",
      "dps": 82.7
    }
  },
  "Gambit": {
    "basicAttack": {
      "name": "Kinetic Cards",
      "dmgRaw": "Card Damage: 20 damage per round",
      "rateRaw": "Fire Rate: 0.45s per round",
      "dps": 44.4
    },
    "primaryHeal": {
      "name": "Kinetic Cards",
      "key": "Left Click",
      "hps": 33.4,
      "raw": "Card Healing: 30 health per round -- ataque hibrido (el mismo disparo dana O cura segun el objetivo), hps real 66.7 dividido a la mitad (pedido de Xavier, 2026-08-16)"
    }
  },
  "Deadpool (Vanguard)": {
    "basicAttack": {
      "name": "DUAL DESERT EAGLES - VANGUARD",
      "dmgRaw": "Damage: 36 damage per round",
      "rateRaw": "Fire Rate: 2.5 rounds per second",
      "dps": 90.0
    }
  },
  "Deadpool (Duelist)": {
    "basicAttack": {
      "name": "DUAL DESERT EAGLES - DUELIST",
      "dmgRaw": "Damage: 38 per hit",
      "rateRaw": "Fire Rate: 2.5 rounds per second",
      "dps": 95.0
    }
  },
  "Deadpool (Strategist)": {
    "basicAttack": {
      "name": "DUAL DESERT EAGLES - STRATEGIST",
      "dmgRaw": "Damage: 25 damage per round",
      "rateRaw": "Fire Rate: 2.5 rounds per second",
      "dps": 62.5
    },
    "primaryHeal": {
      "name": "DUAL DESERT EAGLES - STRATEGIST",
      "key": "Left Click",
      "hps": 56.25,
      "raw": "Healing: 45 per round -- ataque hibrido (el mismo disparo dana O cura segun el objetivo), hps real 112.5 dividido a la mitad (pedido de Xavier, 2026-08-16)"
    }
  },
  "Daredevil": {
    "basicAttack": {
      "name": "JUSTICE JAB",
      "dmgRaw": "Damage: 35 (misma limitacion que Black Cat: la pagina oficial no publica cadencia para este ataque)"
    }
  },
  "Angela": {
    "basicAttack": {
      "name": "Spear of Ichors",
      "dmgRaw": "Damage: 45",
      "rateRaw": "Attack Interval: 0.96s per hit",
      "dps": 46.9
    }
  },
  "Blade": {
    "basicAttack": {
      "name": "Ancestral Sword",
      "dmgRaw": "Damage: 26 per slash (double strike variant: 2x13, mismo total) a 2 golpes/seg",
      "rateRaw": "Attack Interval: 2 strikes per second",
      "dps": 52.0
    }
  },
  "Phoenix": {
    "basicAttack": {
      "name": "Cosmic Flames",
      "dmgRaw": "Damage: 60",
      "rateRaw": "Fire Rate: 0.435s per round",
      "dps": 137.9
    }
  },
  "Ultron": {
    "basicAttack": {
      "name": "ENCEPHALO-RAY",
      "dmgRaw": "Damage: ciclo completo = beam (6x12=72) + spell field (75) = 147 cada 1.58s",
      "rateRaw": "Fire Rate: 1.58s per round",
      "dps": 93.0
    },
    "primaryHeal": {
      "name": "IMPERATIVE: PATCH",
      "key": "E",
      "hps": 40.0,
      "raw": "Healing Amount to the Targeted ally: 40/s"
    }
  },
  "Emma Frost": {
    "basicAttack": {
      "name": "TELEPATHIC PULSE",
      "dmgRaw": "Damage: Damage increases with energy: 0 - 70/s, 99 - 110/s, full energy - 140/s"
    }
  },
  "The Thing": {
    "basicAttack": {
      "name": "Rocky Jab",
      "dmgRaw": "Damage: 40 per hit (double strike, 80 total)",
      "rateRaw": "Attack Interval: 0.33s between the 2 hits, 1s between sets",
      "dps": 60.2
    }
  },
  "Human Torch": {
    "basicAttack": {
      "name": "Fire Cluster",
      "dmgRaw": "Shot Damage: 5.5 per round",
      "rateRaw": "Fire Rate: 0.5s per round",
      "dps": 11.0
    }
  },
  "Invisible Woman": {
    "basicAttack": {
      "name": "Orb Projection",
      "dmgRaw": "Damage: Deal 30 damage per hit upon being shot out and 15 damage per hit on its return journey.",
      "rateRaw": "Fire Rate: 0.5s per hit"
    },
    "primaryHeal": {
      "name": "Guardian Shield",
      "key": "<icon>",
      "hps": 50,
      "raw": "Healing Amount: 50/sec (antes referenciaba una habilidad 'First Family' que no existe en el kit actual)"
    }
  },
  "Mister Fantastic": {
    "basicAttack": {
      "name": "Stretch Punch",
      "dmgRaw": "Spell Field Damage: 70",
      "rateRaw": "Attack Interval: 1.1s per hit",
      "dps": 63.6
    }
  },
  "Squirrel Girl": {
    "basicAttack": {
      "name": "Burst Acorn",
      "dmgRaw": "Spell Field Damage: 110",
      "rateRaw": "Fire Rate: 1.49 acorns per second",
      "dps": 163.9
    }
  },
  "Black Widow": {
    "basicAttack": {
      "name": "Widow's Bite Baton",
      "dmgRaw": "Damage: 45",
      "rateRaw": "Fire Rate: 2 strikes per second",
      "dps": 90
    }
  },
  "Wolverine": {
    "basicAttack": {
      "name": "Savage Claw",
      "dmgRaw": "Base Damage: 15 damage per strike",
      "rateRaw": "Attack Interval: The first three strikes have an interval of 0.27s between them, while the fourth strike has a 0.84s interval from the third strike"
    }
  },
  "Cloak & Dagger": {
    "basicAttack": {
      "name": "Darkforce Cloak",
      "dmgRaw": "Damage: 80/s",
      "dps": 80.0
    },
    "primaryHeal": {
      "name": "Dagger Storm",
      "key": "Right Click",
      "hps": 50.0,
      "raw": "Healing Amount: 50/s"
    }
  },
  "Iron Fist": {
    "basicAttack": {
      "name": "Jeet Kune Do",
      "dmgRaw": "Damage: 35 per hit (first 4 strikes), 55 on 5th strike (195 total per 5-hit cycle)",
      "rateRaw": "Attack Interval: 0.45s between first 4 strikes, 0.67s before 5th",
      "dps": 78.9
    }
  },
  "Psylocke": {
    "basicAttack": {
      "name": "Psionic Crossbow",
      "dmgRaw": "Damage: 12 per round, 4 rounds per cast (48 total)",
      "rateRaw": "Fire Rate: 0.2s between rounds within a cast, 0.6s between casts",
      "dps": 40.0
    }
  },
  "Hawkeye": {
    "basicAttack": {
      "name": "Piercing Arrow",
      "dmgRaw": "Damage: 28 - 70 (Maximum damage is achieved after 0.9s of charging)"
    }
  },
  "Iron Man": {
    "basicAttack": {
      "name": "Repulsor Blast",
      "dmgRaw": "Damage: 35",
      "rateRaw": "Fire Rate: 1.67 rounds per second",
      "dps": 58.4
    }
  },
  "Namor": {
    "basicAttack": {
      "name": "Trident of Neptune",
      "dmgRaw": "Damage: 75",
      "rateRaw": "Fire Rate: 1.09 rounds per second",
      "dps": 81.8
    }
  },
  "Moon Knight": {
    "basicAttack": {
      "name": "Crescent Dart",
      "dmgRaw": "Damage: 25 per round, 3 rounds per cycle (75 total)",
      "rateRaw": "Fire Rate: 0.05s between rounds within a cycle, 0.57s between cycles",
      "dps": 111.9
    }
  },
  "Star-Lord": {
    "basicAttack": {
      "name": "Element Guns",
      "dmgRaw": "Damage: 6.5 x 50 balas = 325 por rafaga (rafaga de 1.25s + recarga ~1.5s, dato de Xavier 2026-08-16 -- se ignora la recarga con invulnerabilidad de su habilidad para no complicar, se cuenta solo 1 rafaga+recarga)",
      "rateRaw": "Fire Rate: 40 rounds per second, ciclo completo 2.75s",
      "dps": 118.2
    }
  },
  "Scarlet Witch": {
    "basicAttack": {
      "name": "Chaos Control",
      "dmgRaw": "Damage: 8.5 per hit",
      "rateRaw": "Fire Rate: 0.1s per hit",
      "dps": 85.0
    }
  },
  "Winter Soldier": {
    "basicAttack": {
      "name": "Roterstern",
      "dmgRaw": "Projectile Damage: 80 (revisado 2026-08-16: solo 3 balas, se agotan en 1.2s, pero Xavier decidio no restar tiempo de recarga -- usar el calculo simple igual)",
      "rateRaw": "Fire Rate: 2.5 rounds per second",
      "dps": 200.0
    }
  },
  "Magik": {
    "basicAttack": {
      "name": "Soulsword",
      "dmgRaw": "Damage: 75",
      "rateRaw": "Attack Interval: 0.83s per hit",
      "dps": 90.4
    }
  },
  "Spider-Man": {
    "basicAttack": {
      "name": "Spider-Power",
      "dmgRaw": "Damage: 25 per punch (x2) + 40 per kick (x1) = 90 por ciclo de 3 golpes",
      "rateRaw": "Attack Interval: 0.37s por puñetazo, 0.82s por patada",
      "dps": 57.7
    }
  },
  "Black Panther": {
    "basicAttack": {
      "name": "Vibranium Claws",
      "dmgRaw": "Damage: 35",
      "rateRaw": "Attack Interval: 0.44s per hit",
      "dps": 79.5
    }
  },
  "Hela": {
    "basicAttack": {
      "name": "Nightsword Thorn",
      "dmgRaw": "Damage: 80",
      "rateRaw": "Fire Rate: 2 rounds per second",
      "dps": 160.0
    }
  },
  "Storm": {
    "basicAttack": {
      "name": "Wind Blade",
      "dmgRaw": "Damage: 60 damage per round",
      "rateRaw": "Fire Rate: 2 rounds per second",
      "dps": 120.0
    }
  },
  "Hulk": {
    "basicAttack": {
      "name": "Heavy Blow (Hero Hulk)",
      "dmgRaw": "Damage: 45 (forma Hero Hulk, no la pistola debil de Bruce Banner)",
      "rateRaw": "Attack Interval: 0.467s",
      "dps": 96.4
    }
  },
  "Jeff the Land Shark": {
    "basicAttack": {
      "name": "Joyful Splash",
      "dmgRaw": "Damage: 70/s",
      "rateRaw": "Fire Rate: 20 rounds per second",
      "dps": 70.0
    },
    "primaryHeal": {
      "name": "Joyful Splash",
      "key": "Left Click",
      "hps": 65.0,
      "raw": "Healing Amount: 130/s -- ataque hibrido (el mismo disparo dana O cura segun el objetivo), hps real 130 dividido a la mitad (pedido de Xavier, 2026-08-16)"
    }
  },
  "Punisher": {
    "basicAttack": {
      "name": "Adjudication",
      "dmgRaw": "Damage: 19 damage per round",
      "rateRaw": "Fire Rate: 10 rounds per second",
      "dps": 190.0
    }
  },
  "Luna Snow": {
    "basicAttack": {
      "name": "Light & Dark Ice",
      "dmgRaw": "Damage: 24 per round, 3 rounds per cycle (72 total)",
      "rateRaw": "Fire Rate: 0.5s per 3-shot cycle (baja confianza: no se aclara un hueco aparte entre ciclos)",
      "dps": 144.0
    },
    "primaryHeal": {
      "name": "Light & Dark Ice",
      "key": "Left Click",
      "raw": "Healing Amount: 24 health per round, for a total of 72 health"
    }
  },
  "Adam Warlock": {
    "basicAttack": {
      "name": "Quantum Magic",
      "dmgRaw": "Damage: 60 damage per round",
      "rateRaw": "Fire Rate: 2 rounds per second",
      "dps": 120.0
    },
    "primaryHeal": {
      "name": "Soul Bond",
      "key": "SHIFT",
      "hps": 15.0,
      "raw": "Healing Amount: 15/s"
    }
  },
  "Rocket Raccoon": {
    "basicAttack": {
      "name": "Bombard Mode",
      "dmgRaw": "Damage: 16 damage per round",
      "rateRaw": "Fire Rate: 12.05 rounds per second",
      "dps": 192.8
    },
    "primaryHeal": {
      "name": "Repair Mode",
      "key": "Right Click",
      "hps": 50.0,
      "raw": "Healing Amount (Ally): 50/s"
    }
  },
  "Loki": {
    "basicAttack": {
      "name": "Mystical Missile",
      "dmgRaw": "Damage: 25 (spell field only, projectile itself deals 0)",
      "rateRaw": "Fire Rate: 1.75 rounds per second",
      "dps": 43.8
    },
    "primaryHeal": {
      "name": "Mystical Missile",
      "key": "Left Click",
      "hps": 105.0,
      "raw": "Area Of Effect Healing: 40 per hit -- ataque hibrido (mismo disparo dana y cura, /2 = 35/s) x3 por sus clones, que disparan lo mismo (pedido de Xavier, 2026-08-16: antes se usaba Regeneration Domain, que tiene 30s de cooldown para solo 5s activo, no es sostenido)"
    }
  },
  "Mantis": {
    "basicAttack": {
      "name": "Life Energy Blast",
      "dmgRaw": "Damage: 55 damage per round",
      "rateRaw": "Fire Rate: 2.5 rounds per second",
      "dps": 137.5
    },
    "primaryHeal": {
      "name": "Healing Flower",
      "key": "Right Click",
      "raw": "One-time Healing Amount: 60"
    }
  },
  "Peni Parker": {
    "basicAttack": {
      "name": "Cyber-Web Cluster",
      "dmgRaw": "Damage: 15 (daño directo del proyectil, excluye el campo de daño adicional)",
      "rateRaw": "Fire Rate: 3.33 rounds per second",
      "dps": 50.0
    }
  },
  "Thor": {
    "basicAttack": {
      "name": "Mjolnir Bash",
      "dmgRaw": "Damage: 45",
      "rateRaw": "Attack Interval: 0.6s",
      "dps": 75.0
    }
  },
  "Magneto": {
    "basicAttack": {
      "name": "Iron Volley",
      "dmgRaw": "Damage: 40 (projectile only, excluye el campo de daño adicional)",
      "rateRaw": "Attack Interval: 0.8s",
      "dps": 50.0
    }
  },
  "Venom": {
    "basicAttack": {
      "name": "Dark Predation",
      "dmgRaw": "Damage: 4 tendrils x 20 = 80 por ciclo de 0.9s",
      "rateRaw": "Attack Interval: 0.9s, with a 0.1s interval between each tendril",
      "dps": 88.9
    }
  },
  "Groot": {
    "basicAttack": {
      "name": "Vine Strike",
      "dmgRaw": "Damage: 65",
      "rateRaw": "Attack Interval: 0.7s",
      "dps": 92.9
    }
  },
  "Captain America": {
    "basicAttack": {
      "name": "Sentinel Strike (melee)",
      "dmgRaw": "Damage: 45 por golpe, modo melee (tiene 2do modo de escudo volador con numeros similares, se uso melee por ser el modo base)",
      "rateRaw": "Attack Interval: ~0.45s promedio (1er golpe 0.4s, 2do golpe 0.5s)",
      "dps": 100.0
    }
  },
  "Doctor Strange": {
    "basicAttack": {
      "name": "Maelstrom of Madness",
      "dmgRaw": "Damage: 100 stacks de Dark Magic x 1.3 = 130 al explotar (pedido de Xavier 2026-08-16: su daño principal real es esta explosion, no las Daggers of Denak sueltas). Xavier vio en un video que cada TIRO completo de dagas (no cada uno de los 5 impactos internos) suma ~17.5 Dark Magic (17, 35, 52, 70 acumulado en 4 tiros)",
      "rateRaw": "100/17.5 = 5.7 tiros de daga a 5.56/seg = 1.03s para juntar la carga completa (le alcanza 1 solo cargador de 12, no hace falta recargar)",
      "dps": 126.5
    }
  }
};
