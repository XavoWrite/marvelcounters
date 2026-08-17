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
      "hps": 105.3,
      "raw": "Healing: 15 per hit -- ataque hibrido (el mismo disparo dana O cura segun el objetivo, no las dos cosas a la vez)"
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
      "dmgRaw": "Damage: 35 per hit",
      "rateRaw": "Cadencia no publicada oficialmente por la pagina ni por guias comunitarias",
      "dps": 84.5
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
      "hps": 105.3,
      "raw": "Healing Amount: 25/s"
    }
  },
  "Elsa Bloodstone": {
    "basicAttack": {
      "name": "Double-Barrel Blaster",
      "dmgRaw": "Damage: 4.5 per round, 10 rounds per cast (45 total)",
      "rateRaw": "Fire Rate oficial: 0.12s between rounds within a cast, 0.8s between casts (23.9 dps teorico, muy bajo); se usa el tiempo medido en su lugar",
      "dps": 133.5
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
      "hps": 129.0,
      "raw": "Card Healing: 30 health per round -- ataque hibrido (el mismo disparo dana O cura segun el objetivo)"
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
      "hps": 98.0,
      "raw": "Healing: 45 per round -- ataque hibrido (el mismo disparo dana O cura segun el objetivo)"
    }
  },
  "Daredevil": {
    "basicAttack": {
      "name": "JUSTICE JAB",
      "dmgRaw": "Damage: 35 per hit",
      "rateRaw": "Cadencia no publicada oficialmente por la pagina ni por guias comunitarias",
      "dps": 88.8
    }
  },
  "Angela": {
    "basicAttack": {
      "name": "Axes of Ichors (en el suelo)",
      "dmgRaw": "Damage: 30 los primeros 3 golpes, 50 el cuarto. Angela tiene dos ataques segun si esta volando (Spear of Ichors) o en el suelo (Axes of Ichors, mas fuerte, usado como dano principal)",
      "rateRaw": "Attack Interval: First three strikes: 0.4s per hit; the forth strike: 0.6s per hit",
      "dps": 79.0
    }
  },
  "Blade": {
    "basicAttack": {
      "name": "Bloodline Awakening (combo espada)",
      "dmgRaw": "Combo (Bloodline Awakening): 5 golpes de Ancestral Sword (26x5=130) + Whirlwind Slash (64) + 5 golpes mas (130) + Whirlwind Slash (64) = 388 de dano total. Blade tambien tiene Hunter's Shotgun (escopeta a distancia, alternativa de poke, no usada como dano principal)",
      "rateRaw": "Duracion del combo completo: 3.81s",
      "dps": 101.8
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
      "dmgRaw": "Damage: Damage increases with energy: 0 - 70/s, 99 - 110/s, full energy - 140/s. El daño sube en tiempo real con una barra de energia propia que sube +12/s pegandole a un heroe y baja si deja de pegar 4s; con 70 de municion a 10/s de consumo (7s por cargador) rara vez se llega a energia alta desde cero",
      "rateRaw": "Cadencia no publicada como numero fijo; depende del sistema de energia (ver arriba)",
      "dps": 80.8
    }
  },
  "The Thing": {
    "basicAttack": {
      "name": "Stone Haymaker",
      "dmgRaw": "Damage: 55 + 10% de la vida maxima del rival por golpe (con un dps de 250 de vida tipica: 55+25=80 por golpe). Es el golpe que mas se usa en partidas reales; Rocky Jab rara vez se usa",
      "rateRaw": "Sin cadencia publicada en ninguna fuente oficial ni guia; cada golpe (animacion completa) tarda ~1.06s",
      "dps": 53.1
    }
  },
  "Human Torch": {
    "basicAttack": {
      "name": "Fire Cluster",
      "dmgRaw": "Shot Damage oficial: 5.5 per round -- probablemente por cada proyectil individual DENTRO de una rafaga (el nombre es literal, 'cluster'), pero ninguna fuente dice cuantos proyectiles hay por rafaga",
      "rateRaw": "Fire Rate oficial: 2 rondas/s (5.5x2=11 dps teorico)",
      "dps": 148.6
    }
  },
  "Invisible Woman": {
    "basicAttack": {
      "name": "Orb Projection",
      "dmgRaw": "Damage: Deal 30 damage per hit upon being shot out and 15 damage per hit on its return journey (ataque hibrido, el mismo orbe dana o cura segun a quien le pegue)",
      "rateRaw": "Fire Rate oficial: 0.5s per hit",
      "dps": 82.1
    },
    "primaryHeal": {
      "name": "Guardian Shield",
      "key": "<icon>",
      "hps": 132.5,
      "raw": "Healing Amount: 50/sec"
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
      "rateRaw": "Fire Rate oficial: 1.49 acorns per second",
      "dps": 174.1
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
      "dmgRaw": "Base Damage: 15 + 1.5% de la vida maxima del rival por golpe (escala con la vida del objetivo, no es un numero fijo, extra +0.057%/punto de Rage)",
      "rateRaw": "Attack Interval: The first three strikes have an interval of 0.27s between them, while the fourth strike has a 0.84s interval from the third strike. Cada garrazo carga 10/100 de Berserker Rage",
      "dps": 72.0
    }
  },
  "Cloak & Dagger": {
    "basicAttack": {
      "name": "Darkforce Cloak + Lightforce Dagger (combinado)",
      "dmgRaw": "Cloak (Darkforce Cloak, spell field automatico): 80/s oficial. Dagger (Lightforce Dagger, ataque hibrido -- el mismo tiro dana O cura segun el objetivo): 18 dmg x 2.27 golpes/s = 40.9/s oficial. Se suman ambas personas porque representan el dano principal del mismo heroe",
      "dps": 107.1
    },
    "primaryHeal": {
      "name": "Dagger Storm",
      "key": "Right Click",
      "hps": 86.6,
      "raw": "Healing Amount: 50/s -- Dagger es la unica de las dos personas de Cloak & Dagger que cura"
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
      "name": "Piercing Arrow + Archer's Focus (headshot cargado)",
      "dmgRaw": "Piercing Arrow: 28-70 cargando 0.9s. Archer's Focus (pasiva): +0-90 de dano extra apuntando 0.9s, se suma al dano base de Piercing Arrow, tambien puede critear",
      "rateRaw": "Cadencia no publicada oficialmente; el dano real depende mucho de la carga y la punteria del jugador",
      "dps": 189.4
    }
  },
  "Iron Man": {
    "basicAttack": {
      "name": "Repulsor Blast",
      "dmgRaw": "Damage: 35 (impacto directo) + 45 (Spell Field Damage, campo en 3m de radio) = 80 por disparo si ambas partes le pegan al mismo objetivo",
      "rateRaw": "Fire Rate: 1.67 rounds per second",
      "dps": 133.6
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
      "dmgRaw": "Damage: 6.5 x 50 balas = 325 por rafaga (rafaga de 1.25s + recarga ~1.5s)",
      "rateRaw": "Fire Rate: 40 rounds per second, ciclo completo 2.75s",
      "dps": 118.2
    }
  },
  "Scarlet Witch": {
    "basicAttack": {
      "name": "Chaos Control",
      "dmgRaw": "Damage: 8.5 per hit",
      "rateRaw": "Fire Rate oficial: 0.1s per hit",
      "dps": 81.8
    }
  },
  "Winter Soldier": {
    "basicAttack": {
      "name": "Roterstern",
      "dmgRaw": "Projectile Damage: 80",
      "rateRaw": "Fire Rate oficial: 2.5 rounds per second",
      "dps": 220.0
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
      "rateRaw": "Fire Rate oficial: 2 rounds per second",
      "dps": 154.5
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
      "dps": 66.8
    },
    "primaryHeal": {
      "name": "Joyful Splash",
      "key": "Left Click",
      "hps": 110.6,
      "raw": "Healing Amount: 130/s -- ataque hibrido (el mismo disparo dana O cura segun el objetivo); a diferencia de otros hibridos, el proyectil de Jeff traspasa aliados, pudiendo danar a un enemigo Y curar a un aliado con el mismo disparo si estan en linea"
    }
  },
  "Punisher": {
    "basicAttack": {
      "name": "Adjudication",
      "dmgRaw": "Damage: 19 damage per round",
      "rateRaw": "Fire Rate oficial: 10 rounds per second",
      "dps": 173.0
    }
  },
  "Luna Snow": {
    "basicAttack": {
      "name": "Light & Dark Ice",
      "dmgRaw": "Damage: 24 per round, 3 rounds per cycle (72 total)",
      "rateRaw": "Fire Rate oficial: 0.5s per 3-shot cycle (144.0 dps teorico); se usa el tiempo medido en su lugar",
      "dps": 135.9
    },
    "primaryHeal": {
      "name": "Light & Dark Ice",
      "key": "Left Click",
      "hps": 130.7,
      "raw": "Healing Amount: 24 health per round, for a total of 72 health -- ataque hibrido (el mismo disparo dana O cura segun el objetivo)"
    }
  },
  "Adam Warlock": {
    "basicAttack": {
      "name": "Quantum Magic",
      "dmgRaw": "Damage: 60 damage per round",
      "rateRaw": "Fire Rate oficial: 2 rounds per second",
      "dps": 115.5
    },
    "primaryHeal": {
      "name": "Avatar Life Stream",
      "key": "E",
      "hps": 226.7,
      "raw": "Healing Amount: 95 (rebota 2 veces a otros aliados cercanos), Healing Amount (self): 35, 2 cargas con 6s de recarga cada una -- se usa esta (Avatar Life Stream) en vez de Soul Bond como curacion principal por ser la que realmente sostiene vida en pelea"
    }
  },
  "Rocket Raccoon": {
    "basicAttack": {
      "name": "Bombard Mode",
      "dmgRaw": "Damage: 16 damage per round",
      "rateRaw": "Fire Rate oficial: 12.05 rounds per second",
      "dps": 148.6
    },
    "primaryHeal": {
      "name": "Repair Mode",
      "key": "Right Click",
      "hps": 75.5,
      "raw": "Healing Amount (Ally): 50/s"
    }
  },
  "Loki": {
    "basicAttack": {
      "name": "Mystical Missile",
      "dmgRaw": "Damage: 25 (spell field only, projectile itself deals 0) por cada uno de sus 3 clones, que disparan lo mismo junto a el",
      "rateRaw": "Fire Rate oficial: 1.75 rounds per second (43.8 dps teorico sin clones); se usa el tiempo medido con clones en su lugar",
      "dps": 125.0
    },
    "primaryHeal": {
      "name": "Mystical Missile",
      "key": "Left Click",
      "hps": 102.6,
      "raw": "Area Of Effect Healing: 40 per hit -- ataque hibrido (mismo disparo dana O cura), x3 por sus clones, que disparan lo mismo junto a el"
    }
  },
  "Mantis": {
    "basicAttack": {
      "name": "Life Energy Blast",
      "dmgRaw": "Damage: 55 damage per round",
      "rateRaw": "Fire Rate oficial: 2.5 rounds per second (137.5 dps teorico); se usa el tiempo medido en su lugar",
      "dps": 118.5
    },
    "primaryHeal": {
      "name": "Healing Flower",
      "key": "Right Click",
      "hps": 88.9,
      "raw": "One-time Healing Amount: 60 -- curacion a rafagas (no continua)"
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
      "dmgRaw": "Damage: 100 stacks de Dark Magic x 1.3 = 130 al explotar (dano principal real: esta explosion, no las Daggers of Denak sueltas). Cada TIRO completo de dagas (no cada uno de los 5 impactos internos) suma ~17.5 Dark Magic (17, 35, 52, 70 acumulado en 4 tiros)",
      "rateRaw": "100/17.5 = 5.7 tiros de daga a 5.56/seg = 1.03s para juntar la carga completa (le alcanza 1 solo cargador de 12, no hace falta recargar)",
      "dps": 126.5
    }
  }
};
