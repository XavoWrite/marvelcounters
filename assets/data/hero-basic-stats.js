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
      "name": "VAMPIRIC KIN",
      "key": "C",
      "hps": 25.0,
      "raw": "Healing Over Time: 25/s"
    }
  },
  "Cyclops": {
    "basicAttack": {
      "name": "Optic Blast",
      "dmgRaw": "Damage per Tick: 22",
      "rateRaw": "Attack Interval: 0.6s",
      "dps": 36.7
    }
  },
  "Devil Dinosaur": {
    "basicAttack": {
      "name": "Primal Bite",
      "dmgRaw": "Damage: 75",
      "rateRaw": "Attack Interval: 1st and 3rd attacks: 1s; 2nd attack: 0.9s"
    }
  },
  "Black Cat": {
    "basicAttack": {
      "name": "FELINE FURY",
      "dmgRaw": "Damage: 35"
    }
  },
  "White Fox": {
    "basicAttack": {
      "name": "YEOWOO GUSEUL",
      "dmgRaw": "Damage: Direct hit: 40 per round; bounce hit: 25 per round",
      "rateRaw": "Fire Rate: 0.45s per round"
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
      "name": "DOUBLE-BARREL BLASTER",
      "dmgRaw": "Damage: 4.5 per round",
      "rateRaw": "Fire Rate: The firing interval between shots is 0.12s, with an interval of 0.8s between each round of shooting"
    }
  },
  "Rogue": {
    "basicAttack": {
      "name": "Power Surge Punch",
      "dmgRaw": "Damage: The first two strikes deal 35 damage, while the third strike deals 45 damage"
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
      "name": "FAVORABLE ODDS",
      "key": "C",
      "hps": 55.0,
      "raw": "Healing Amount: 55/s"
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
      "name": "DUAL DESERT EAGLES - VANGUARD",
      "dmgRaw": "Damage: 36 damage per round",
      "rateRaw": "Fire Rate: 2.5 rounds per second",
      "dps": 90.0
    }
  },
  "Deadpool (Strategist)": {
    "basicAttack": {
      "name": "DUAL DESERT EAGLES - VANGUARD",
      "dmgRaw": "Damage: 36 damage per round",
      "rateRaw": "Fire Rate: 2.5 rounds per second",
      "dps": 90.0
    },
    "primaryHeal": {
      "name": "THE BAN HAMMER",
      "key": "Q",
      "hps": 25.0,
      "raw": "Healing Over Time During Activation: 25/s"
    }
  },
  "Daredevil": {
    "basicAttack": {
      "name": "JUSTICE JAB",
      "dmgRaw": "Damage: 35"
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
      "dmgRaw": "Damage: Cause 26 damage per single slash; double strike cause 13 damage per hit",
      "rateRaw": "Attack Interval: 2 strikes per second"
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
      "dmgRaw": "Damage: First beam 6 rounds in 0.5s, 12 per hit; second single-cast spell field 75 per hit",
      "rateRaw": "Fire Rate: 1.58s per round"
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
      "dmgRaw": "Damage: Double strike, 40 per hit",
      "rateRaw": "Attack Interval: Double strike 0.33s between attacks, 1s between sets."
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
      "name": "FIRST FAMILY",
      "key": "C",
      "hps": 25.0,
      "raw": "Healing Amount: 25/s"
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
      "rateRaw": "Fire Rate: 2 strikes per second"
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
      "dmgRaw": "Damage: The first four strikes each deal 35 damage, while the fifth strike deals 55 damage",
      "rateRaw": "Attack Interval: The first four strikes have an interval of 0.45s between them, while the fifth strike has a 0.67s interval from the fourth strike"
    }
  },
  "Psylocke": {
    "basicAttack": {
      "name": "Psionic Crossbow",
      "dmgRaw": "Damage: 12 damage per round",
      "rateRaw": "Fire Rate: The firing interval between shots is 0.2s, with an interval of 0.6s between each round of shooting"
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
      "dmgRaw": "Damage: 25 damage per round",
      "rateRaw": "Fire Rate: The firing interval between shots is 0.05s, with an interval of 0.57s between each round of shooting"
    }
  },
  "Star-Lord": {
    "basicAttack": {
      "name": "Element Guns",
      "dmgRaw": "Damage: 6.5 damage per round",
      "rateRaw": "Fire Rate: 40 rounds per second",
      "dps": 260.0
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
      "dmgRaw": "Projectile Damage: 80",
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
      "dmgRaw": "Damage: 25",
      "rateRaw": "Attack Interval: 0.37s per punch"
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
      "name": "Gamma Ray Gun",
      "dmgRaw": "Damage: 16",
      "rateRaw": "Fire Rate: 5 rounds per second",
      "dps": 80.0
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
      "hps": 130.0,
      "raw": "Healing Amount: 130/s"
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
      "dmgRaw": "Damage: 24 damage per round, for a total of 72 damage",
      "rateRaw": "Fire Rate: 0.5s for three shots. The interval between the first two shots is 0.05s"
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
      "dmgRaw": "Damage: The projectile deals no damage, while the spell field inflicts 25 damage per cast",
      "rateRaw": "Fire Rate: 1.75 rounds per second"
    },
    "primaryHeal": {
      "name": "Regeneration Domain",
      "key": "SHIFT",
      "hps": 100.0,
      "raw": "Healing Amount: 100/s"
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
      "dmgRaw": "Damage: Projectile Damage: 15; Spell Field Damage: 15",
      "rateRaw": "Fire Rate: 3.33 rounds per second"
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
      "dmgRaw": "Damage: Projectile Damage: 40. The spell field deals 40 damage at its center, reducing to 50% within a 3m radius from the center",
      "rateRaw": "Attack Interval: 0.8s"
    }
  },
  "Venom": {
    "basicAttack": {
      "name": "Dark Predation",
      "dmgRaw": "Damage: 20",
      "rateRaw": "Attack Interval: 0.9s, with a 0.1s interval between each tendril"
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
      "name": "Sentinel Strike",
      "dmgRaw": "Damage: Melee Attack Damage: 45, Flying Shield Damage: 45",
      "rateRaw": "Attack Interval: Melee 1st Hit: 0.4s, Melee 2nd Hit: 0.5s, Flying Shield 1st Hit: 0.5s, Flying Shield 2nd Hit: 0.57s"
    }
  },
  "Doctor Strange": {
    "basicAttack": {
      "name": "Daggers of Denak",
      "dmgRaw": "Damage: 18",
      "rateRaw": "Fire Rate: 5.56 rounds per second, with a 0.03-second interval between every two rounds"
    }
  }
};
