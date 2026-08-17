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
      "raw": "Healing: 15 per hit oficial -- ataque hibrido (el mismo disparo dana O cura segun el objetivo, no las dos cosas a la vez). Se probo dividir a la mitad y se revirtio (pedido de Xavier, 2026-08-16: el dato es oficial de la pagina, dividirlo nerfea la curacion sin motivo real). Corregido con dato real de Xavier en partida (2026-08-16) curando a un bot aliado de Galacta con los 200 de vida estandar de la prueba en 1.90s (200/1.90=105.3 hps real)"
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
      "rateRaw": "Cadencia: pagina oficial y guias no publican intervalo; dato de Xavier por experiencia propia (2026-08-16): 7 golpes bastan para vencer a un dps normal en 2.90s reales = 2.41 golpes/s",
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
      "raw": "Healing Amount: 25/s oficial. Corregido con dato real de Xavier en partida (2026-08-16) curando a un bot aliado de Galacta con los 200 de vida estandar de la prueba en 1.90s (200/1.90=105.3 hps real, mucho mas alto que el oficial)"
    }
  },
  "Elsa Bloodstone": {
    "basicAttack": {
      "name": "Double-Barrel Blaster",
      "dmgRaw": "Damage: 4.5 per round, 10 rounds per cast (45 total) -- el calculo oficial da un dps muy bajo comparado con el resultado real en partida. Dato real de Xavier en partida (2026-08-16) contra Luna Snow (275 de vida): usando 8 de sus 12 balas (sobraron 4/12), la vencio en 2.06s",
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
      "raw": "Card Healing: 30 health per round oficial -- ataque hibrido (el mismo disparo dana O cura segun el objetivo). Se probo dividir a la mitad y se revirtio (pedido de Xavier, 2026-08-16: dato oficial, no corresponde nerfearlo). Corregido con dato real de Xavier en partida (2026-08-16) curando a un bot aliado de Galacta con los 200 de vida estandar de la prueba en 1.55s (200/1.55=129.0 hps real)"
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
      "raw": "Healing: 45 per round oficial -- ataque hibrido (el mismo disparo dana O cura segun el objetivo). Se probo dividir a la mitad y se revirtio (pedido de Xavier, 2026-08-16: dato oficial, no corresponde nerfearlo). Corregido con dato real de Xavier en partida (2026-08-16) curando a un bot aliado de Galacta con los 200 de vida estandar de la prueba en 2.04s (200/2.04=98.0 hps real)"
    }
  },
  "Daredevil": {
    "basicAttack": {
      "name": "JUSTICE JAB",
      "dmgRaw": "Damage: 35 per hit (confirmado 35 sobre 25 de una guia comunitaria desactualizada: 7 golpes x 35=245, cerca de los 250 de vida de un duelista tipico y consistente con 'vencer al enemigo' en 7 golpes; 25 no alcanzaria)",
      "rateRaw": "Cadencia: pagina oficial y guias no publican intervalo; dato de Xavier por experiencia propia (2026-08-16): 7 golpes de Justice Jab bastan para vencer al enemigo en 2.76s reales = 2.54 golpes/s",
      "dps": 88.8
    }
  },
  "Angela": {
    "basicAttack": {
      "name": "Axes of Ichors (en el suelo)",
      "dmgRaw": "Damage: 30 los primeros 3 golpes, 50 el cuarto. Angela tiene dos ataques segun si esta volando (Spear of Ichors) o en el suelo (Axes of Ichors, mas fuerte). Dato real de Xavier en partida (2026-08-16) contra Black Widow (275 de vida): volando, 7 golpes de Spear of Ichors la vencen en 6.32s (275/6.32=43.5 dps); en el suelo, 8 golpes de Axes of Ichors la vencen en 3.48s (275/3.48=79.0 dps, casi el doble). Se usa el de tierra como daño principal por ser el mas fuerte y el que mas se usa en pelea real",
      "rateRaw": "Attack Interval: First three strikes: 0.4s per hit; the forth strike: 0.6s per hit",
      "dps": 79.0
    }
  },
  "Blade": {
    "basicAttack": {
      "name": "Bloodline Awakening (combo espada)",
      "dmgRaw": "Combo real de un jugador promedio (pedido de Xavier, 2026-08-16: Bloodline Awakening es como un dive, es lo que usa el jugador promedio, y a diferencia de la espada sola reduce la curacion del rival): 5 golpes de Ancestral Sword (26x5=130) + Whirlwind Slash (64) + 5 golpes mas (130) + Whirlwind Slash (64) = 388 de dano total. Blade tambien tiene Hunter's Shotgun (escopeta a distancia, alternativa de poke, no la principal): 2 disparos a la cabeza matan a un dps en 0.93s medido por Xavier = ~268.8 dps, no usado como daño principal porque el jugador promedio va al cuerpo a cuerpo",
      "rateRaw": "Duracion real del combo completo: 3.81s (medido por Xavier en partida)",
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
      "raw": "Healing Amount to the Targeted ally: 40/s -- confirmado con dato real de Xavier en partida (2026-08-16), aunque el aclaro que esta prueba le costo medir con precision: curo a su robot de 3/10 a 8/10 unidades de un bot de Galacta (5 unidades=125 de vida) en 3.17s (125/3.17=39.4 hps, muy cerca del oficial de 40, se mantiene el oficial por ser mas confiable que esta medicion imprecisa)"
    }
  },
  "Emma Frost": {
    "basicAttack": {
      "name": "TELEPATHIC PULSE",
      "dmgRaw": "Damage: Damage increases with energy: 0 - 70/s, 99 - 110/s, full energy - 140/s. El daño sube en tiempo real con una barra de energia propia que sube +12/s pegandole a un heroe y baja si deja de pegar 4s; con 70 de municion a 10/s de consumo (7s por cargador) rara vez se llega a energia alta desde cero",
      "rateRaw": "Dato real de Xavier en partida (2026-08-16): mata a un dps en 3.37s arrancando sin energia (termina con 33 en la barra), y a un segundo dps en 2.82s arrancando ya con esos 33 (termina con 60) -- secuencia real sostenida: 500 (2x250 de vida tipica) / 6.19s",
      "dps": 80.8
    }
  },
  "The Thing": {
    "basicAttack": {
      "name": "Stone Haymaker",
      "dmgRaw": "Damage: 55 + 10% de la vida maxima del rival por golpe (con un dps de 250 de vida tipica: 55+25=80 por golpe). Xavier confirmo que este es el golpe que mas se usa en partidas reales, Rocky Jab rara vez se usa (pedido de Xavier, 2026-08-16)",
      "rateRaw": "Sin cadencia publicada en ninguna fuente oficial ni guia. Dato real de Xavier en partida: cada golpe (animacion completa) tarda ~1.06s, y matar a un dps de 250 de vida se demora 4.71s reales en total (varios golpes en secuencia)",
      "dps": 53.1
    }
  },
  "Human Torch": {
    "basicAttack": {
      "name": "Fire Cluster",
      "dmgRaw": "Shot Damage oficial: 5.5 per round -- probablemente por cada proyectil individual DENTRO de una rafaga (el nombre es literal, 'cluster'), pero ninguna fuente dice cuantos proyectiles hay por rafaga. Dato real de Xavier en partida (2026-08-16) contra Black Widow (275 de vida): apuntando al cuerpo (no a la cabeza), 4 ataques la vencen en 1.85s. Xavier tambien midio el caso de 2 headshots (0.85s = 323.5 dps) pero aclaro que acertar los 2 headshots seguidos es casi imposible para un jugador normal ('o eres hacker o alguien muy bueno'), asi que se usa el dato de cuerpo por ser representativo de un jugador promedio (mismo criterio que Doctor Strange)",
      "rateRaw": "El calculo oficial (5.5 x 2 rondas/s = 11 dps) es claramente muy bajo comparado con el resultado real en partida; se usa el tiempo medido en su lugar",
      "dps": 148.6
    }
  },
  "Invisible Woman": {
    "basicAttack": {
      "name": "Orb Projection",
      "dmgRaw": "Damage: Deal 30 damage per hit upon being shot out and 15 damage per hit on its return journey (ataque hibrido, el mismo orbe dana o cura segun a quien le pegue). Dato real de Xavier en partida (2026-08-16) contra Black Widow (275 de vida): 7 golpes la vencen en 3.35s",
      "rateRaw": "Fire Rate oficial: 0.5s per hit",
      "dps": 82.1
    },
    "primaryHeal": {
      "name": "Guardian Shield",
      "key": "<icon>",
      "hps": 132.5,
      "raw": "Healing Amount: 50/sec oficial (antes referenciaba una habilidad 'First Family' que no existe en el kit actual). Dato real de Xavier en partida (2026-08-16) curando a un bot aliado de Galacta con los 200 de vida estandar de la prueba en 1.51s (200/1.51=132.5 hps real, mucho mas alto que el oficial de 50)"
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
      "dmgRaw": "Spell Field Damage: 110. Dato real de Xavier en partida (2026-08-16) contra Black Widow (275 de vida): solo necesita 3 nueces (todas directas) para vencer a un enemigo, la vence en 1.58s",
      "rateRaw": "Fire Rate oficial: 1.49 acorns per second (163.9 dps teorico, usado antes)",
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
      "dmgRaw": "Base Damage: 15 + 1.5% de la vida maxima del rival por golpe (escala con la vida del objetivo, no es un numero fijo, extra +0.057%/punto de Rage). Secuencia real sostenida de Xavier contra Black Widow (275 de vida confirmada, 2026-08-16): primera pelea sin Berserker Rage (arrancando desde 0) tarda 4.41s; segunda pelea ya con Rage al 100/100 (8 golpes) tarda 3.23s. Se suman como una pelea real continua donde el Rage se va cargando: 550 (2x275) / 7.64s. Pruebas similares contra Luna Snow (4.33s) y un bot de practica (4.21s) dan tiempos parecidos pero sin vida confirmada, no se usaron",
      "rateRaw": "Attack Interval: The first three strikes have an interval of 0.27s between them, while the fourth strike has a 0.84s interval from the third strike. Cada garrazo carga 10/100 de Berserker Rage (confirmado en esta prueba, coincide con el dato oficial)",
      "dps": 72.0
    }
  },
  "Cloak & Dagger": {
    "basicAttack": {
      "name": "Darkforce Cloak + Lightforce Dagger (combinado)",
      "dmgRaw": "Cloak (Darkforce Cloak, spell field automatico): 80/s oficial. Dagger (Lightforce Dagger, ataque hibrido -- el mismo tiro dana O cura segun el objetivo): 18 dmg x 2.27 golpes/s = 40.9/s oficial. Se suman ambas personas porque representan el daño principal del mismo héroe (pedido de Xavier, 2026-08-16, guia mobalytics.gg/marvel-rivals/cloak-and-dagger-guide). Corregido con datos reales de Xavier en partida (2026-08-16) contra Black Widow (275 de vida) probando cada persona por separado: Cloak sola la vence en 3.56s (77.2 dps real); Dagger sola (con una recarga completa, 12+4=16 disparos en total) la vence en 9.19s (29.9 dps real, mas bajo que el teorico porque si se cuenta la recarga)",
      "dps": 107.1
    },
    "primaryHeal": {
      "name": "Dagger Storm",
      "key": "Right Click",
      "hps": 86.6,
      "raw": "Healing Amount: 50/s oficial -- verificado en vivo en la pagina oficial 2026-08-16; una guia comunitaria (mobalytics) decia 45/s pero puede estar desactualizada de parche, se prioriza el dato oficial. Corregido con dato real de Xavier en partida (2026-08-16) curando a un bot aliado de Galacta con los 200 de vida estandar de la prueba en 2.31s (200/2.31=86.6 hps real). Dagger es la unica de las dos personas de Cloak & Dagger que cura"
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
      "dmgRaw": "Piercing Arrow: 28-70 cargando 0.9s. Archer's Focus (pasiva): +0-90 de daño extra apuntando 0.9s, se suma al daño base de Piercing Arrow, tambien puede critear. Xavier eligio este escenario (headshot con carga completa) como el representativo, aunque el mismo aclaro que Hawkeye es dificil de calcular porque su daño real depende mucho de la punteria del jugador",
      "rateRaw": "Dato real de Xavier en partida (2026-08-16): levantar el arco, cargar Archer's Focus, disparar y dar en la cabeza mata a un dps en 1.32s desde frio (arranque en 0)",
      "dps": 189.4
    }
  },
  "Iron Man": {
    "basicAttack": {
      "name": "Repulsor Blast",
      "dmgRaw": "Damage: 35 (impacto directo) + 45 (Spell Field Damage, campo en 3m de radio) = 80 por disparo si ambas partes le pegan al mismo objetivo. Confirmado por Xavier (2026-08-16): 3 disparos ya eliminan a un dps normal de 250 de vida (3x80=240, coincide; con solo el directo de 35 harian falta 7+ disparos, no coincide)",
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
      "dmgRaw": "Damage: 6.5 x 50 balas = 325 por rafaga (rafaga de 1.25s + recarga ~1.5s, dato de Xavier 2026-08-16 -- se ignora la recarga con invulnerabilidad de su habilidad para no complicar, se cuenta solo 1 rafaga+recarga)",
      "rateRaw": "Fire Rate: 40 rounds per second, ciclo completo 2.75s",
      "dps": 118.2
    }
  },
  "Scarlet Witch": {
    "basicAttack": {
      "name": "Chaos Control",
      "dmgRaw": "Damage: 8.5 per hit. Dato real de Xavier en partida (2026-08-16) contra Black Widow (275 de vida): la vence en 3.36s",
      "rateRaw": "Fire Rate oficial: 0.1s per hit (85.0 dps teorico, usado antes, muy cerca del real)",
      "dps": 81.8
    }
  },
  "Winter Soldier": {
    "basicAttack": {
      "name": "Roterstern",
      "dmgRaw": "Projectile Damage: 80. Corregido de nuevo 2026-08-16 con dato real de Xavier contra Black Widow (275 de vida): mezcla realista de un jugador promedio, 2 disparos al cuerpo + 1 headshot, vence en 1.25s. Xavier probo tambien opciones puramente de cuerpo (99.6-101.9 dps) y puramente headshot con 2 tiros (348.1 dps, poco realista para un jugador promedio) antes de asentarse en esta mezcla como la representativa",
      "rateRaw": "Fire Rate oficial: 2.5 rounds per second (usado antes para el calculo simple de 200 dps, sin contar recarga ni mezcla de headshots)",
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
      "dmgRaw": "Damage: 80. Dato real de Xavier en partida (2026-08-16) contra Black Widow (275 de vida): 4 dagas la vencen en 1.78s",
      "rateRaw": "Fire Rate oficial: 2 rounds per second (160.0 dps teorico, usado antes; 4 dagas a 2/s = 2s, cerca del tiempo real medido)",
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
      "dmgRaw": "Damage: 70/s oficial, muy cerca de lo real. Dato real de Xavier en partida (2026-08-16) contra un bot de Galacta (250 de vida): lo vencio en 3.74s, quedandose con 25 de sus 100 municiones (uso 75/100)",
      "rateRaw": "Fire Rate: 20 rounds per second (70.0 dps teorico, usado antes)",
      "dps": 66.8
    },
    "primaryHeal": {
      "name": "Joyful Splash",
      "key": "Left Click",
      "hps": 110.6,
      "raw": "Healing Amount: 130/s oficial -- ataque hibrido (el mismo disparo dana O cura segun el objetivo), pero a diferencia de otros hibridos, el proyectil de Jeff traspasa aliados: puede danar a un enemigo Y curar a un aliado con el mismo disparo si estan en linea (dato de Xavier, 2026-08-16). Corregido con el promedio de 2 pruebas reales de Xavier en partida (2026-08-16) curando a un bot aliado de Galacta (250 de vida): recupero 175 de vida en 1.45s (175/1.45=120.7 hps) y en otra prueba recupero 225 de vida (el bot tenia 25/250) en 2.24s (225/2.24=100.4 hps). Promedio: (120.7+100.4)/2=110.6 hps"
    }
  },
  "Punisher": {
    "basicAttack": {
      "name": "Adjudication",
      "dmgRaw": "Damage: 19 damage per round. Dato real de Xavier en partida (2026-08-16) contra Black Widow (275 de vida): la vence en 1.59s usando 16 de sus 40 balas (le sobraron 24/40)",
      "rateRaw": "Fire Rate oficial: 10 rounds per second (190.0 dps teorico, usado antes; 16 balas a 10/s = 1.6s, coincide con el tiempo real medido)",
      "dps": 173.0
    }
  },
  "Luna Snow": {
    "basicAttack": {
      "name": "Light & Dark Ice",
      "dmgRaw": "Damage: 24 per round, 3 rounds per cycle (72 total). Dato real de Xavier en partida (2026-08-16) contra un bot de Galacta (250 de vida, target estandar): lo vencio en 1.84s usando 12 de sus 30 proyectiles (sobraron 18/30). Reemplaza dos pruebas anteriores menos directas (vs. un dps de 250 de vida generico: 146.2; y una prueba espejo Luna-vs-Luna a 275 de vida: 125.0) por ser el bot de Galacta el target estandar acordado para medir daño/curacion de sanadores",
      "rateRaw": "Fire Rate oficial: 0.5s per 3-shot cycle (144.0 dps teorico); se usa el tiempo medido en su lugar",
      "dps": 135.9
    },
    "primaryHeal": {
      "name": "Light & Dark Ice",
      "key": "Left Click",
      "hps": 130.7,
      "raw": "Healing Amount: 24 health per round, for a total of 72 health -- ataque hibrido (el mismo disparo dana O cura segun el objetivo). Dato real de Xavier en partida (2026-08-16) curando a un bot aliado de Galacta (250 de vida): lo bajaron a 50/250 (2/10 de su barra), Luna lo recupero a 250/250 (los 200 de vida restantes, 8/10) en 1.53s"
    }
  },
  "Adam Warlock": {
    "basicAttack": {
      "name": "Quantum Magic",
      "dmgRaw": "Damage: 60 damage per round. Dato real de Xavier en partida (2026-08-16) contra Black Widow (275 de vida): 5 lanzas de luz la vencen en 2.38s",
      "rateRaw": "Fire Rate oficial: 2 rounds per second (120.0 dps teorico, usado antes; 5 disparos a 2/s = 2.5s, cerca del tiempo real medido)",
      "dps": 115.5
    },
    "primaryHeal": {
      "name": "Avatar Life Stream",
      "key": "E",
      "hps": 226.7,
      "raw": "Healing Amount: 95 (rebota 2 veces a otros aliados cercanos), Healing Amount (self): 35, 2 cargas con 6s de recarga cada una -- se usa esta en vez de Soul Bond (SHIFT, 15/s) como curacion principal por ser la que realmente sostiene vida en pelea real. Dato real de Xavier en partida (2026-08-16) curando a un bot aliado de Galacta con un solo uso: no llego a los 200 de vida estandar de la prueba, quedo a unas 2 unidades de un total de 10 (aprox 97-98% de los 200, ~195 de vida real) en 0.86s (195/0.86=226.7 hps aproximado, con la incertidumbre del +-1% que aclaro Xavier)"
    }
  },
  "Rocket Raccoon": {
    "basicAttack": {
      "name": "Bombard Mode",
      "dmgRaw": "Damage: 16 damage per round. Dato real de Xavier en partida (2026-08-16) contra Black Widow (275 de vida): disparando al cuerpo (Rocket es pequeño y no siempre da headshot, dato de jugador promedio), la vence en 1.85s",
      "rateRaw": "Fire Rate oficial: 12.05 rounds per second (192.8 dps teorico, usado antes)",
      "dps": 148.6
    },
    "primaryHeal": {
      "name": "Repair Mode",
      "key": "Right Click",
      "hps": 75.5,
      "raw": "Healing Amount (Ally): 50/s oficial. Dato real de Xavier en partida (2026-08-16) curando a un bot aliado de Galacta con 3 bolitas de curacion disparadas de inmediato: recupero los 200 de vida estandar de la prueba en 2.65s (200/2.65=75.5 hps real, mas alto que el teorico de 50)"
    }
  },
  "Loki": {
    "basicAttack": {
      "name": "Mystical Missile",
      "dmgRaw": "Damage: 25 (spell field only, projectile itself deals 0) -- calculo teorico sin clones muy bajo. Dato real de Xavier en partida (2026-08-16) contra un bot de Galacta (250 de vida, con sus 3 clones activos disparando junto a el): lo vencio en 2.00s usando 5 de las 10 cargas de su baston (sobraron 5/10)",
      "rateRaw": "Fire Rate oficial: 1.75 rounds per second (43.8 dps teorico sin clones); se usa el tiempo medido con clones en su lugar",
      "dps": 125.0
    },
    "primaryHeal": {
      "name": "Mystical Missile",
      "key": "Left Click",
      "hps": 102.6,
      "raw": "Area Of Effect Healing: 40 per hit -- ataque hibrido (mismo disparo dana O cura), 40x1.75/s=70/s, x3 por sus clones = 210 teorico. Dato real de Xavier en partida (2026-08-16) curando a un bot aliado de Galacta (250 de vida): recupero 200 de vida en 1.95s (200/1.95=102.6 hps real, bastante mas bajo que el teorico de 210 -- probablemente los clones no siempre pegan los 3 al mismo objetivo en pelea real)"
    }
  },
  "Mantis": {
    "basicAttack": {
      "name": "Life Energy Blast",
      "dmgRaw": "Damage: 55 damage per round. Corregido de nuevo 2026-08-16 con dato real de Xavier disparando al cuerpo (dato de jugador promedio, mismo criterio que Winter Soldier/Human Torch) contra un bot de Galacta (250 de vida): lo vencio en 2.11s. Reemplaza la prueba anterior (4 proyectiles en 1.38s contra un dps de 250 de vida, sin aclarar si eran headshots) por ser esta mas representativa",
      "rateRaw": "Fire Rate oficial: 2.5 rounds per second (137.5 dps teorico); se usa el tiempo medido en su lugar",
      "dps": 118.5
    },
    "primaryHeal": {
      "name": "Healing Flower",
      "key": "Right Click",
      "hps": 88.9,
      "raw": "One-time Healing Amount: 60 -- curacion a rafagas (no continua), Xavier midio 3 usos consecutivos. Dato real de Xavier en partida (2026-08-16) curando a un bot aliado de Galacta (250 de vida): recupero los 200 de vida estandar de la prueba (2/10 a 10/10) con 3 hierbitas en 2.25s (200/2.25=88.9 hps real)"
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
