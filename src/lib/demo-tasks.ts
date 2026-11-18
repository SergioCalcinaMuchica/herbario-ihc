import type { Branch, Card, CardType, KnowledgeNode } from "./types";

let seq = 0;

function card(type: CardType, text: string, extra: Partial<Card> = {}): Card {
  return {
    id: `demo-c${++seq}`,
    type,
    text,
    state: type === "supuesto" ? "sin_confirmar" : "activo",
    scope: type === "preferencia" ? "global" : type === "artefacto" ? "especie" : "hilo",
    source: type === "hecho" ? "usuario" : "ia",
    ...extra,
  };
}

function node(
  o: Partial<KnowledgeNode> & Pick<KnowledgeNode, "id" | "branchId" | "title" | "species">,
): KnowledgeNode {
  return {
    date: "2026-11-02",
    prompt: "",
    esencia: "",
    terms: [],
    replaced: {},
    actions: [],
    params: [],
    sections: [],
    cards: [],
    brief: {},
    model: "Herbario",
    version: 1,
    generatedAt: "2026-11-02 09:15",
    pinned: false,
    status: "lista",
    milestones: [],
    done: 3,
    ...o,
  };
}

const POR_QUE = (t: string) => ({ title: "Por qué", body: t });
const VIGILAR = (t: string) => ({ title: "Qué vigilar", body: t });

export const demoBranches: Branch[] = [
  {
    id: "demo-comprar",
    name: "Comprar una planta",
    species: "Varias especies",
    closed: false,
    nodes: [
      node({
        id: "demo-comprar-1",
        branchId: "demo-comprar",
        title: "Elegir planta para salón con poca luz y gato",
        species: "Varias especies",
        date: "2026-11-02",
        generatedAt: "2026-11-02 09:15",
        pinned: true,
        brief: {
          goal: "elegir",
          light: "poca",
          water: "bajo",
          drainage: "si",
          pets: "mascotas",
          space: "pequeno",
        },
        prompt:
          "Quiero comprar una planta para el salón. La ventana da al norte y solo entra luz indirecta; tengo un gato que muerde todo. Busco algo que no sea difícil de cuidar y que quepa en una maceta de 20 cm. ¿Qué opciones tengo?",
        esencia:
          "Para luz de ventana norte y un gato, la palma de salón, el helecho de Boston y la cinta son las opciones más seguras. Descarta potos, monstera y sansevieria: son tóxicas o demasiado exigentes para ese rincón.",
        terms: [
          {
            word: "luz indirecta",
            plain: "luz sin sol directo",
            def: "Luz que llega rebotada por la pared o una cortina; suficiente para muchas plantas de interior.",
          },
          {
            word: "tóxica",
            plain: "peligrosa si el gato la muerde",
            def: "La planta contiene compuestos que irritan la boca o el sistema digestivo del gato.",
          },
        ],
        actions: [
          "Mide la luz a media mañana",
          "Comprueba que la maceta tenga agujeros",
          "Deja la planta en cuarentena 48 h antes de juntarla con el gato",
        ],
        params: [
          { label: "Luz", value: "Indirecta, 3-4 h" },
          { label: "Riego", value: "Cada 7-10 días" },
          { label: "Mascotas", value: "Seguras" },
          { label: "Espacio", value: "Maceta de 20 cm" },
        ],
        sections: [
          POR_QUE(
            "Las tres toleran luz de ventana norte y son seguras para gatos; el helecho pide más humedad y la cinta perdona mejor los olvidos.",
          ),
          VIGILAR("El helecho de Boston seca rápido junto al radiador; la cinta se quema con sol de mediodía."),
        ],
        cards: [
          card("hecho", "La ventana del salón da al norte", { sourceText: "La ventana da al norte" }),
          card("hecho", "Tengo un gato que muerde las hojas", { sourceText: "tengo un gato que muerde todo" }),
          card("hecho", "Espacio para maceta de 20 cm", { sourceText: "que quepa en una maceta de 20 cm" }),
          card("supuesto", "No hay radiador junto a la ventana", { confidence: "baja" }),
          card("supuesto", "La humedad ambiental es media (40-55 %)", { confidence: "media" }),
          card("preferencia", "Priorizar bajo mantenimiento"),
          card("artefacto", "Comparativa de 3 plantas seguras para gatos", { scope: "especie" }),
        ],
        candidates: [
          {
            id: "cand-palma",
            name: "Palma de salón",
            scientific: "Chamaedorea elegans",
            art: "palm",
            color: "#6f8f4c",
            fit: "Aguanta luz indirecta y perdona riegos espaciados.",
            needs: "Humedad ambiental media",
            light: "Poca luz",
            water: "Cada 7-10 días",
            size: "40-80 cm",
            difficulty: 1,
            pets: "segura",
          },
          {
            id: "cand-helecho",
            name: "Helecho de Boston",
            scientific: "Nephrolepis exaltata",
            art: "fern",
            color: "#5f8a54",
            fit: "Queda bien en colgante y tolera luz suave.",
            needs: "Humedad constante",
            light: "Luz indirecta",
            water: "Cada 3-5 días",
            size: "30-60 cm",
            difficulty: 2,
            pets: "segura",
          },
          {
            id: "cand-cinta",
            name: "Cinta",
            scientific: "Chlorophytum comosum",
            art: "trailing",
            color: "#7d9a55",
            fit: "La más fácil de las tres y produce hijuelos.",
            needs: "Sustrato que drene",
            light: "Poca luz o indirecta",
            water: "Cada 7 días",
            size: "20-40 cm",
            difficulty: 1,
            pets: "segura",
          },
        ],
      }),
      node({
        id: "demo-comprar-2",
        branchId: "demo-comprar",
        parentId: "demo-comprar-1",
        title: "Si la ventana recibe sol de mañana",
        species: "Varias especies",
        date: "2026-11-03",
        generatedAt: "2026-11-03 18:40",
        status: "desactualizada",
        staleReason: "Cambiaste la orientación de la ventana de norte a este",
        brief: {
          goal: "elegir",
          light: "indirecta",
          water: "bajo",
          drainage: "si",
          pets: "mascotas",
          space: "pequeno",
        },
        prompt: "Revisé la brújula y la ventana en realidad da al este con sol de mañana. ¿Cambia la elección?",
        esencia:
          "Con sol de mañana, la cinta y el helecho aguantan; la palma prefiere luz filtrada. Mantén las tres fuera del sol de mediodía y revisa el riego: el sustrato secará antes.",
        terms: [
          {
            word: "luz filtrada",
            plain: "sol suavizado por cortina",
            def: "Luz solar que atraviesa una tela fina o persiana para no quemar hojas tiernas.",
          },
          {
            word: "sales del agua",
            plain: "minerales acumulados del grifo",
            def: "Cal y minerales que quedan en el sustrato y pueden quemar las puntas de la cinta.",
          },
        ],
        actions: ["Corre la cortina entre las 12 y las 16 h", "Comprueba el peso de la maceta antes de regar"],
        params: [
          { label: "Luz", value: "Sol de mañana" },
          { label: "Riego", value: "Cada 5-7 días" },
        ],
        sections: [
          POR_QUE("El sol de mañana es suave y seca el rocío; el de mediodía quema las hojas tiernas."),
          VIGILAR("Si las puntas se ponen marrones, el problema puede ser sol directo o sales del agua."),
        ],
        cards: [
          card("hecho", "Ventana orientada al este con sol de mañana", {
            sourceText: "la ventana en realidad da al este con sol de mañana",
          }),
          card("supuesto", "La cortina se puede correr al mediodía", { confidence: "media", state: "confirmado" }),
        ],
      }),
      node({
        id: "demo-comprar-3",
        branchId: "demo-comprar",
        parentId: "demo-comprar-1",
        title: "Si quiero una planta colgante fuera del alcance del gato",
        species: "Varias especies",
        date: "2026-11-04",
        generatedAt: "2026-11-04 11:10",
        brief: {
          goal: "elegir",
          light: "poca",
          water: "bajo",
          drainage: "si",
          pets: "mascotas",
          space: "pequeno",
        },
        prompt: "Pensándolo mejor, me gustaría que cayera desde una estantería alta. ¿Cuál de las tres sirve?",
        esencia:
          "La cinta es la mejor opción colgante de la lista; el helecho también cae si tiene humedad, pero pesa más y seca rápido. Refuerza la estantería antes de colgar una maceta de 20 cm.",
        terms: [
          {
            word: "hijuelos",
            plain: "brotes pequeños que cuelgan",
            def: "Plantas miniatura que nacen en tallos largos y se pueden separar cuando echan raíz.",
          },
        ],
        actions: ["Elige una maceta ligera con plato", "Fija el gancho a un listón, no al yeso"],
        params: [
          { label: "Colgante", value: "Cinta" },
          { label: "Peso", value: "Maceta ligera" },
        ],
        sections: [
          POR_QUE("La cinta produce hijuelos que caen solos; el helecho necesita más riego y su follaje pesa."),
        ],
        cards: [
          card("hecho", "La estantería está en altura junto a la ventana", {
            sourceText: "que cayera desde una estantería alta",
          }),
          card("supuesto", "La estantería soporta una maceta húmeda de ~2 kg", { confidence: "baja" }),
        ],
      }),
    ],
  },
  {
    id: "demo-identificar",
    name: "Identificar una planta",
    species: "Monstera deliciosa",
    closed: false,
    nodes: [
      node({
        id: "demo-identificar-1",
        branchId: "demo-identificar",
        title: "Identificar una monstera por sus hojas y raíces",
        species: "Monstera deliciosa",
        date: "2026-11-01",
        generatedAt: "2026-11-01 10:20",
        pinned: true,
        brief: {
          goal: "identificar",
          light: "indirecta",
          space: "amplio",
        },
        prompt:
          "Me regalaron una planta y no sé qué es. Tiene hojas grandes, verdes y brillantes, con agujeros y cortes en los bordes. También le salen raíces aéreas cerca del tallo. ¿Puede ser una monstera?",
        esencia:
          "Sí: las hojas grandes con fenestraciones y las raíces aéreas apuntan a Monstera deliciosa. La adansonii tiene hojas más pequeñas y agujeros alargados; el philodendron no abre cortes tan grandes.",
        terms: [
          {
            word: "fenestración",
            plain: "agujero o corte en la hoja",
            def: "Abertura natural de la hoja que deja pasar la luz y reduce la resistencia al viento.",
          },
          {
            word: "raíz aérea",
            plain: "raíz que sale del tallo",
            def: "Raíz que nace fuera del sustrato y ayuda a la planta a trepar y sujetarse.",
          },
        ],
        actions: ["Mira el patrón de los agujeros", "Cuenta las raíces aéreas", "Compara el tamaño de la hoja"],
        params: [
          { label: "Hoja", value: "Grande con cortes" },
          { label: "Agujeros", value: "Fenestraciones" },
          { label: "Raíces", value: "Aéreas" },
          { label: "Especie", value: "Monstera deliciosa" },
        ],
        sections: [
          POR_QUE(
            "La forma de la hoja y la presencia de raíces aéreas separan la monstera de otros filodendros de interior.",
          ),
          VIGILAR("Las hojas jóvenes pueden no tener agujeros; no descartes la especie por una sola hoja."),
        ],
        cards: [
          card("hecho", "Hojas grandes, verdes y brillantes con agujeros", {
            sourceText: "hojas grandes, verdes y brillantes, con agujeros y cortes",
          }),
          card("hecho", "Raíces aéreas cerca del tallo", { sourceText: "le salen raíces aéreas cerca del tallo" }),
          card("supuesto", "La planta tiene más de un año", { confidence: "media" }),
          card("supuesto", "Está ubicada en interior", { confidence: "alta" }),
          card("artefacto", "Ficha de identificación de Monstera deliciosa", { scope: "especie" }),
        ],
      }),
      node({
        id: "demo-identificar-2",
        branchId: "demo-identificar",
        parentId: "demo-identificar-1",
        title: "Diferenciar deliciosa de adansonii",
        species: "Monstera deliciosa",
        date: "2026-11-02",
        generatedAt: "2026-11-02 16:05",
        brief: {
          goal: "identificar",
          light: "indirecta",
          space: "amplio",
        },
        prompt: "¿Cómo sé si es deliciosa o adansonii? Mirándola de cerca, las hojas no son enormes.",
        esencia:
          "La adansonii tiene hojas más pequeñas, estrechas y con agujeros alargados que no llegan al borde; la deliciosa desarrolla hojas anchas en corazón y cortes profundos. El grosor del tallo y la forma del agujero deciden.",
        terms: [
          {
            word: "entrenudo",
            plain: "tramo de tallo entre dos hojas",
            def: "Distancia entre un nudo y el siguiente; es mucho más grueso y corto en M. deliciosa.",
          },
        ],
        actions: ["Mide una hoja adulta", "Revisa si el agujero llega al borde", "Compara el grosor del tallo"],
        params: [
          { label: "Hoja", value: "Tamaño y forma" },
          { label: "Agujero", value: "Corte al borde vs. cerrado" },
        ],
        sections: [
          POR_QUE(
            "La adansonii es una trepadora de hoja pequeña y fina; la deliciosa desarrolla tallos gruesos y hojas mucho mayores con el tiempo.",
          ),
        ],
        cards: [
          card("hecho", "Las hojas no son enormes", { sourceText: "las hojas no son enormes" }),
          card("supuesto", "La planta es joven y aún no muestra su tamaño adulto", { confidence: "media" }),
        ],
      }),
      node({
        id: "demo-identificar-3",
        branchId: "demo-identificar",
        parentId: "demo-identificar-1",
        title: "Si las hojas nuevas no tienen agujeros",
        species: "Monstera deliciosa",
        date: "2026-11-04",
        generatedAt: "2026-11-04 09:50",
        brief: {
          goal: "identificar",
          light: "poca",
          space: "amplio",
        },
        prompt: "Le salió un brote nuevo, pero las hojas nuevas no tienen agujeros. ¿Sigue siendo una monstera?",
        esencia:
          "Las hojas jóvenes de Monstera deliciosa nacen enteras y sin fenestraciones; los cortes aparecen cuando la planta madura y recibe suficiente luz. Si nunca aparecen en hojas adultas, revisa la iluminación antes de dudar de la especie.",
        terms: [
          {
            word: "hoja juvenil",
            plain: "hoja joven aún sin cortes",
            def: "Primera etapa de crecimiento en la que la hoja conserva forma de corazón entero.",
          },
        ],
        actions: ["Espera a que la planta saque 2-3 hojas más", "Acércala a una ventana con luz indirecta"],
        params: [{ label: "Fenestraciones", value: "Aparecen al madurar" }],
        sections: [
          VIGILAR(
            "Si todas las hojas adultas siguen sin agujeros tras meses de buena luz, podría ser un philodendron.",
          ),
        ],
        cards: [
          card("hecho", "Las hojas nuevas salen sin agujeros", { sourceText: "las hojas nuevas no tienen agujeros" }),
          card("supuesto", "La planta recibe poca luz", { confidence: "media" }),
        ],
      }),
    ],
  },
  {
    id: "demo-revisar",
    name: "Revisar una planta",
    species: "Monstera deliciosa",
    closed: false,
    nodes: [
      node({
        id: "demo-revisar-1",
        branchId: "demo-revisar",
        title: "Hojas amarillas y sustrato húmedo: ¿exceso de riego?",
        species: "Monstera deliciosa",
        date: "2026-11-01",
        generatedAt: "2026-11-01 19:30",
        pinned: true,
        brief: {
          goal: "diagnosticar",
          light: "indirecta",
          water: "medio",
          drainage: "no_se",
          since: "semanas",
          recent: "nada",
        },
        prompt:
          "Mi monstera tiene varias hojas amarillas desde abajo y el sustrato sigue húmedo aunque no la riego desde hace una semana. Las hojas nuevas salen pequeñas y una tiene el borde negro. ¿Está enferma o es normal?",
        esencia:
          "El amarilleamiento desde abajo con sustrato húmedo apunta a exceso de agua y raíz sin aire, no a falta de nutrientes. El borde negro en una hoja nueva sugiere pudrición temprana; revisa el drenaje y el estado de la raíz antes de abonar.",
        terms: [
          {
            word: "clorosis",
            plain: "pérdida de verde en la hoja",
            def: "La hoja produce menos clorofila y se ve amarilla aunque el nervio siga verde.",
          },
          {
            word: "pudrición radicular",
            plain: "raíces negras y blandas",
            def: "La raíz se queda sin oxígeno, se oscurece y pierde firmeza; ya no puede absorber agua.",
          },
        ],
        actions: [
          "Saca la planta de la maceta y huele la raíz",
          "Corta las raíces negras y blandas",
          "Trasplanta a sustrato con perlita",
          "No riegues hasta que la maceta pese menos",
        ],
        params: [
          { label: "Riego", value: "Suspender" },
          { label: "Drenaje", value: "Revisar" },
          { label: "Sustrato", value: "Perlita 30 %" },
          { label: "Luz", value: "Indirecta" },
        ],
        sections: [
          POR_QUE(
            "La raíz necesita aire entre riegos; si el sustrato queda encharcado, el agua ocupa los poros y la raíz se asfixia.",
          ),
          VIGILAR("Si el tallo se pone blando en la base, la pudrición ya subió y hay que cortar esquejes sanos."),
        ],
        cards: [
          card("hecho", "Hojas amarillas desde abajo", { sourceText: "varias hojas amarillas desde abajo" }),
          card("hecho", "Sustrato húmedo tras una semana sin riego", {
            sourceText: "el sustrato sigue húmedo aunque no la riego desde hace una semana",
          }),
          card("hecho", "Borde negro en una hoja nueva", { sourceText: "una tiene el borde negro" }),
          card("supuesto", "La maceta no tiene agujeros o el plato retiene agua", { confidence: "alta" }),
          card("supuesto", "No ha habido abono reciente", { confidence: "media" }),
          card("preferencia", "Prefiero una solución sin químicos"),
          card("artefacto", "Checklist de rescate de raíz", { scope: "especie" }),
        ],
      }),
      node({
        id: "demo-revisar-2",
        branchId: "demo-revisar",
        parentId: "demo-revisar-1",
        title: "Descartar plagas antes de trasplantar",
        species: "Monstera deliciosa",
        date: "2026-11-03",
        generatedAt: "2026-11-03 12:15",
        brief: {
          goal: "diagnosticar",
          since: "semanas",
        },
        prompt: "Antes de trasplantarla, vi puntitos blancos debajo de las hojas. ¿Puede ser plaga además del riego?",
        esencia:
          "Los puntos blancos pueden ser exuvias de mosca blanca o ácaros. Antes de trasplantar, revisa el envés con lupa y aísla la planta dos semanas para no contagiar al resto.",
        terms: [
          {
            word: "exuvias",
            plain: "pieles blancas que dejan los insectos",
            def: "Restos vacíos de muda que quedan pegados a la hoja cuando crecen pulgones o mosca blanca.",
          },
          {
            word: "envés",
            plain: "cara de abajo de la hoja",
            def: "Zona inferior de la hoja donde suelen esconderse huevos y plagas chupadoras.",
          },
        ],
        actions: ["Aísla la planta", "Limpia el envés con agua jabonosa", "Repite la revisión cada 5 días"],
        params: [
          { label: "Plaga", value: "Por confirmar" },
          { label: "Cuarentena", value: "2 semanas" },
        ],
        sections: [
          POR_QUE("La mosca blanca deja exuvias blancas y los ácaros tejen telarañas finas; el riego no los elimina."),
        ],
        cards: [
          card("hecho", "Puntos blancos en el envés", { sourceText: "puntitos blancos debajo de las hojas" }),
          card("supuesto", "No hay telarañas finas", { confidence: "media" }),
        ],
      }),
      node({
        id: "demo-revisar-3",
        branchId: "demo-revisar",
        parentId: "demo-revisar-1",
        title: "Si el amarilleamiento es entre nervios",
        species: "Monstera deliciosa",
        date: "2026-11-04",
        generatedAt: "2026-11-04 15:20",
        brief: {
          goal: "diagnosticar",
          since: "semanas",
          recent: "nada",
        },
        prompt: "Mirando otra hoja, se pone amarilla entre los nervios, pero los nervios siguen verdes. ¿Es lo mismo?",
        esencia:
          "La clorosis internerveal apunta a falta de magnesio o exceso de sales, no a pudrición. Si el sustrato está húmedo, descarta primero el drenaje; si está seco, revisa el abono.",
        terms: [
          {
            word: "clorosis internerveal",
            plain: "amarilleo entre las venas de la hoja",
            def: "Patrón donde el tejido pierde verde mientras las venas permanecen marcadas.",
          },
        ],
        actions: ["Comprueba la humedad antes de abonar", "Suspende el abono si hay costra blanca"],
        params: [
          { label: "Patrón", value: "Entre nervios" },
          { label: "Causa", value: "Sales o magnesio" },
        ],
        sections: [VIGILAR("No añadas magnesio a ciegas: el exceso de sales también bloquea la absorción.")],
        cards: [
          card("hecho", "Nervios verdes con lámina amarilla", {
            sourceText: "amarilla entre los nervios, pero los nervios siguen verdes",
          }),
          card("supuesto", "El sustrato tiene costra blanca", { confidence: "baja" }),
        ],
      }),
      node({
        id: "demo-revisar-4",
        branchId: "demo-revisar",
        parentId: "demo-revisar-2",
        title: "Si aparecen telarañas finas (borrador)",
        species: "Monstera deliciosa",
        date: "2026-11-05",
        generatedAt: "2026-11-05 10:00",
        status: "borrador",
        brief: {
          goal: "diagnosticar",
          since: "menos_semana",
        },
        prompt: "Hoy vi telarañas finas entre las hojas nuevas. ¿Qué hago antes de mover las plantas vecinas?",
        esencia:
          "Son ácaros: aísla la planta, lava el envés y repite cada 5 días. Sube la humedad ambiental, pero no mojes las hojas al sol.",
        terms: [
          {
            word: "ácaros",
            plain: "arañitas rojas microscópicas",
            def: "Plaga diminuta que aparece con aire seco y teje telarañas muy finas en el envés.",
          },
        ],
        actions: ["Aísla la planta", "Lava el envés", "Repite cada 5 días"],
        params: [{ label: "Plaga", value: "Ácaros" }],
        sections: [VIGILAR("Los ácaros vuelven si la humedad sigue baja; revisa también las plantas vecinas.")],
        cards: [
          card("hecho", "Telarañas finas en el envés", { sourceText: "telarañas finas entre las hojas nuevas" }),
          card("supuesto", "La humedad ambiental es baja", { confidence: "alta" }),
        ],
      }),
    ],
  },
];
