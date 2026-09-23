/* ---------------- COUNTERS IA ---------------- */
// Seccion editorial aparte de la matriz principal: para cada heroe, 3 personajes a los que le
// gana facil y 3 que lo counterean facil, con el razonamiento kit-vs-kit detras de cada eleccion.
// Es el criterio propio de la IA (a partir de los tags funcionales de HEROES en hero-roster.js --
// dive, shield, sniper, anti_heal, cc, aerial, etc. -- mas logica general del genero: dive castiga
// backline sin escape, escudo/CC castiga dive sin salida, shield-breaker/anti-heal castiga a quien
// depende de esa defensa, alcance castiga melee lento, aereo castiga terrestre sin respuesta
// antiaerea). NO es un promedio de la comunidad ni esta contrastado en partidas reales como la
// matriz de la pestana "Counters" (assets/js/matchups.js) -- puede no coincidir con ella. Cada
// heroe tiene exactamente 3 "beats" y 3 "losesTo", nombres deben calzar exacto con HEROES.n.
// Agregado 2026-09-22.
const AI_COUNTERS = {

"Angela": {
  beats: [
    {n:"Black Widow", why:"Su movilidad aérea la deja encima de una francotiradora sin escape antes de que pueda alejarse."},
    {n:"Hawkeye", why:"Mismo problema: alcance letal a distancia pero nula respuesta si lo agarra de cerca en el aire."},
    {n:"Rocket Raccoon", why:"La retaguardia estática no tiene forma de safarse de un dive aéreo constante."}
  ],
  losesTo: [
    {n:"Captain America", why:"Su peel y control de espacio castigan cualquier dive que se quede sin escape a tiempo."},
    {n:"Hulk", why:"El CC cuerpo a cuerpo la atrapa apenas se acerca, y su HP no aguanta el combo."},
    {n:"Moon Knight", why:"Suficiente burst y CC como para bajarla antes de que termine su ventana de daño."}
  ]
},
"Captain America": {
  beats: [
    {n:"Iron Fist", why:"Su kit anti-dive está pensado justo para neutralizar duelistas melee que buscan el 1v1 cerrado."},
    {n:"Black Panther", why:"Puede interceptarlo antes de que llegue a la retaguardia y ganarle la pelea cuerpo a cuerpo."},
    {n:"Psylocke", why:"Su peel corta el combo de asesinato antes de que termine, dejándola expuesta al contragolpe."}
  ],
  losesTo: [
    {n:"Hela", why:"El daño a distancia con anti-heal drena su sostenimiento más rápido de lo que puede cerrar distancia."},
    {n:"Namor", why:"El shield-break y el control de zona lo obligan a pelear en el terreno que domina el rival."},
    {n:"Storm", why:"La presión aérea sostenida lo mantiene fuera de alcance mientras zonea el espacio que quiere ocupar."}
  ]
},
"Deadpool (Vanguard)": {
  beats: [
    {n:"The Thing", why:"En el intercambio directo de escudo y golpes cuerpo a cuerpo, su autosanación inclina la pelea."},
    {n:"Groot", why:"Puede presionar el escudo con daño sostenido mientras se cura, algo que Groot no replica igual."},
    {n:"Squirrel Girl", why:"Su tanque de HP y curación absorbe la molestia sin que ella logre sacarlo de la pelea."}
  ],
  losesTo: [
    {n:"Namor", why:"El shield-break directo anula su ventaja de aguante antes de que la regeneración compense."},
    {n:"Winter Soldier", why:"El gancho lo saca de posición justo cuando más necesita quedarse cerca de su equipo."},
    {n:"Scarlet Witch", why:"El daño en área ignora que esté \"tankeando\" de frente y lo desgasta parejo con el resto."}
  ]
},
"Devil Dinosaur": {
  beats: [
    {n:"Wolverine", why:"Dos brawlers melee, pero su kit anti-dive y HP bruto absorben mejor el burst inicial."},
    {n:"Spider-Man", why:"El anti-dive está diseñado justo para castigar a los que saltan encima buscando un pick rápido."},
    {n:"Venom", why:"En el choque directo de tanques dive, su resistencia cuerpo a cuerpo se impone."}
  ],
  losesTo: [
    {n:"Hela", why:"El anti-heal apaga su sostenimiento en combate cuerpo a cuerpo justo cuando más lo necesita."},
    {n:"Magneto", why:"Puede zonearlo a distancia y evitar el enfrentamiento directo que Devil Dinosaur busca."},
    {n:"Punisher", why:"El daño sostenido a distancia lo desgasta antes de que logre cerrar la distancia."}
  ]
},
"Doctor Strange": {
  beats: [
    {n:"Black Cat", why:"El anti-dive corta el combo de asesinato de un flanker que depende de sorpresa y movilidad."},
    {n:"Daredevil", why:"Mismo problema: su escudo y control de espacio frenan el acercamiento antes de que conecte el daño."},
    {n:"Elsa Bloodstone", why:"El escudo absorbe el poke sostenido sin que ella tenga forma de romperlo rápido."}
  ],
  losesTo: [
    {n:"Namor", why:"Shield-breaker dedicado; su escudo deja de ser el muro que necesita para sostener el frente."},
    {n:"Hela", why:"El shield-break más el anti-heal lo dejan sin la defensa ni el sostenimiento que arma su juego."},
    {n:"Scarlet Witch", why:"El daño en área castiga la clumping que genera al sostener el escudo cerca del equipo."}
  ]
},
"Emma Frost": {
  beats: [
    {n:"Iron Fist", why:"Su CC interrumpe el combo de un dive melee antes de que termine de ejecutarlo."},
    {n:"Magik", why:"Puede controlar su entrada y ganar el intercambio directo gracias al escudo y el CC combinado."},
    {n:"Squirrel Girl", why:"El CC anula su movilidad molesta y el escudo aguanta el chip damage sin problema."}
  ],
  losesTo: [
    {n:"Hawkeye", why:"El alcance la castiga antes de que pueda cerrar distancia y usar su CC de cerca."},
    {n:"Winter Soldier", why:"El gancho la separa del equipo justo cuando más necesita el escudo cerca de sus aliados."},
    {n:"Punisher", why:"El daño sostenido a distancia desgasta el escudo sin que ella pueda responder de cerca."}
  ]
},
"Groot": {
  beats: [
    {n:"Cyclops", why:"El muro corta las líneas de daño a distancia y lo obliga a reposicionar constantemente."},
    {n:"Elsa Bloodstone", why:"El escudo absorbe el poke sostenido sin que ella logre derribarlo antes de que rote."},
    {n:"Punisher", why:"Puede bloquear las líneas de fuego con la pared y forzarlo a moverse de su posición ideal."}
  ],
  losesTo: [
    {n:"Namor", why:"Shield-breaker que también rompe muros; anula la utilidad principal de Groot en un intercambio."},
    {n:"Storm", why:"El control aéreo evita el muro por arriba, algo que Groot no puede bloquear."},
    {n:"Scarlet Witch", why:"El daño en área ignora el muro si el equipo ya está agrupado detrás de él."}
  ]
},
"Hulk": {
  beats: [
    {n:"Black Cat", why:"El CC pesado atrapa a un flanker melee antes de que pueda completar su combo de asesinato."},
    {n:"Iron Fist", why:"Mismo problema: sin espacio para maniobrar, el CC de Hulk gana el intercambio cuerpo a cuerpo."},
    {n:"The Hood", why:"Su brawl bruto y CC superan el dive/shield mixto de The Hood en la pelea directa."}
  ],
  losesTo: [
    {n:"Hawkeye", why:"El alcance lo castiga constantemente sin que pueda cerrar distancia con su movilidad limitada."},
    {n:"Hela", why:"El anti-heal apaga su sostenimiento cuerpo a cuerpo justo cuando más lo necesita en la pelea."},
    {n:"Storm", why:"La presión aérea y de área lo desgasta desde una zona que no puede alcanzar fácil."}
  ]
},
"Magneto": {
  beats: [
    {n:"Elsa Bloodstone", why:"Su resistencia al poke sostenido hace que el chip damage de ella no rinda lo suficiente."},
    {n:"Punisher", why:"El escudo y la zona lo obligan a reposicionar constantemente sin ganar terreno real."},
    {n:"Cyclops", why:"Puede absorber el burst a distancia sin que Cyclops logre romper su control de zona."}
  ],
  losesTo: [
    {n:"Namor", why:"Shield-breaker dedicado que anula justo la resistencia al poke que define a Magneto."},
    {n:"Black Panther", why:"El dive directo lo saca del rango donde su zona y escudo son útiles."},
    {n:"Moon Knight", why:"Suficiente burst como para romper su defensa antes de que pueda reposicionar."}
  ]
},
"Peni Parker": {
  beats: [
    {n:"The Thing", why:"Un brawler lento que tiene que cruzar la zona de negación pierde HP antes de llegar."},
    {n:"Hulk", why:"Mismo problema: el área de negación castiga cualquier acercamiento directo sin salto ni movilidad especial."},
    {n:"Groot", why:"En el duelo de control de zona, sus torretas sostienen más presión constante que el muro."}
  ],
  losesTo: [
    {n:"Spider-Man", why:"La movilidad vertical esquiva la zona de negación y llega directo a destruir las torretas."},
    {n:"Iron Man", why:"El daño a distancia elimina las torretas antes de que puedan cumplir su función de control."},
    {n:"Storm", why:"Puede saltarse la zona por el aire y presionar desde un ángulo que Peni no cubre."}
  ]
},
"Rogue": {
  beats: [
    {n:"Luna Snow", why:"La sanadora estática no tiene forma de escapar de un dive aéreo sostenido y directo."},
    {n:"Adam Warlock", why:"Mismo problema de movilidad limitada frente a una asesina que ataca desde el aire."},
    {n:"Cyclops", why:"Su movilidad la deja encima de un duelista de rango sin mucha respuesta de cerca."}
  ],
  losesTo: [
    {n:"Emma Frost", why:"El CC corta el combo de robo de habilidad antes de que pueda ejecutarlo del todo."},
    {n:"Doctor Strange", why:"El anti-dive y el escudo frenan el acercamiento antes de que conecte el daño real."},
    {n:"Hela", why:"El anti-heal apaga cualquier sostenimiento que robe, dejándola expuesta al resto del daño enemigo."}
  ]
},
"The Hood": {
  beats: [
    {n:"Rocket Raccoon", why:"Puede meterse a la retaguardia vía Void Walk antes de que la torreta reaccione a tiempo."},
    {n:"Ultron", why:"Mismo problema: la movilidad para meterse atrás castiga a una retaguardia sin escape inmediato."},
    {n:"Cyclops", why:"El escudo aguanta el poke mientras la movilidad amenaza con romper su posicionamiento seguro."}
  ],
  losesTo: [
    {n:"Moon Knight", why:"Suficiente burst y CC como para castigar la entrada antes de que use su movilidad."},
    {n:"Scarlet Witch", why:"El daño en área ignora el escudo individual y desgasta parejo con el resto del equipo."},
    {n:"Namor", why:"Shield-breaker que anula justo la defensa que sostiene su doble rol de tanque/dive."}
  ]
},
"The Thing": {
  beats: [
    {n:"Black Panther", why:"El anti-dive está pensado justo para frenar a un asesino melee que busca la retaguardia."},
    {n:"Wolverine", why:"En el choque directo cuerpo a cuerpo, su HP bruto y resistencia se imponen."},
    {n:"Venom", why:"Mismo problema: dos brawlers dive, pero su kit anti-dive castiga mejor la entrada."}
  ],
  losesTo: [
    {n:"Punisher", why:"El daño sostenido a distancia lo desgasta antes de que logre cerrar el espacio."},
    {n:"Storm", why:"La presión aérea lo mantiene fuera de rango, anulando su fuerza cuerpo a cuerpo."},
    {n:"Hela", why:"El anti-heal apaga cualquier sostenimiento justo cuando más lo necesita en el intercambio directo."}
  ]
},
"Thor": {
  beats: [
    {n:"Iron Fist", why:"El brawl bruto y el HP alto ganan el intercambio directo cuerpo a cuerpo casi siempre."},
    {n:"Daredevil", why:"Mismo problema de resistencia frente a un dive melee sin forma de sostener la pelea."},
    {n:"Squirrel Girl", why:"Puede absorber su molestia constante sin que ella logre sacarlo de la pelea."}
  ],
  losesTo: [
    {n:"Namor", why:"El shield-break y el control de zona lo obligan a pelear lejos de donde quiere."},
    {n:"Hela", why:"El anti-heal apaga su sostenimiento en combate cuerpo a cuerpo justo cuando más lo necesita."},
    {n:"Storm", why:"La presión aérea sostenida lo desgasta desde una zona que su dive limitado no alcanza bien."}
  ]
},
"Venom": {
  beats: [
    {n:"Black Widow", why:"La movilidad para llegar a la retaguardia castiga a una francotiradora sin escape cercano."},
    {n:"Elsa Bloodstone", why:"Mismo problema: dive directo contra una duelista de rango sin mucha respuesta de cerca."},
    {n:"Rocket Raccoon", why:"Puede meterse a la retaguardia antes de que la torreta logre reaccionar a tiempo."}
  ],
  losesTo: [
    {n:"Captain America", why:"Su peel y control de espacio castigan el dive sin escape a tiempo."},
    {n:"The Thing", why:"El anti-dive frena la entrada antes de que pueda ejecutar el combo completo."},
    {n:"Moon Knight", why:"Suficiente burst y CC como para bajarlo antes de que termine su ventana de daño."}
  ]
},

"Black Cat": {
  beats: [
    {n:"Hawkeye", why:"La movilidad la deja encima de una francotiradora sin escape antes de que pueda alejarse."},
    {n:"Luna Snow", why:"La sanadora estática no tiene forma de escapar de un flanker rápido y directo."},
    {n:"Rocket Raccoon", why:"Puede meterse a la retaguardia antes de que la torreta logre reaccionar a tiempo."}
  ],
  losesTo: [
    {n:"Hulk", why:"El CC pesado la atrapa antes de que pueda completar el combo de asesinato."},
    {n:"Doctor Strange", why:"El anti-dive corta el combo antes de que termine de ejecutarlo."},
    {n:"Moon Knight", why:"Suficiente burst y CC como para bajarla antes de que termine su ventana de daño."}
  ]
},
"Black Panther": {
  beats: [
    {n:"Cyclops", why:"La movilidad lo deja encima de un duelista de rango sin mucha respuesta de cerca."},
    {n:"Adam Warlock", why:"Mismo problema de movilidad limitada frente a un asesino que ataca de sorpresa."},
    {n:"Peni Parker", why:"Puede llegar directo a destruir las torretas antes de que la zona lo frene del todo."}
  ],
  losesTo: [
    {n:"Captain America", why:"Puede interceptarlo antes de que llegue a la retaguardia y ganarle la pelea directa."},
    {n:"The Thing", why:"El anti-dive está pensado justo para frenar a un asesino melee que busca la retaguardia."},
    {n:"Namor", why:"El control de zona y el shield-break lo obligan a pelear en terreno desfavorable."}
  ]
},
"Black Widow": {
  beats: [
    {n:"Groot", why:"El poke sostenido a distancia desgasta el muro sin que ella se exponga."},
    {n:"Hulk", why:"El alcance la deja castigarlo constantemente sin que él pueda cerrar distancia fácil."},
    {n:"The Thing", why:"Mismo problema: daño a distancia contra un brawler lento sin forma de cerrar el hueco."}
  ],
  losesTo: [
    {n:"Spider-Man", why:"La movilidad lo deja encima de ella antes de que pueda reaccionar con distancia."},
    {n:"Venom", why:"Mismo problema: dive directo contra una francotiradora sin escape cercano."},
    {n:"Iron Fist", why:"El cierre de distancia rápido anula la ventaja de rango que define su juego."}
  ]
},
"Blade": {
  beats: [
    {n:"Cloak & Dagger", why:"El anti-heal apaga justo el sostenimiento continuo que define a esta pareja de soporte."},
    {n:"Luna Snow", why:"Mismo problema: su curación se vuelve irrelevante bajo el debuff de anti-sanación."},
    {n:"Mantis", why:"El anti-heal anula su sostenimiento en combate cuerpo a cuerpo, quitándole su mayor fortaleza."}
  ],
  losesTo: [
    {n:"Adam Warlock", why:"La curación explosiva puede compensar el debuff de anti-heal si llega a tiempo."},
    {n:"Emma Frost", why:"El CC corta su combo melee antes de que termine de ejecutarlo."},
    {n:"Storm", why:"La presión aérea lo mantiene fuera de rango cuerpo a cuerpo, anulando su fuerza principal."}
  ]
},
"Cyclops": {
  beats: [
    {n:"Rocket Raccoon", why:"El burst a distancia elimina la retaguardia estática antes de que pueda reaccionar."},
    {n:"Ultron", why:"Mismo problema: daño a distancia contra una retaguardia sin mucha movilidad de escape."},
    {n:"Groot", why:"El poke sostenido desgasta el muro sin que Groot logre presionarlo de cerca."}
  ],
  losesTo: [
    {n:"Black Panther", why:"La movilidad lo deja encima de él antes de que pueda mantener la distancia."},
    {n:"Psylocke", why:"Mismo problema: dive directo contra un duelista de rango sin mucha respuesta de cerca."},
    {n:"Magneto", why:"La resistencia al poke hace que su daño a distancia no rinda lo suficiente."}
  ]
},
"Daredevil": {
  beats: [
    {n:"Hawkeye", why:"La movilidad lo deja encima de una francotiradora sin escape antes de que pueda alejarse."},
    {n:"Jeff the Land Shark", why:"El dive directo castiga a un soporte móvil pero frágil de cerca."},
    {n:"Rocket Raccoon", why:"Puede llegar a la retaguardia antes de que la torreta reaccione a tiempo."}
  ],
  losesTo: [
    {n:"Doctor Strange", why:"El anti-dive corta el combo antes de que termine de ejecutarlo."},
    {n:"Thor", why:"El brawl bruto y el HP alto ganan el intercambio directo cuerpo a cuerpo."},
    {n:"Moon Knight", why:"Suficiente burst y CC como para bajarlo antes de que termine su ventana de daño."}
  ]
},
"Deadpool (Duelist)": {
  beats: [
    {n:"Elsa Bloodstone", why:"El sostenimiento propio absorbe el poke sostenido mientras cierra distancia con movilidad."},
    {n:"Groot", why:"Puede presionar el escudo con daño constante mientras se cura, desgastándolo con el tiempo."},
    {n:"Squirrel Girl", why:"Su HP y autosanación absorben la molestia constante sin salir mal parado."}
  ],
  losesTo: [
    {n:"Hela", why:"El anti-heal apaga justo el sostenimiento que define su estilo de juego agresivo."},
    {n:"Winter Soldier", why:"El gancho lo saca de posición justo cuando más necesita quedarse cerca del equipo."},
    {n:"Scarlet Witch", why:"El daño en área ignora su sostenimiento individual y lo desgasta parejo con el resto."}
  ]
},
"Elsa Bloodstone": {
  beats: [
    {n:"The Thing", why:"El poke sostenido desgasta a un brawler lento sin forma de cerrar el hueco rápido."},
    {n:"Hulk", why:"Mismo problema: daño constante a distancia contra un melee sin mucha movilidad de cierre."},
    {n:"Peni Parker", why:"Puede destruir las torretas desde distancia sin exponerse a la zona de negación."}
  ],
  losesTo: [
    {n:"Black Panther", why:"La movilidad lo deja encima de ella antes de que pueda mantener la distancia."},
    {n:"Venom", why:"Mismo problema: dive directo contra una duelista de rango sin mucha respuesta de cerca."},
    {n:"Doctor Strange", why:"El escudo absorbe el poke sostenido sin que ella logre romperlo rápido."}
  ]
},
"Gorr": {
  beats: [
    {n:"Hawkeye", why:"La movilidad melee lo deja encima de una francotiradora sin escape antes de que reaccione."},
    {n:"Luna Snow", why:"La sanadora estática no tiene forma de escapar de un dive melee sostenido."},
    {n:"Rocket Raccoon", why:"Puede meterse a la retaguardia antes de que la torreta logre reaccionar a tiempo."}
  ],
  losesTo: [
    {n:"Captain America", why:"El peel y el anti-dive frenan la entrada antes de que ejecute el combo."},
    {n:"Hela", why:"El anti-heal apaga su autosanación justo cuando más la necesita en el intercambio directo."},
    {n:"Storm", why:"La presión aérea sostenida lo desgasta desde una zona que su dive terrestre no alcanza."}
  ]
},
"Hawkeye": {
  beats: [
    {n:"Groot", why:"El poke sostenido a distancia desgasta el muro sin que ella se exponga al frente."},
    {n:"Hulk", why:"El alcance letal castiga constantemente a un brawler sin mucha movilidad de cierre."},
    {n:"The Thing", why:"Mismo problema: daño a distancia contra un melee lento que no puede cerrar el hueco."}
  ],
  losesTo: [
    {n:"Spider-Man", why:"La movilidad lo deja encima de ella antes de que pueda reaccionar con distancia."},
    {n:"Black Panther", why:"Mismo problema: dive directo contra una francotiradora sin escape cercano."},
    {n:"Iron Fist", why:"El cierre de distancia rápido anula la ventaja de rango que define su juego."}
  ]
},
"Hela": {
  beats: [
    {n:"Doctor Strange", why:"El shield-break y el anti-heal anulan justo las dos defensas que sostienen su juego."},
    {n:"Groot", why:"Mismo problema: rompe el muro y apaga cualquier sostenimiento que el equipo intente detrás de él."},
    {n:"Cloak & Dagger", why:"El anti-heal apaga justo el sostenimiento continuo que define a esta pareja de soporte."}
  ],
  losesTo: [
    {n:"Spider-Man", why:"La movilidad lo deja encima de ella antes de que pueda mantener la distancia segura."},
    {n:"Black Panther", why:"Mismo problema: dive directo contra una duelista de rango sin mucha respuesta de cerca."},
    {n:"Psylocke", why:"El cierre de distancia rápido anula la ventaja de rango que define su estilo de juego."}
  ]
},
"Human Torch": {
  beats: [
    {n:"Rocket Raccoon", why:"La presión aérea castiga a una retaguardia estática sin mucha respuesta antiaérea."},
    {n:"Ultron", why:"Mismo problema: el burst desde el aire desgasta una retaguardia sin escape inmediato."},
    {n:"The Thing", why:"Puede mantenerse fuera del alcance cuerpo a cuerpo mientras castiga con daño sostenido."}
  ],
  losesTo: [
    {n:"Hawkeye", why:"El alcance hitscan lo castiga desde tierra sin que su movilidad aérea lo salve del todo."},
    {n:"Black Widow", why:"Mismo problema: precisión a distancia contra un objetivo aéreo predecible en su patrón de vuelo."},
    {n:"Moon Knight", why:"Suficiente burst y CC como para bajarlo antes de que termine su ventana de daño."}
  ]
},
"Iron Fist": {
  beats: [
    {n:"Elsa Bloodstone", why:"El cierre de distancia rápido anula la ventaja de rango que ella necesita mantener."},
    {n:"Punisher", why:"Mismo problema: dive directo contra un duelista de rango sin mucha respuesta de cerca."},
    {n:"Rocket Raccoon", why:"Puede llegar a la retaguardia antes de que la torreta logre reaccionar a tiempo."}
  ],
  losesTo: [
    {n:"Captain America", why:"Su kit anti-dive está pensado justo para neutralizar duelistas melee del 1v1 cerrado."},
    {n:"Emma Frost", why:"El CC interrumpe el combo antes de que termine de ejecutarlo."},
    {n:"Hulk", why:"El CC pesado lo atrapa antes de que pueda completar el combo de asesinato."}
  ]
},
"Iron Man": {
  beats: [
    {n:"Peni Parker", why:"El daño a distancia destruye las torretas antes de que puedan cumplir su función."},
    {n:"Groot", why:"El burst aéreo desgasta el muro desde un ángulo que Groot no puede bloquear fácil."},
    {n:"Rocket Raccoon", why:"Mismo problema: burst a distancia contra una retaguardia sin mucha movilidad de escape."}
  ],
  losesTo: [
    {n:"Hawkeye", why:"El alcance hitscan lo castiga desde tierra sin que su movilidad aérea lo salve del todo."},
    {n:"Black Widow", why:"Mismo problema: precisión a distancia contra un objetivo aéreo predecible en su patrón de vuelo."},
    {n:"Storm", why:"Otro héroe aéreo con más presión de área sostenida gana el duelo en el cielo."}
  ]
},
"Magik": {
  beats: [
    {n:"Hawkeye", why:"La movilidad la deja encima de una francotiradora sin escape antes de que pueda alejarse."},
    {n:"Adam Warlock", why:"Mismo problema de movilidad limitada frente a una asesina que ataca de sorpresa."},
    {n:"Luna Snow", why:"La sanadora estática no tiene forma de escapar de un dive melee sostenido y directo."}
  ],
  losesTo: [
    {n:"Emma Frost", why:"El CC corta el combo de asesinato antes de que termine de ejecutarlo del todo."},
    {n:"Doctor Strange", why:"El anti-dive frena la entrada antes de que pueda ejecutar el combo completo."},
    {n:"Moon Knight", why:"Suficiente burst y CC como para bajarla antes de que termine su ventana de daño."}
  ]
},
"Mister Fantastic": {
  beats: [
    {n:"Black Cat", why:"El anti-dive castiga justo a un flanker melee que busca el 1v1 cerrado y rápido."},
    {n:"Iron Fist", why:"Mismo problema: su kit está pensado para frenar duelistas de dive de cerca."},
    {n:"Elsa Bloodstone", why:"El área de negación y el poke desgastan a otra duelista de rango sin cerrar distancia."}
  ],
  losesTo: [
    {n:"Namor", why:"El shield-break y el control de zona lo obligan a pelear en terreno desfavorable."},
    {n:"Hela", why:"El anti-heal y el shield-break combinados apagan justo sus dos herramientas defensivas principales."},
    {n:"Storm", why:"La presión aérea sostenida lo desgasta desde una zona que su área de negación no cubre."}
  ]
},
"Moon Knight": {
  beats: [
    {n:"Doctor Strange", why:"El daño verdadero ignora la mitigación del escudo, algo que pocos duelistas logran."},
    {n:"Groot", why:"Mismo problema: el true damage no se ve reducido por la resistencia del muro."},
    {n:"Emma Frost", why:"Suficiente burst y CC como para ganarle el intercambio directo de control."}
  ],
  losesTo: [
    {n:"Hawkeye", why:"El alcance lo castiga desde lejos antes de que pueda cerrar distancia con su burst."},
    {n:"Black Widow", why:"Mismo problema: precisión a distancia contra un duelista que necesita acercarse para su daño real."},
    {n:"Psylocke", why:"El cierre de distancia rápido y el contra-stealth anulan su ventana de burst antes de tiempo."}
  ]
},
"Namor": {
  beats: [
    {n:"Doctor Strange", why:"El shield-break anula justo la defensa principal que sostiene su juego de vanguardia."},
    {n:"Magneto", why:"Mismo problema: rompe la resistencia al poke que define su estilo defensivo."},
    {n:"Groot", why:"El shield-break funciona igual contra el muro, quitándole su única forma de proteger al equipo."}
  ],
  losesTo: [
    {n:"Spider-Man", why:"La movilidad lo deja encima de él antes de que pueda mantener la distancia segura."},
    {n:"Black Panther", why:"Mismo problema: dive directo contra un duelista de rango sin mucha respuesta de cerca."},
    {n:"Moon Knight", why:"Suficiente burst y CC como para bajarlo antes de que termine su control de zona."}
  ]
},
"Phoenix": {
  beats: [
    {n:"Rocket Raccoon", why:"La movilidad aérea castiga a una retaguardia estática sin mucha respuesta antiaérea."},
    {n:"Ultron", why:"Mismo problema: burst desde el aire desgasta una retaguardia sin escape inmediato."},
    {n:"Groot", why:"Puede castigar el muro desde un ángulo aéreo que Groot no puede bloquear fácil."}
  ],
  losesTo: [
    {n:"Hawkeye", why:"El alcance hitscan la castiga desde tierra sin que su movilidad aérea la salve del todo."},
    {n:"Black Widow", why:"Mismo problema: precisión a distancia contra un objetivo aéreo predecible en su patrón de vuelo."},
    {n:"Storm", why:"Otro héroe aéreo con más presión de área sostenida gana el duelo en el cielo."}
  ]
},
"Psylocke": {
  beats: [
    {n:"Cyclops", why:"La movilidad la deja encima de un duelista de rango sin mucha respuesta de cerca."},
    {n:"Moon Knight", why:"El contra-sigilo y la movilidad anulan su ventana de burst antes de que la ejecute."},
    {n:"Rocket Raccoon", why:"Puede meterse a la retaguardia antes de que la torreta logre reaccionar a tiempo."}
  ],
  losesTo: [
    {n:"Hulk", why:"El CC pesado la atrapa antes de que pueda completar el combo de asesinato."},
    {n:"Doctor Strange", why:"El anti-dive frena la entrada antes de que pueda ejecutar el combo completo."},
    {n:"Emma Frost", why:"El CC corta el combo antes de que termine de ejecutarlo del todo."}
  ]
},
"Punisher": {
  beats: [
    {n:"Groot", why:"El shield-break y el daño sostenido desgastan el muro sin que Groot pueda responder rápido."},
    {n:"Doctor Strange", why:"Mismo problema: el shield-break anula justo la defensa que sostiene su juego."},
    {n:"The Thing", why:"El daño constante a distancia desgasta a un brawler lento sin forma de cerrar el hueco."}
  ],
  losesTo: [
    {n:"Black Panther", why:"La movilidad lo deja encima de él antes de que pueda mantener la distancia."},
    {n:"Iron Fist", why:"Mismo problema: dive directo contra un duelista de rango sin mucha respuesta de cerca."},
    {n:"Storm", why:"La presión aérea sostenida lo desgasta desde una zona que su alcance terrestre no cubre bien."}
  ]
},
"Scarlet Witch": {
  beats: [
    {n:"Deadpool (Vanguard)", why:"El daño en área ignora la autosanación individual y lo desgasta parejo con el resto."},
    {n:"The Hood", why:"Mismo problema: el AoE ignora el escudo individual y castiga el agrupamiento del equipo."},
    {n:"Groot", why:"El daño en área no se ve frenado igual que el daño directo contra el muro."}
  ],
  losesTo: [
    {n:"Hawkeye", why:"El alcance la castiga desde lejos antes de que pueda cerrar distancia con su burst."},
    {n:"Black Widow", why:"Mismo problema: precisión a distancia contra una duelista que necesita acercarse para su daño real."},
    {n:"Psylocke", why:"El cierre de distancia rápido anula su ventana de control antes de que la ejecute del todo."}
  ]
},
"Spider-Man": {
  beats: [
    {n:"Hela", why:"La movilidad vertical lo deja encima de ella antes de que pueda mantener la distancia segura."},
    {n:"Namor", why:"Mismo problema: dive directo contra un duelista de rango sin mucha respuesta de cerca."},
    {n:"Peni Parker", why:"Puede llegar directo a destruir las torretas antes de que la zona lo frene del todo."}
  ],
  losesTo: [
    {n:"Captain America", why:"Puede interceptarlo antes de que llegue a la retaguardia y ganarle la pelea directa."},
    {n:"The Thing", why:"El anti-dive está pensado justo para frenar a un asesino melee que busca la retaguardia."},
    {n:"Moon Knight", why:"Suficiente burst y CC como para bajarlo antes de que termine su ventana de daño."}
  ]
},
"Squirrel Girl": {
  beats: [
    {n:"Adam Warlock", why:"Su movilidad constante molesta a un soporte estático sin mucha forma de safarse."},
    {n:"Luna Snow", why:"Mismo problema: la presión constante desgasta a una sanadora poco móvil."},
    {n:"Rocket Raccoon", why:"Puede meterse a la retaguardia antes de que la torreta logre reaccionar a tiempo."}
  ],
  losesTo: [
    {n:"Hulk", why:"El CC pesado le corta la movilidad constante que define su estilo de juego molesto."},
    {n:"Emma Frost", why:"Mismo problema: el CC anula justo la ventaja de movilidad que necesita para funcionar."},
    {n:"Hela", why:"El anti-heal apaga cualquier sostenimiento que tenga, dejándola expuesta al resto del daño enemigo."}
  ]
},
"Star-Lord": {
  beats: [
    {n:"Rocket Raccoon", why:"La movilidad aérea castiga a una retaguardia estática sin mucha respuesta antiaérea."},
    {n:"Ultron", why:"Mismo problema: dive aéreo desgasta una retaguardia sin escape inmediato."},
    {n:"Luna Snow", why:"La sanadora estática no tiene forma de escapar de un dive aéreo sostenido."}
  ],
  losesTo: [
    {n:"Hawkeye", why:"El alcance hitscan lo castiga desde tierra sin que su movilidad aérea lo salve del todo."},
    {n:"Black Widow", why:"Mismo problema: precisión a distancia contra un objetivo aéreo predecible en su patrón de vuelo."},
    {n:"Storm", why:"Otro héroe aéreo con más presión de área sostenida gana el duelo en el cielo."}
  ]
},
"Storm": {
  beats: [
    {n:"The Thing", why:"La presión aérea lo mantiene fuera de rango, anulando su fuerza cuerpo a cuerpo."},
    {n:"Hulk", why:"Mismo problema: puede castigarlo desde una zona que su movilidad terrestre no alcanza."},
    {n:"Groot", why:"El área de negación aérea castiga el muro desde un ángulo que no puede bloquear."}
  ],
  losesTo: [
    {n:"Hawkeye", why:"El alcance hitscan la castiga desde tierra sin que su movilidad aérea la salve del todo."},
    {n:"Black Widow", why:"Mismo problema: precisión a distancia contra un objetivo aéreo predecible en su patrón de vuelo."},
    {n:"Iron Man", why:"Otro héroe aéreo con más burst directo gana el duelo en el cielo si se enfocan."}
  ]
},
"Winter Soldier": {
  beats: [
    {n:"Doctor Strange", why:"El shield-break y el gancho anulan justo la defensa que sostiene su juego de vanguardia."},
    {n:"Groot", why:"Mismo problema: el shield-break funciona igual contra el muro, quitándole su forma de proteger al equipo."},
    {n:"Cloak & Dagger", why:"El gancho puede separarlos del resto del equipo antes de que reaccionen con movilidad."}
  ],
  losesTo: [
    {n:"Black Panther", why:"La movilidad lo deja encima de él antes de que pueda usar el gancho a distancia."},
    {n:"Iron Fist", why:"Mismo problema: dive directo contra un duelista que necesita espacio para su combo de gancho."},
    {n:"Psylocke", why:"El cierre de distancia rápido anula la ventaja de rango que define su estilo de juego."}
  ]
},
"Wolverine": {
  beats: [
    {n:"Hawkeye", why:"La movilidad melee lo deja encima de una francotiradora sin escape antes de que reaccione."},
    {n:"Luna Snow", why:"La sanadora estática no tiene forma de escapar de un dive melee sostenido y directo."},
    {n:"Rocket Raccoon", why:"Puede meterse a la retaguardia antes de que la torreta logre reaccionar a tiempo."}
  ],
  losesTo: [
    {n:"The Thing", why:"En el choque directo cuerpo a cuerpo, su HP bruto y resistencia se imponen."},
    {n:"Hela", why:"El anti-heal apaga su autosanación justo cuando más la necesita en el intercambio directo."},
    {n:"Captain America", why:"El peel y el anti-dive frenan la entrada antes de que ejecute el combo completo."}
  ]
},

"Adam Warlock": {
  beats: [
    {n:"Blade", why:"La curación explosiva puede compensar el debuff de anti-heal antes de que rinda del todo."},
    {n:"Winter Soldier", why:"El revive niega picks individuales, algo que castiga directamente el estilo de gancho y burst."},
    {n:"Hela", why:"Mismo problema: revivir a un aliado eliminado anula gran parte del valor de su burst focalizado."}
  ],
  losesTo: [
    {n:"Black Panther", why:"Su poca movilidad lo deja expuesto a un dive directo sin mucha forma de escapar."},
    {n:"Spider-Man", why:"Mismo problema: asesino melee móvil contra un soporte estático sin escape inmediato."},
    {n:"Psylocke", why:"El contra-sigilo y la movilidad lo dejan sin tiempo de reaccionar al acercamiento."}
  ]
},
"Cloak & Dagger": {
  beats: [
    {n:"Black Cat", why:"El peel y la movilidad de escape frustran el combo de asesinato de un flanker melee."},
    {n:"Iron Fist", why:"Mismo problema: pueden reposicionarse antes de que termine el combo de dive cerrado."},
    {n:"Daredevil", why:"El dash constante los saca de la línea de ataque antes de que conecte el daño."}
  ],
  losesTo: [
    {n:"Blade", why:"El anti-heal apaga justo el sostenimiento continuo que define a esta pareja de soporte."},
    {n:"Winter Soldier", why:"El gancho los separa del equipo justo cuando más necesitan estar cerca de aliados."},
    {n:"Hela", why:"Mismo problema: el anti-heal y el burst a distancia superan su movilidad de escape."}
  ]
},
"Deadpool (Strategist)": {
  beats: [
    {n:"The Thing", why:"El sostenimiento propio y la movilidad absorben la presión de un brawler lento y directo."},
    {n:"Groot", why:"Puede presionar el escudo con daño constante mientras se cura, algo que Groot no replica igual."},
    {n:"Squirrel Girl", why:"Su HP y autosanación absorben la molestia constante sin salir mal parado del intercambio."}
  ],
  losesTo: [
    {n:"Hela", why:"El anti-heal apaga justo el sostenimiento que define su estilo de soporte agresivo."},
    {n:"Winter Soldier", why:"El gancho lo saca de posición justo cuando más necesita quedarse cerca del equipo."},
    {n:"Scarlet Witch", why:"El daño en área ignora su sostenimiento individual y lo desgasta parejo con el resto."}
  ]
},
"Gambit": {
  beats: [
    {n:"Blade", why:"La curación explosiva compensa el debuff de anti-heal antes de que rinda del todo en combate."},
    {n:"Punisher", why:"El área de negación castiga el posicionamiento sostenido que necesita para su daño a distancia."},
    {n:"Winter Soldier", why:"El burst-heal puede compensar picks individuales del gancho si llega a tiempo con la curación."}
  ],
  losesTo: [
    {n:"Black Panther", why:"Su poca movilidad lo deja expuesto a un dive directo sin mucha forma de escapar."},
    {n:"Spider-Man", why:"Mismo problema: asesino melee móvil contra un soporte con movilidad limitada de escape."},
    {n:"Moon Knight", why:"Suficiente burst y CC como para bajarlo antes de que reaccione con su curación."}
  ]
},
"Invisible Woman": {
  beats: [
    {n:"Elsa Bloodstone", why:"El escudo absorbe el poke sostenido sin que ella logre romperlo rápido con su daño."},
    {n:"Cyclops", why:"Mismo problema: el escudo aguanta el burst a distancia sin que Cyclops rompa la defensa."},
    {n:"Punisher", why:"El escudo y el AoE de curación compensan el daño sostenido que él intenta aplicar."}
  ],
  losesTo: [
    {n:"Namor", why:"El shield-break anula justo la defensa principal que sostiene su rol de soporte."},
    {n:"Black Panther", why:"Su poca movilidad la deja expuesta a un dive directo sin escape inmediato."},
    {n:"Hela", why:"El shield-break y el anti-heal combinados apagan sus dos herramientas defensivas principales."}
  ]
},
"Jeff the Land Shark": {
  beats: [
    {n:"Rocket Raccoon", why:"La movilidad y el escape frustran cualquier intento de aislarlo en la retaguardia rival."},
    {n:"Ultron", why:"Mismo problema: puede escapar de picks individuales antes de que el daño a distancia lo baje."},
    {n:"Hulk", why:"Su escape (la ballena) niega el CC pesado justo antes de que conecte el combo completo."}
  ],
  losesTo: [
    {n:"Blade", why:"El anti-heal apaga el sostenimiento de curación constante que define su estilo de soporte móvil."},
    {n:"Winter Soldier", why:"El gancho puede interrumpir el escape antes de que termine de activarse del todo."},
    {n:"Hela", why:"Mismo problema: el anti-heal y el burst a distancia superan su movilidad de escape."}
  ]
},
"Jubilee": {
  beats: [
    {n:"Blade", why:"La curación explosiva compensa el debuff de anti-heal antes de que rinda del todo en combate."},
    {n:"Winter Soldier", why:"El burst-heal puede salvar a un aliado del gancho si llega a tiempo con la curación."},
    {n:"Punisher", why:"El AoE de curación compensa el daño sostenido que él intenta aplicar al equipo."}
  ],
  losesTo: [
    {n:"Black Panther", why:"Su movilidad limitada la deja expuesta a un dive directo sin escape inmediato."},
    {n:"Spider-Man", why:"Mismo problema: asesino melee móvil contra una soporte con poca respuesta de cerca."},
    {n:"Moon Knight", why:"Suficiente burst y CC como para bajarla antes de que reaccione con su curación."}
  ]
},
"Loki": {
  beats: [
    {n:"Ultron", why:"El robo de ultimate niega justo el momento de mayor impacto de una retaguardia técnica."},
    {n:"Scarlet Witch", why:"Mismo problema: robar su ultimate anula gran parte del valor que aporta en team fights."},
    {n:"Moon Knight", why:"El engaño con clones confunde el foco de un duelista que depende de picks precisos."}
  ],
  losesTo: [
    {n:"Black Panther", why:"Su poca movilidad de escape lo deja expuesto a un dive directo y rápido."},
    {n:"Spider-Man", why:"Mismo problema: asesino melee móvil contra un soporte con movilidad limitada de escape."},
    {n:"Psylocke", why:"El contra-sigilo anula parte de su juego de engaño antes de que pueda usarlo bien."}
  ]
},
"Luna Snow": {
  beats: [
    {n:"Blade", why:"La curación explosiva y en área compensa el debuff de anti-heal mejor que un sanador single-target."},
    {n:"Winter Soldier", why:"El burst-heal puede salvar a un aliado del gancho si llega a tiempo con la curación."},
    {n:"Punisher", why:"El AoE de curación compensa el daño sostenido que él intenta aplicar al equipo."}
  ],
  losesTo: [
    {n:"Black Panther", why:"Su poca movilidad la deja expuesta a un dive directo sin escape inmediato."},
    {n:"Spider-Man", why:"Mismo problema: asesino melee móvil contra una sanadora estática sin escape rápido."},
    {n:"Rogue", why:"Mismo problema de movilidad limitada frente a una asesina que ataca desde el aire."}
  ]
},
"Mantis": {
  beats: [
    {n:"Black Cat", why:"El CC frustra el combo de asesinato de un flanker melee antes de que lo termine."},
    {n:"Iron Fist", why:"Mismo problema: puede controlar su entrada y escapar gracias a la movilidad propia."},
    {n:"Squirrel Girl", why:"El CC anula su movilidad molesta mientras el sostenimiento propio aguanta el chip damage."}
  ],
  losesTo: [
    {n:"Blade", why:"El anti-heal apaga justo el sostenimiento continuo que define su estilo de soporte principal."},
    {n:"Hela", why:"Mismo problema: el anti-heal y el burst a distancia superan su movilidad de escape."},
    {n:"Winter Soldier", why:"El gancho la separa del equipo justo cuando más necesita estar cerca de sus aliados."}
  ]
},
"Rocket Raccoon": {
  beats: [
    {n:"Elsa Bloodstone", why:"La torreta suma presión constante que desgasta a una duelista de rango sin mucho apoyo."},
    {n:"Cyclops", why:"Mismo problema: el daño acumulado de la torreta más el suyo desgasta rápido a un solo objetivo."},
    {n:"Groot", why:"En el duelo de control de zona, su presión constante gana el intercambio prolongado."}
  ],
  losesTo: [
    {n:"Spider-Man", why:"La movilidad lo deja expuesto a un dive directo sin escape inmediato desde la retaguardia."},
    {n:"Black Panther", why:"Mismo problema: asesino melee móvil contra una retaguardia estática con poca defensa cercana."},
    {n:"Venom", why:"Mismo problema: puede meterse a la retaguardia antes de que la torreta reaccione a tiempo."}
  ]
},
"Ultron": {
  beats: [
    {n:"Hulk", why:"La presión aérea y de torreta castiga a un brawler sin mucha respuesta antiaérea."},
    {n:"The Thing", why:"Mismo problema: puede castigarlo desde una zona que su movilidad terrestre no alcanza."},
    {n:"Groot", why:"El daño acumulado de torreta y burst aéreo desgasta el muro con el tiempo."}
  ],
  losesTo: [
    {n:"Spider-Man", why:"La movilidad lo deja expuesto a un dive directo sin escape inmediato desde la retaguardia."},
    {n:"Black Panther", why:"Mismo problema: asesino melee móvil contra una retaguardia con poca defensa cercana."},
    {n:"Hawkeye", why:"El alcance hitscan lo castiga desde tierra sin que su posición aérea lo salve del todo."}
  ]
},
"White Fox": {
  beats: [
    {n:"The Thing", why:"El sostenimiento propio y la movilidad absorben la presión de un brawler lento y directo."},
    {n:"Squirrel Girl", why:"Su HP y autosanación absorben la molestia constante sin salir mal parado del intercambio."},
    {n:"Groot", why:"Puede presionar el escudo con daño constante mientras se cura, desgastándolo con el tiempo."}
  ],
  losesTo: [
    {n:"Hela", why:"El anti-heal apaga justo el sostenimiento que define su estilo de soporte cuerpo a cuerpo."},
    {n:"Winter Soldier", why:"El gancho la saca de posición justo cuando más necesita quedarse cerca del equipo."},
    {n:"Scarlet Witch", why:"El daño en área ignora su sostenimiento individual y la desgasta parejo con el resto."}
  ]
}

};
