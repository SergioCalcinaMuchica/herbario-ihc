import type { Branch, Brief, Candidate, Card, Term } from "../types";
import { card, POR_QUE, VIGILAR } from "../data/factory";
import {
  detectSpecies,
  isSelection,
  selectionConstraints,
  selectionSet,
} from "./context";
import { careFor, careOrGeneric, careParams } from "./cuidados";

export interface Generated {
  species: string;
  esencia: string;
  terms: Term[];
  actions: string[];
  params: { label: string; value: string }[];
  sections: { title: string; body: string }[];
  cards: Card[];
  milestones: string[];
  candidates?: Candidate[];
  /** Título de la respuesta cuando la tarea lo define. */
  title?: string;
}

/** Respuesta de la tarea «Conocer sus cuidados»: luz, riego, tierra y maceta, con su porqué. */
function careContent(species: string): Generated {
  const p = careOrGeneric(species);
  const known = careFor(species) !== null;
  return {
    title: p.title,
    species,
    milestones: ["Luz y riego", "Tierra y maceta", "Por qué"],
    esencia: p.esencia,
    terms: [],
    actions: p.actions,
    params: careParams(p),
    sections: [POR_QUE(p.porQue), VIGILAR(p.vigilar)],
    cards: known
      ? [card("supuesto", "La planta está en interior", { confidence: "media" })]
      : [
          card("supuesto", "Es una planta de interior de hojas verdes", {
            confidence: "baja",
            detail: "No dijiste qué planta es. Dime su nombre para darte cuidados exactos.",
          }),
        ],
  };
}

/** Palabras que indican que el usuario quiere saber qué planta tiene. */
const IDENTIFY = /identificar|qu[ée] planta (es|tengo)|c[óo]mo se llama|porte colgante|en roseta|hojas.*carnosas|hojas.*espada|hojas.*agujeros/;


export function buildContent(
  input: string,
  branch: Branch,
  brief: Brief = {},
): Generated {
  const t = input.toLowerCase();
  const base = {
    species: detectSpecies(t, branch),
    milestones: ["Diagnóstico", "Acciones", "Parámetros"],
  };

  const identify =
    brief.goal === "identificar" || (!brief.goal && IDENTIFY.test(t));

  if (!identify && isSelection(t, brief)) {
    const set = selectionSet(t, brief);
    const cons = selectionConstraints(t, brief);
    const sun =
      brief.light === "sol" || /\bsol\b|solead|terraza|balc[oó]n/.test(t);
    return {
      species: "Selección",
      esencia: set.blurb,
      terms: [],
      actions: [
        "Fíjate cuántas horas de luz recibe el lugar donde irá",
        "Compara abajo la luz, el riego y el tamaño de cada una",
        "Elige la que mejor encaje y te digo cómo cuidarla",
      ],
      params: [],
      sections: [{ title: "Cómo elegí estas tres", body: set.why }],
      cards: [
        ...cons
          .slice(0, 3)
          .map((c) =>
            card("preferencia", c, { scope: "hilo", source: "usuario" }),
          ),
        card(
          "supuesto",
          sun
            ? "El espacio recibe sol directo varias horas"
            : "El espacio es de interior y sin sol directo",
          {
            confidence: "media",
          },
        ),
      ],
      milestones: ["Candidatas", "Encaje", "Comparación"],
      candidates: set.candidates,
    };
  }

  if (identify) {
    const holes = /agujero|cortes|perforad|rasgad/.test(t);
    const fleshy = /carnosa|gruesa|suculent/.test(t);
    const sword = /espada|cinta|alargada/.test(t);
    const trailing = /colgante|trepadora|enredadera/.test(t);
    const rosette = /roseta/.test(t);
    const candidates: Candidate[] = holes
      ? [
          {
            id: "id-monstera",
            name: "Monstera deliciosa",
            scientific: "Monstera deliciosa",
            art: "stems",
            color: "#3f6b3a",
            fit: "Hojas grandes con agujeros y cortes que llegan hasta el borde.",
            needs: "Mucha luz sin sol directo y un palo para trepar.",
            light: "Mucha, sin sol directo",
            water: "Cada 7–10 días",
            size: "1–2 m",
            difficulty: 1,
            pets: "toxica",
          },
          {
            id: "id-adansonii",
            name: "Monstera adansonii",
            scientific: "Monstera adansonii",
            art: "trailing",
            color: "#4f7a3f",
            fit: "Hojas más pequeñas, con agujeros ovalados que no llegan al borde.",
            needs: "Luz indirecta; crece colgando o trepando.",
            light: "Indirecta",
            water: "Cada 7 días",
            size: "Colgante",
            difficulty: 1,
            pets: "toxica",
          },
          {
            id: "id-selloum",
            name: "Filodendro selloum",
            scientific: "Thaumatophyllum bipinnatifidum",
            art: "upright",
            color: "#4a6b3c",
            fit: "Hojas muy recortadas en dedos, pero sin agujeros en el centro.",
            needs: "Mucha luz y espacio, porque crece hacia los lados.",
            light: "Mucha, sin sol fuerte",
            water: "Cada 7 días",
            size: "1–1,5 m",
            difficulty: 1,
            pets: "toxica",
          },
        ]
      : fleshy || rosette
      ? [
          {
            id: "id-echeveria",
            name: "Echeveria / Graptopetalum",
            scientific: "Crassulaceae",
            art: "rosette",
            color: "#6b8e6b",
            fit: "Hojas gruesas en forma de rosa, cubiertas de un polvo blanco.",
            needs: "Mucho brillo y riego muy espaciado.",
            light: "Sol suave / muy luminoso",
            water: "Cada 2–3 semanas",
            size: "10–25 cm",
            difficulty: 1,
            pets: "segura",
          },
          {
            id: "id-jade",
            name: "Árbol de jade",
            scientific: "Crassula ovata",
            art: "stems",
            color: "#5f7d52",
            fit: "Hojas carnosas opuestas sobre tallo engrosado.",
            needs: "Sustrato mineral; no tolera encharcamiento.",
            light: "Sol directo / indirecta alta",
            water: "Cada 2 semanas",
            size: "30–80 cm",
            difficulty: 1,
            pets: "toxica",
          },
        ]
      : sword
        ? [
            {
              id: "id-sansevieria",
              name: "Sansevieria (Lengua de suegra)",
              scientific: "Dracaena trifasciata",
              art: "upright",
              color: "#4a6b48",
              fit: "Hojas rígidas verticales en forma de espada.",
              needs: "Resiste poca luz; riega solo al secar por completo.",
              light: "Poca a indirecta",
              water: "Cada 2–3 semanas",
              size: "40–90 cm",
              difficulty: 1,
              pets: "toxica",
            },
            {
              id: "id-cinta",
              name: "Cinta (Malamadre)",
              scientific: "Chlorophytum comosum",
              art: "trailing",
              color: "#6d8c54",
              fit: "Hojas arqueadas y flexibles, a menudo variegadas.",
              needs: "Luz indirecta y algo más de humedad que sansevieria.",
              light: "Indirecta",
              water: "Semanal",
              size: "25–45 cm",
              difficulty: 1,
              pets: "segura",
            },
          ]
        : [
            {
              id: "id-potos",
              name: "Potos",
              scientific: "Epipremnum aureum",
              art: "trailing",
              color: "#5b8248",
              fit: trailing
                ? "Tallos colgantes con hojas acorazonadas y nudos marcados."
                : "Hojas medianas en forma de corazón con pecíolo largo.",
              needs: "Luz indirecta; tolera sombra parcial.",
              light: "Indirecta / poca",
              water: "Cada 7–10 días",
              size: "Colgante",
              difficulty: 1,
              pets: "toxica",
            },
            {
              id: "id-filodendro",
              name: "Filodendro corazón",
              scientific: "Philodendron hederaceum",
              art: "trailing",
              color: "#4d7042",
              fit: "Hoja más fina y mate; cada hoja nueva sale de una vaina seca.",
              needs: "Sustrato aireado y luz media.",
              light: "Indirecta",
              water: "Cada 7–10 días",
              size: "Colgante / tutor",
              difficulty: 1,
              pets: "toxica",
            },
          ];

    const leaves = holes
      ? "Grandes con agujeros"
      : fleshy
        ? "Gruesas"
        : sword
          ? "Largas y rígidas"
          : trailing
            ? "En forma de corazón"
            : "Medianas";
    const growth = holes
      ? "Trepadora"
      : trailing
        ? "Colgante o trepadora"
        : rosette
          ? "En forma de rosa"
          : "Derecha";
    return {
      title: holes ? "¿Es una monstera?" : "¿Qué planta es?",
      species: "Especie por identificar",
      esencia: holes
        ? "Por las hojas grandes con agujeros, lo más probable es que sea una monstera. Para estar seguro, mira si los cortes llegan hasta el borde de la hoja."
        : "Por lo que describes, puede ser una de estas plantas. Para distinguirlas, mira cómo nacen las hojas, qué tan gruesas son y cómo crece el tallo.",
      terms: [],
      actions: holes
        ? [
            "Mira si los cortes de la hoja llegan hasta el borde",
            "Busca raíces que salgan del tallo, por encima de la tierra",
            "Elige abajo la que coincida y te digo cómo cuidarla",
          ]
        : [
            "Mira si las hojas nacen todas desde el centro o a lo largo de un tallo",
            "Toca una hoja: si es gruesa y dura, guarda agua; si es fina, se seca rápido",
            "Elige abajo la que coincida y te digo cómo cuidarla",
          ],
      params: [
        { label: "Hojas", value: leaves },
        { label: "Forma de crecer", value: growth },
        {
          label: "Luz donde está",
          value:
            brief.light === "sol"
              ? "Sol directo"
              : brief.light === "poca"
                ? "Poca luz"
                : "Indirecta",
        },
      ],
      sections: [
        {
          title: "Cómo distinguirlas",
          body: holes
            ? "La monstera deliciosa tiene hojas grandes y cortes que llegan hasta el borde. La adansonii tiene hojas más pequeñas y agujeros que no llegan al borde. El filodendro selloum tiene la hoja recortada en dedos, pero sin agujeros en el centro."
            : fleshy || rosette
              ? "En el árbol de jade las hojas salen de a pares a lo largo de un tallo. En la echeveria salen todas desde el centro, como los pétalos de una rosa."
              : sword
                ? "La sansevieria tiene hojas duras y derechas. La cinta tiene hojas blandas que se curvan y le salen plantitas nuevas que cuelgan."
                : "El potos tiene hojas más gruesas y brillantes. El filodendro tiene hojas más finas, y cada hoja nueva sale de una vaina seca.",
        },
      ],
      cards: [
        card("hecho", holes ? "Hojas grandes, verdes y con agujeros" : "Describiste cómo son sus hojas", {
          scope: "hilo",
          source: "usuario",
        }),
        card("supuesto", "Es una planta de interior y no tiene flores ahora", {
          confidence: "media",
          detail: "Si tiene flores o espinas, las plantas posibles cambian.",
        }),
      ],
      milestones: ["Hojas", "Descarte", "Posibles plantas"],
      candidates,
    };
  }

  if (brief.goal === "cuidar") return careContent(base.species);

  if (/amarill|cloros|mancha|hoja|bicho|pulg|araña/.test(t)) {
    if (/bicho|pulg|araña/.test(t)) {
      return {
        ...base,
        species: base.species,
        esencia:
          "Plaga de ácaros o cochinilla: revisa el envés y separa la planta del resto antes de tratar.",
        terms: [
          {
            word: "envés",
            plain: "cara de abajo de la hoja",
            def: "La cara inferior de la hoja, donde se refugian ácaros y cochinillas.",
          },
        ],
        actions: [
          "Aísla la planta",
          "Limpia el envés con algodón y alcohol",
          "Revisa cada 4 días durante 3 semanas",
        ],
        params: [
          { label: "Luz", value: "La actual" },
          { label: "Agua", value: "Sin cambios" },
          { label: "Tratamiento", value: "Jabón potásico" },
        ],
        sections: [
          POR_QUE(
            "Los ácaros prefieren aire seco y hojas con polvo; la cochinilla se esconde en los nervios.",
          ),
          VIGILAR("Si aparecen telarañas finas, el ácaro ya está extendido."),
        ],
        cards: [
          card("supuesto", "La planta está en interior y con aire seco", {
            confidence: "media",
          }),
          card("supuesto", "Hay puntos plateados en el envés", {
            confidence: "media",
            detail: "La IA lo dedujo del síntoma. Confírmalo solo si lo viste.",
          }),
        ],
      };
    }
    const drainageLabel =
      brief.drainage === "no" ? "Sin drenaje" : "Con drenaje";
    const waterLabel =
      brief.water === "bajo"
        ? "Cada 2 semanas"
        : brief.water === "alto"
          ? "Cada 3-5 días"
          : "Cada 7-10 días";
    const sinceNote =
      brief.since === "menos_semana"
        ? VIGILAR(
            "El cambio es reciente: aísla la planta y observa 48 h antes de cambiar todo el cuidado.",
          )
        : brief.since === "meses"
          ? VIGILAR(
              "Lleva meses: el daño es crónico; corrige sustrato y riego, no solo la hoja.",
            )
          : null;
    const withSince = (sections: { title: string; body: string }[]) => {
      if (!sinceNote) return sections;
      const index = sections.findIndex((section) => section.title === sinceNote.title);
      if (index === -1) return [...sections, sinceNote];
      return sections.map((section, i) =>
        i === index ? { ...section, body: `${section.body} ${sinceNote.body}` } : section,
      );
    };

    const leafCards = [
      brief.drainage === "si"
        ? card("hecho", "La maceta drena")
        : brief.drainage === "no"
          ? card("hecho", "La maceta no drena")
          : card("supuesto", "La maceta tiene orificio de drenaje", {
              confidence: "alta",
            }),
      brief.water === "alto"
        ? card("hecho", "Riegas cada 3-5 días")
        : brief.water === "medio"
          ? card("hecho", "Riegas cada 7-10 días")
          : brief.water === "bajo"
            ? card("hecho", "Riegas cada 2 semanas o más")
            : card("supuesto", "El riego actual es cada 4 días", {
                confidence: "media",
                detail:
                  "No lo dijiste tú: la IA lo asumió a partir del síntoma.",
              }),
      brief.recent === "abono"
        ? card("hecho", "Has abonado en las últimas semanas")
        : brief.recent === "trasplante"
          ? card("hecho", "La trasplantaste hace poco")
          : brief.recent === "nada"
            ? card("hecho", "No la has abonado ni trasplantado")
            : card("supuesto", "Has abonado en las últimas 3 semanas", {
                confidence: "media",
              }),
    ];

    if (brief.drainage === "no") {
      return {
        ...base,
        esencia:
          "Exceso de agua por falta de drenaje: la raíz se queda sin aire y las hojas amarillean desde abajo.",
        terms: [
          {
            word: "pudrición radicular",
            plain: "raíces podridas por exceso de agua",
            def: "La raíz pierde aire, se ablanda y deja de absorber agua aunque el sustrato esté húmedo.",
          },
        ],
        actions: [
          "Trasplanta a una maceta con agujeros",
          "Vacía el plato y no riegues hasta que el sustrato pierda peso",
          "Retira las raíces blandas al trasplantar",
        ],
        params: [
          { label: "Luz", value: "Indirecta" },
          { label: "Agua", value: "Cuando el sustrato pese la mitad" },
          { label: "Drenaje", value: "Sin drenaje" },
          { label: "Sustrato", value: "Con perlita" },
        ],
        sections: withSince([
          POR_QUE(
            "Sin salida, el agua ocupa los poros y la raíz no puede respirar.",
          ),
          VIGILAR(
            "Si el tallo se ablanda en la base, el daño ya es grave: trasplanta hoy.",
          ),
        ]),
        cards: leafCards,
      };
    }

    if (brief.water === "alto") {
      return {
        ...base,
        esencia:
          "Riego demasiado frecuente: el sustrato nunca se airea y la raíz empieza a pudrirse aunque la maceta drene.",
        terms: [],
        actions: [
          "Espera a que los primeros 3 cm estén secos",
          "Riega hasta que drene y vacía el plato",
          "No riegues por calendario: pesa la maceta",
        ],
        params: [
          { label: "Luz", value: "Indirecta" },
          { label: "Agua", value: waterLabel },
          { label: "Drenaje", value: drainageLabel },
          { label: "Abono", value: "Suspender" },
        ],
        sections: withSince([
          POR_QUE(
            "La raíz necesita aire entre riego y riego; el agua permanente la asfixia.",
          ),
          VIGILAR(
            "Si las hojas nuevas salen negras, el exceso ya llega al cuello de la planta.",
          ),
        ]),
        cards: leafCards,
      };
    }

    if (brief.water === "bajo") {
      return {
        ...base,
        esencia:
          "Riego escaso: los bordes se secan y las hojas se enrollan porque la planta no alcanza el agua.",
        terms: [
          {
            word: "borde pajizo",
            plain: "borde seco y amarillo",
            def: "La punta de la hoja se seca primero porque es la zona más lejana al sistema vascular.",
          },
        ],
        actions: [
          "Riega a fondo hasta que salga por el drenaje",
          "Repite a los 10 minutos si el sustrato está muy seco",
          "Revisa que el agua no resbale por los lados",
        ],
        params: [
          { label: "Luz", value: "Indirecta" },
          { label: "Agua", value: waterLabel },
          { label: "Drenaje", value: drainageLabel },
          { label: "Sustrato", value: "Que retenga algo de humedad" },
        ],
        sections: withSince([
          POR_QUE(
            "Un riego escaso moja solo la superficie y deja el centro seco.",
          ),
          VIGILAR(
            "Si el sustrato se separa de la maceta, el agua resbala sin llegar a la raíz.",
          ),
        ]),
        cards: leafCards,
      };
    }

    if (brief.recent === "abono") {
      return {
        ...base,
        esencia:
          "Exceso de sales por abono reciente: el amarilleamiento aparece entre los nervios y los bordes se secan.",
        terms: [
          {
            word: "clorosis internerveal",
            plain: "amarilleamiento entre los nervios",
            def: "La hoja pierde verde entre los nervios, que siguen oscuros.",
          },
        ],
        actions: [
          "Riega hasta que salga agua por el drenaje",
          "Suspende el abono 3 semanas",
          "Usa agua reposada 24 h",
        ],
        params: [
          { label: "Luz", value: "Indirecta" },
          { label: "Agua", value: waterLabel },
          { label: "Abono", value: "Suspender" },
          { label: "Drenaje", value: drainageLabel },
        ],
        sections: withSince([
          POR_QUE(
            "El exceso de fertilizante acumula sales y bloquea la absorción de magnesio.",
          ),
          VIGILAR(
            "Si el nervio central también amarillea, revisa el drenaje antes de abonar.",
          ),
        ]),
        cards: leafCards,
      };
    }

    if (brief.recent === "trasplante") {
      return {
        ...base,
        esencia:
          "Estrés de trasplante: la raíz aún no se ha asentado y la hoja pierde agua más rápido de lo que absorbe.",
        terms: [],
        actions: [
          "Sombra suave y sin abono durante 2 semanas",
          "Riega solo cuando el sustrato pierda peso",
          "No muevas la maceta ni aprietes el sustrato",
        ],
        params: [
          { label: "Luz", value: "Indirecta suave" },
          { label: "Agua", value: "Según peso" },
          { label: "Abono", value: "Suspender 2 semanas" },
          { label: "Drenaje", value: drainageLabel },
        ],
        sections: withSince([
          POR_QUE(
            "Al trasplantar se pierden pelos absorbentes y la planta tarda en recuperar la raíz.",
          ),
          VIGILAR(
            "Si pasadas dos semanas no hay hoja nueva, revisa humedad y drenaje.",
          ),
        ]),
        cards: leafCards,
      };
    }

    if (brief.recent === "nada") {
      return {
        ...base,
        esencia:
          "Sin abono ni trasplante reciente, el amarilleamiento apunta a riego o drenaje. Revisa la humedad antes de cambiar nada.",
        terms: [],
        actions: [
          "Comprueba la humedad a 3 cm de profundidad",
          "Riega solo si está seco",
          "Revisa que el plato no acumule agua",
        ],
        params: [
          { label: "Luz", value: "Indirecta" },
          { label: "Agua", value: waterLabel },
          { label: "Drenaje", value: drainageLabel },
          { label: "Abono", value: "Sin cambios" },
        ],
        sections: withSince([
          POR_QUE(
            "Descartar el abono deja el riego y el drenaje como causas principales.",
          ),
          VIGILAR(
            "Si el amarilleamiento avanza desde abajo, el exceso de agua gana peso.",
          ),
        ]),
        cards: leafCards,
      };
    }

    return {
      ...base,
      species: base.species,
      esencia:
        "Clorosis internerveal por exceso de sales: el amarilleamiento aparece entre los nervios y los bordes se secan.",
      terms: [
        {
          word: "clorosis internerveal",
          plain: "amarilleamiento entre los nervios",
          def: "La hoja pierde verde entre los nervios, que siguen oscuros.",
        },
      ],
      actions: [
        "Riega hasta que salga agua por el drenaje",
        "Suspende el abono 3 semanas",
        "Usa agua reposada 24 h",
      ],
      params: [
        { label: "Luz", value: "Indirecta" },
        { label: "Agua", value: waterLabel },
        { label: "Abono", value: "Suspender" },
        { label: "Drenaje", value: drainageLabel },
      ],
      sections: withSince([
        POR_QUE(
          "El exceso de fertilizante acumula sales y bloquea la absorción de magnesio.",
        ),
        VIGILAR(
          "Si el nervio central también amarillea, revisa el drenaje antes de abonar.",
        ),
      ]),
      cards: leafCards,
    };
  }

  if (/cuid/.test(t) || (careFor(base.species) && /luz|riego|regar|necesita/.test(t))) {
    return careContent(base.species);
  }

  if (/riego|agua|regar|humedad/.test(t)) {
    return {
      ...base,
      species: base.species,
      esencia:
        "Riego por peso, no por calendario: levanta la maceta y riega cuando haya perdido un tercio de su peso.",
      terms: [],
      actions: [
        "Pesa la maceta antes y después de regar",
        "Riega al atardecer",
        "Vacía el plato 10 minutos después",
      ],
      params: [
        { label: "Frecuencia", value: "Según peso" },
        { label: "Agua", value: "Reposada" },
        { label: "Drenaje", value: "Obligatorio" },
      ],
      sections: [
        POR_QUE(
          "La superficie seca no indica que el centro del cepellón esté seco.",
        ),
        VIGILAR("El agua estancada en el plato pudre la raíz en una semana."),
      ],
      cards: [
        card("supuesto", "La maceta tiene plato", { confidence: "media" }),
        card("supuesto", "El sustrato es universal con perlita", {
          confidence: "media",
        }),
      ],
    };
  }

  if (/trasplant|maceta|sustrato|tierra/.test(t)) {
    return {
      ...base,
      milestones: ["Preparación", "Trasplante", "Cierre"],
      species: base.species,
      esencia:
        "Trasplanta a una maceta de 2 cm más de diámetro, no más: un contenedor grande retiene agua y pudre la raíz.",
      terms: [],
      actions: [
        "Riega 24 h antes",
        "Extrae el cepellón entero",
        "No aprietes el sustrato",
        "Riega y deja sombra 3 días",
      ],
      params: [
        { label: "Maceta", value: "+2 cm" },
        { label: "Época", value: "Primavera" },
        { label: "Sustrato", value: "Suelto" },
      ],
      sections: [
        {
          title: "Cómo se hace",
          body: "1. Prepara maceta y sustrato. 2. Sujeta la planta por la base. 3. Invierte y extrae el cepellón. 4. Peina las raíces exteriores. 5. Centra y rellena sin apretar. 6. Riega hasta que drene.",
        },
        VIGILAR("No abones hasta cuatro semanas después."),
      ],
      cards: [
        card("supuesto", "La maceta nueva tiene drenaje", {
          confidence: "alta",
        }),
        card("supuesto", "La maceta actual mide 14 cm", {
          confidence: "media",
        }),
      ],
    };
  }

  if (/pod|bonsái|bonsai|alambr|abon/.test(t)) {
    return {
      ...base,
      species: base.species,
      esencia:
        "Poda de formación en primavera: corta sobre dos hojas y sella el muñón; el árbol responde con dos brotes.",
      terms: [
        {
          word: "muñón",
          plain: "trozo de rama que queda tras el corte",
          def: "La parte de rama que permanece y se seca si no se sella.",
        },
      ],
      actions: [
        "Desinfecta la tijera",
        "Corta 2 mm sobre el nudo",
        "Sella el corte",
      ],
      params: [
        { label: "Época", value: "Primavera" },
        { label: "Corte", value: "2 mm" },
        { label: "Abono", value: "Suspender 4 semanas" },
      ],
      sections: [
        POR_QUE("El olmo chino brota con fuerza y tolera bien la poda apical."),
        VIGILAR("Si el corte llora savia, espera antes de sellar."),
      ],
      cards: [
        card("supuesto", "El árbol está en una maceta de 18 cm", {
          confidence: "media",
        }),
        card("supuesto", "Está en crecimiento activo", { confidence: "alta" }),
      ],
    };
  }

  return {
    ...base,
    species: base.species,
    esencia:
      "Para afinar la respuesta necesito dos datos: dónde está la planta y qué ha cambiado en la última semana.",
    terms: [],
    actions: [
      "Indica orientación y horas de luz",
      "Describe el cambio observado",
    ],
    params: [
      { label: "Luz", value: "Por confirmar" },
      { label: "Agua", value: "Por confirmar" },
    ],
    sections: [
      POR_QUE(
        "Sin esos dos datos cualquier diagnóstico es una suposición disfrazada de certeza.",
      ),
    ],
    cards: [
      card("supuesto", "La planta está en interior", { confidence: "baja" }),
      card("supuesto", "El cambio empezó hace menos de una semana", {
        confidence: "baja",
      }),
    ],
  };
}
