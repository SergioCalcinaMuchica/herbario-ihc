import type { Session } from "../types";
import { demoBranches } from "../demo-tasks";
import { card, node, POR_QUE, VIGILAR } from "./factory";

export const seed: Session = {
  id: "s1",
  title: "Plantas en casa",
  branches: [
    ...demoBranches,
    {
      id: "calathea",
      name: "Calathea",
      species: "Calathea orbifolia",
      closed: false,
      nodes: [
        node({
          id: "cal-1",
          branchId: "calathea",
          title: "Hojas enrolladas y bordes secos",
          species: "Calathea orbifolia",
          date: "2026-11-04",
          prompt:
            "Las hojas de mi calathea se están enrollando y los bordes se ven secos. ¿Qué hago?",
          esencia:
            "Estrés hídrico atmosférico: la clorosis internerveal y los bordes pajizos aparecen cuando la humedad baja del 40 %.",
          terms: [
            {
              word: "clorosis internerveal",
              plain: "amarilleamiento entre los nervios",
              def: "La hoja pierde verde entre los nervios, que siguen oscuros. Suele indicar exceso de sales o falta de magnesio.",
            },
            {
              word: "bordes pajizos",
              plain: "bordes secos y pajizos",
              def: "El borde de la hoja se seca y toma color paja por aire seco o riego irregular.",
            },
          ],
          actions: [
            "Agrupa la planta con otras o usa una bandeja con guijarros",
            "Riega con agua reposada 24 h",
            "Suspende el abono tres semanas",
          ],
          params: [
            { label: "Luz", value: "Indirecta, 6 h" },
            { label: "Agua", value: "Cada 4 días" },
            { label: "Humedad", value: "> 50 %" },
            { label: "Sustrato", value: "Suelto con perlita" },
          ],
          sections: [
            POR_QUE(
              "La calathea transpira por hojas grandes y pierde turgencia antes que otras plantas. Con aire seco, el borde se necrosa aunque el sustrato esté húmedo.",
            ),
            VIGILAR(
              "Si el amarilleamiento avanza hacia el nervio central en hojas nuevas, el problema pasa de humedad a drenaje.",
            ),
          ],
          cards: [
            card("hecho", "Riego cada 4 días"),
            card("hecho", "Ventana norte, sin sol directo", {
              detail: "Dicho el 4 de noviembre",
            }),
            card("supuesto", "La maceta tiene orificio de drenaje", {
              confidence: "alta",
              detail:
                "Si no drena, el exceso de agua pudre la raíz y el amarilleamiento no se detiene.",
            }),
            card("supuesto", "La humedad ambiental está por debajo del 40 %", {
              confidence: "media",
              detail:
                "Si la humedad es alta, el problema sería sales en el sustrato.",
            }),
            card(
              "preferencia",
              "Usar comparaciones simples en lugar de términos de histología",
              {
                scope: "global",
              },
            ),
            card(
              "artefacto",
              "Calendario de riego: cada 4 días en verano, cada 8 en invierno",
              {
                scope: "especie",
              },
            ),
          ],
        }),
        node({
          id: "cal-2",
          branchId: "calathea",
          title: "Humedad y riego en invierno",
          species: "Calathea orbifolia",
          date: "2026-10-22",
          prompt:
            "¿Cada cuánto riego la calathea en invierno? La habitación es fría.",
          esencia:
            "En invierno el sustrato tarda el doble en secarse: riega cuando los primeros 3 cm estén secos, no por calendario.",
          actions: [
            "Comprueba con el dedo antes de regar",
            "Aleja la maceta del radiador",
          ],
          params: [
            { label: "Agua", value: "Cada 8–10 días" },
            { label: "Humedad", value: "45–60 %" },
          ],
          sections: [
            POR_QUE(
              "Con menos luz la planta consume menos agua y el sustrato retiene más.",
            ),
            VIGILAR(
              "Hojas nuevas pequeñas y enrolladas pueden ser frío, no sequedad.",
            ),
          ],
          cards: [card("hecho", "Radiador a dos metros de la planta")],
        }),
      ],
    },
    {
      id: "bonsai",
      name: "Bonsái",
      species: "Ulmus parvifolia",
      closed: false,
      nodes: [
        node({
          id: "bon-1",
          branchId: "bonsai",
          title: "Poda apical de mayo",
          species: "Ulmus parvifolia",
          date: "2026-05-14",
          prompt: "Mi olmo chino tiene ramas largas. ¿Cómo lo podo en mayo?",
          esencia:
            "Poda de formación: corta por encima de dos hojas y sella el corte para evitar desecación del muñón.",
          terms: [
            {
              word: "muñón",
              plain: "trozo de rama que queda tras el corte",
              def: "La parte de rama que permanece y se seca si no se sella.",
            },
          ],
          actions: [
            "Corta con tijera desinfectada",
            "Sella el corte con pasta cicatrizante",
            "No abones hasta ver brote nuevo",
          ],
          params: [
            { label: "Época", value: "Mayo" },
            { label: "Corte", value: "2 mm sobre el nudo" },
          ],
          sections: [
            POR_QUE(
              "El olmo chino brota con fuerza en primavera y tolera bien la poda apical.",
            ),
            VIGILAR(
              "Si el corte llora savia, espera a que seque antes de sellar.",
            ),
          ],
          cards: [
            card("hecho", "Tijera de una mano, desinfectada con alcohol"),
            card("supuesto", "El árbol está en periodo de crecimiento activo", {
              confidence: "alta",
            }),
            card("artefacto", "Protocolo de sellado de cortes", {
              scope: "especie",
            }),
          ],
          pinned: true,
        }),
        node({
          id: "bon-2",
          branchId: "bonsai",
          title: "Alambrado de verano",
          species: "Ulmus parvifolia",
          date: "2026-07-08",
          prompt: "¿Cuándo quito el alambre del bonsái?",
          esencia:
            "Alambra solo ramas lignificadas y retira el alambre en seis semanas: el olmo marca la corteza con facilidad.",
          actions: [
            "Usa alambre de aluminio de 1,5 mm",
            "Revisa cada 10 días",
            "Retira antes de que muerda la corteza",
          ],
          params: [{ label: "Retiro", value: "6 semanas" }],
          sections: [
            VIGILAR("Las marcas de alambre no se borran en ramas gruesas."),
          ],
          cards: [card("hecho", "Ramas de 4 mm de diámetro")],
        }),
        node({
          id: "bon-3",
          branchId: "bonsai",
          title: "Abonado de otoño",
          species: "Ulmus parvifolia",
          date: "2026-10-02",
          prompt: "¿Qué abono le doy al bonsái en otoño?",
          esencia:
            "Baja el nitrógeno y sube el potasio: el árbol debe endurecer madera antes del frío, no brotar.",
          actions: [
            "Usa NPK 3-6-9",
            "Abona cada 15 días",
            "Suspende en diciembre",
          ],
          params: [
            { label: "NPK", value: "3-6-9" },
            { label: "Frecuencia", value: "15 días" },
          ],
          sections: [
            POR_QUE(
              "El exceso de nitrógeno en otoño produce brotes tiernos que mueren con la primera helada.",
            ),
          ],
          cards: [
            card("artefacto", "Calendario NPK de otoño", { scope: "especie" }),
          ],
        }),
        node({
          id: "bon-4",
          branchId: "bonsai",
          title: "Poda de raíces",
          species: "Ulmus parvifolia",
          date: "2026-03-19",
          prompt: "Toca trasplantar el bonsái. ¿Cuánto cepellón corto?",
          esencia:
            "Trasplante de formación: reduce un tercio del cepellón y usa sustrato con 40 % de akadama.",
          actions: [
            "Extrae el cepellón entero",
            "Peina y corta raíces gruesas",
            "Fija con alambre y riega en abundancia",
          ],
          params: [
            { label: "Época", value: "Marzo" },
            { label: "Sustrato", value: "40 % akadama" },
          ],
          sections: [
            POR_QUE(
              "La poda de raíces equilibra el crecimiento de la copa y renueva el sustrato compactado.",
            ),
            VIGILAR("No abones durante cuatro semanas después del trasplante."),
          ],
          cards: [
            card("supuesto", "La maceta actual es de 18 cm de diámetro", {
              confidence: "media",
            }),
          ],
        }),
      ],
    },
    {
      id: "terraza",
      name: "Terraza",
      species: "Anthurium andraeanum",
      closed: false,
      nodes: [
        node({
          id: "ter-1",
          branchId: "terraza",
          title: "Anturio para sol directo",
          species: "Anthurium andraeanum",
          date: "2026-09-11",
          prompt: "¿Puedo poner un anturio en la terraza con sol directo?",
          esencia:
            "El anturio tolera sol de mañana pero no de mediodía: hoja coriácea y espata roja, riego cada 5 días en verano.",
          terms: [
            {
              word: "espata",
              plain: "hoja roja que parece flor",
              def: "La bráctea vistosa que protege la flor real, pequeña y amarilla.",
            },
          ],
          actions: [
            "Colócalo con sol hasta las 11 h",
            "Riega cuando el sustrato esté seco",
          ],
          params: [
            { label: "Luz", value: "Sol de mañana" },
            { label: "Agua", value: "Cada 5 días" },
          ],
          sections: [
            VIGILAR(
              "Las hojas quemadas no se recuperan: retira solo la parte seca.",
            ),
          ],
          cards: [
            card("hecho", "Terraza orientada al este"),
            card("hecho", "Riego cada 5 días en verano"),
          ],
          pinned: true,
        }),
        node({
          id: "ter-2",
          branchId: "terraza",
          title: "Riego en terraza",
          species: "Anthurium andraeanum",
          date: "2026-09-18",
          prompt:
            "En la terraza el sustrato se seca muy rápido. ¿Riego cada cuánto?",
          esencia:
            "En terraza el viento seca el sustrato antes que el sol: comprueba peso de la maceta, no solo la superficie.",
          actions: [
            "Levanta la maceta para estimar peso",
            "Riega al atardecer",
          ],
          params: [{ label: "Frecuencia", value: "Cada 3 días" }],
          sections: [],
          cards: [
            card("supuesto", "Las macetas son de barro", {
              confidence: "baja",
            }),
          ],
        }),
      ],
    },
  ],
};

/**
 * La semilla venía con datos que el usuario nunca escribió etiquetados como hechos.
 * Un hecho es una cita del usuario; todo lo demás nace como suposición de la IA.
 */
function sanitizeSeed(session: Session) {
  const looseFacts = new Set([
    "Riego cada 4 días",
    "Ventana norte, sin sol directo",
    "Radiador a dos metros de la planta",
    "Tijera de una mano, desinfectada con alcohol",
    "Ramas de 4 mm de diámetro",
    "Terraza orientada al este",
    "Riego cada 5 días en verano",
  ]);
  for (const branch of session.branches) {
    for (const item of branch.nodes) {
      for (const c of item.cards) {
        c.source ??= c.type === "hecho" ? "usuario" : "ia";
        if (c.type === "hecho" && looseFacts.has(c.text)) {
          c.type = "supuesto";
          c.state = "sin_confirmar";
          c.confidence = "media";
          c.source = "ia";
          c.detail =
            "No aparece en tu mensaje. La IA lo asumió; corrígelo si no es así.";
        }
      }
    }
  }
}

sanitizeSeed(seed);
