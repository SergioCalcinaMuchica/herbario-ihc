import type { Branch, Card, KnowledgeNode, Session } from "../types";
import { card, node, POR_QUE, VIGILAR } from "./factory";

const STRESS_SPECIES = [
  "Calathea orbifolia",
  "Ulmus parvifolia",
  "Anthurium andraeanum",
  "Nephrolepis exaltata",
  "Monstera deliciosa",
  "Epipremnum aureum",
  "Echinopsis chamaecereus",
  "Phalaenopsis amabilis",
];

/** Construye la sesión de prueba de estrés (200 láminas y 3.400 cartas). */
export function buildStressSession(): Session {
  const branches: Branch[] = STRESS_SPECIES.map((species, bi) => {
    const nodes: KnowledgeNode[] = Array.from({ length: 25 }, (_, i) =>
      node({
        id: `st-${bi}-${i}`,
        branchId: `st-b${bi}`,
        title: `Revisión ${i + 1}: hojas enrolladas, bordes secos y amarilleamiento entre nervios`,
        species,
        date: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
        prompt: `Revisión ${i + 1}: la planta tiene hojas enrolladas y los bordes secos. ¿Qué reviso primero?`,
        esencia:
          "La clorosis internerveal con bordes secos apunta a humedad baja o a sales acumuladas; pide una foto del envés antes de decidir.",
        terms: [
          {
            word: "clorosis internerveal",
            plain: "amarilleamiento entre los nervios",
            def: "La hoja pierde verde entre los nervios, que siguen oscuros.",
          },
        ],
        actions: [
          "Comprueba la humedad con un higrómetro",
          "Riega hasta que drene y vacía el plato",
          "Suspende el abono tres semanas",
        ],
        params: [
          { label: "Luz", value: "Indirecta, 6 h" },
          { label: "Agua", value: "Según peso" },
          { label: "Humedad", value: "> 50 %" },
        ],
        sections: [
          POR_QUE(
            "El aire seco abre una herida en el borde de la hoja que el riego no cierra.",
          ),
          VIGILAR(
            "Si el nervio central amarillea, el problema es drenaje, no humedad.",
          ),
        ],
        cards: [
          ...Array.from({ length: 9 }, (_, h) =>
            card(
              "hecho",
              `Observación ${h + 1}: hoja ${h + 2} con el borde seco`,
              {
                detail: `Registrada el día ${h + 1}`,
              },
            ),
          ),
          card("supuesto", "La maceta tiene orificio de drenaje", {
            confidence: "alta",
          }),
          card("supuesto", "La humedad ambiental baja del 40 %", {
            confidence: "media",
          }),
          card("supuesto", "El sustrato lleva perlita", {
            confidence: "baja",
            state: "confirmado",
          }),
          card("preferencia", "Usar comparaciones simples, no histología", {
            scope: "hilo",
          }),
          card("preferencia", "Evitar términos técnicos sin variante llana", {
            scope: "global",
          }),
          card("artefacto", "Calendario de riego por peso", { scope: "hilo" }),
          card("artefacto", "Protocolo de revisión del envés", {
            scope: "especie",
          }),
          card("artefacto", "Ficha de trasplante en 6 pasos", {
            scope: "especie",
          }),
        ],
        pinned: i % 5 === 0,
        status:
          i % 17 === 0 ? "desactualizada" : i % 11 === 0 ? "borrador" : "lista",
      }),
    );
    return {
      id: `st-b${bi}`,
      name: species.split(" ")[0],
      species,
      closed: false,
      nodes,
    };
  });

  const stressSession: Session = {
    id: "stress",
    title: "Estrés · 200 láminas",
    branches,
  };
  return stressSession;
}

function demoNode(o: {
  id: string;
  title: string;
  date: string;
  parentId?: string;
  prompt: string;
  esencia: string;
  actions: string[];
  params: { label: string; value: string }[];
  status?: KnowledgeNode["status"];
  pinned?: boolean;
  cards?: Card[];
}): KnowledgeNode {
  return node({
    id: o.id,
    branchId: "demo-calathea",
    parentId: o.parentId,
    title: o.title,
    species: "Calathea orbifolia",
    date: o.date,
    prompt: o.prompt,
    esencia: o.esencia,
    actions: o.actions,
    params: o.params,
    sections: [POR_QUE(o.esencia)],
    cards: o.cards ?? [card("hecho", "La planta sigue en interior")],
    status: o.status ?? "lista",
    done: o.status === "borrador" ? 1 : 3,
    milestones: [],
    pinned: o.pinned ?? false,
  });
}

/** Construye la sesión de ejemplo de linaje con 35 consultas. */
export function buildTreeDemoSession(): Session {
  const nodes: KnowledgeNode[] = [
    demoNode({
      id: "td-root",
      title: "Hojas enrolladas y bordes secos",
      date: "2026-09-01",
      prompt:
        "Mi calathea tiene las hojas enrolladas y los bordes secos. ¿Qué puede ser?",
      esencia:
        "El enrollado nace del aire seco; los bordes pajizos confirman que la humedad baja antes que el riego.",
      actions: [
        "Mide la humedad de la habitación",
        "Revisa los primeros 3 cm de sustrato",
      ],
      params: [
        { label: "Humedad", value: "< 40 %" },
        { label: "Riego", value: "Cada 4 días" },
      ],
      pinned: true,
      cards: [
        card("hecho", "Las hojas nuevas salen enrolladas"),
        card("hecho", "Los bordes secos empezaron hace dos semanas"),
        card(
          "supuesto",
          "La maceta está junto a una ventana con sol de mediodía",
          { confidence: "media" },
        ),
      ],
    }),
    demoNode({
      id: "td-a",
      title: "Humedad y riego en invierno",
      date: "2026-09-03",
      parentId: "td-root",
      prompt: "¿Cómo ajusto humedad y riego cuando llega el invierno?",
      esencia:
        "En invierno la calathea bebe la mitad: el aire interior seco sigue siendo el enemigo, no el frío.",
      actions: [
        "Agrupa plantas para subir la humedad",
        "Riega solo cuando el sustrato pierda peso",
      ],
      params: [
        { label: "Humedad", value: "50–60 %" },
        { label: "Agua", value: "Cada 8 días" },
      ],
      status: "borrador",
      cards: [
        card("hecho", "La calefacción está encendida desde octubre"),
        card("supuesto", "La humedad de la habitación baja del 40 %", {
          confidence: "alta",
        }),
      ],
    }),
    demoNode({
      id: "td-a1",
      title: "Riego por peso de maceta",
      date: "2026-09-05",
      parentId: "td-a",
      prompt: "¿Cómo sé cuándo regar sin meter el dedo en el sustrato?",
      esencia:
        "Pesa la maceta antes y después de regar: la diferencia te da el agua que la planta consume.",
      actions: [
        "Pesa la maceta en seco",
        "Riega hasta que drene y vuelve a pesar",
      ],
      params: [
        { label: "Peso", value: "1/3 menos" },
        { label: "Frecuencia", value: "Según peso" },
      ],
    }),
    demoNode({
      id: "td-a1a",
      title: "Sustrato con perlita",
      date: "2026-09-07",
      parentId: "td-a1",
      prompt: "¿Qué sustrato usa una calathea para no encharcarse?",
      esencia:
        "Un tercio de perlita deja pasar el aire que la raíz necesita y evita que el centro quede encharcado.",
      actions: [
        "Mezcla 2 partes de sustrato y 1 de perlita",
        "Trasplanta sin apretar",
      ],
      params: [
        { label: "Mezcla", value: "2:1" },
        { label: "Drenaje", value: "Alto" },
      ],
    }),
    demoNode({
      id: "td-a1b",
      title: "Agua reposada 24 h",
      date: "2026-09-08",
      parentId: "td-a1",
      prompt: "¿Sirve dejar el agua reposada antes de regar la calathea?",
      esencia:
        "Dejar el agua 24 h en un vaso ancho deja escapar el cloro y templa el agua antes de regar.",
      actions: [
        "Llena una jarra la noche anterior",
        "Riega a temperatura ambiente",
      ],
      params: [
        { label: "Reposo", value: "24 h" },
        { label: "Cloro", value: "Menos" },
      ],
    }),
    demoNode({
      id: "td-a2",
      title: "Radiador y aire seco",
      date: "2026-09-09",
      parentId: "td-a",
      prompt: "La calathea está cerca del radiador. ¿La muevo?",
      esencia:
        "A dos metros del radiador la humedad cae en picado; la calathea pierde turgencia aunque el sustrato esté húmedo.",
      actions: [
        "Aleja la maceta del radiador",
        "Coloca una bandeja con guijarros",
      ],
      params: [
        { label: "Distancia", value: "> 2 m" },
        { label: "Humedad", value: "> 50 %" },
      ],
      cards: [
        card("hecho", "El radiador está a un metro de la maceta"),
        card("supuesto", "El aire seco es la causa del borde pajizo", {
          confidence: "media",
        }),
      ],
    }),
    demoNode({
      id: "td-a2a",
      title: "Bandeja de guijarros",
      date: "2026-09-11",
      parentId: "td-a2",
      prompt: "¿Cómo monto una bandeja de guijarros para subir la humedad?",
      esencia:
        "La bandeja con guijarros y agua aumenta la humedad alrededor sin mojar la base de la maceta.",
      actions: [
        "Llena la bandeja sin tocar el fondo de la maceta",
        "Repón el agua cada tres días",
      ],
      params: [
        { label: "Agua", value: "Bajo la rejilla" },
        { label: "Humedad", value: "+10 %" },
      ],
    }),
    demoNode({
      id: "td-a2a1",
      title: "Humedad medida con higrómetro",
      date: "2026-09-13",
      parentId: "td-a2a",
      prompt: "¿Cómo compruebo que la bandeja funciona?",
      esencia:
        "Un higrómetro barato convierte la sensación en cifra: por debajo del 45 % la calathea sufre.",
      actions: [
        "Coloca el higrómetro a la altura de las hojas",
        "Anota la lectura por la mañana",
      ],
      params: [
        { label: "Medida", value: "45–60 %" },
        { label: "Lectura", value: "Diaria" },
      ],
    }),
    demoNode({
      id: "td-a2b",
      title: "Mover a la cocina",
      date: "2026-09-15",
      parentId: "td-a2",
      prompt:
        "¿Puedo llevar la calathea a la cocina para que tenga más humedad?",
      esencia:
        "La cocina acumula vapor al cocinar: una ubicación temporal con más humedad y sin sol directo.",
      actions: [
        "Prueba dos semanas en la cocina",
        "Evita la zona de la vitrocerámica",
      ],
      params: [
        { label: "Estancia", value: "Cocina" },
        { label: "Prueba", value: "2 semanas" },
      ],
    }),
    demoNode({
      id: "td-d",
      title: "Volver a la rutina",
      date: "2026-09-17",
      parentId: "td-a",
      prompt: "Con la humedad controlada, ¿cómo vuelvo a una rutina sencilla?",
      esencia:
        "Con la humedad estabilizada, el riego vuelve a un calendario simple y sin rescates de emergencia.",
      actions: ["Fija un día de revisión semanal", "Retira las hojas secas"],
      params: [
        { label: "Revisión", value: "Semanal" },
        { label: "Abono", value: "Suspendido" },
      ],
    }),
    demoNode({
      id: "td-d1",
      title: "Calendario de riego",
      date: "2026-09-18",
      parentId: "td-d",
      prompt: "¿Cómo organizo los riegos del año?",
      esencia:
        "Un calendario por estación evita regar de más en invierno y de menos en verano.",
      actions: ["Marca los riegos en la nevera", "Ajusta según el peso"],
      params: [
        { label: "Verano", value: "4 días" },
        { label: "Invierno", value: "8–10 días" },
      ],
    }),
    demoNode({
      id: "td-d1a",
      title: "Verano",
      date: "2026-09-20",
      parentId: "td-d1",
      prompt: "¿Cada cuánto riego en verano?",
      esencia:
        "En verano la maceta pierde un tercio de su peso en cuatro días: riega al atardecer.",
      actions: ["Riega al atardecer", "Comprueba el plato"],
      params: [
        { label: "Agua", value: "Cada 4 días" },
        { label: "Hora", value: "Atardecer" },
      ],
    }),
    demoNode({
      id: "td-d1b",
      title: "Invierno",
      date: "2026-09-21",
      parentId: "td-d1",
      prompt: "¿Cada cuánto riego en invierno con calefacción?",
      esencia:
        "En invierno el sustrato tarda el doble en secarse; el dedo es más fiable que el calendario.",
      actions: ["Comprueba 3 cm de sustrato", "Riega con agua templada"],
      params: [
        { label: "Agua", value: "Cada 8–10 días" },
        { label: "Temperatura", value: "Templada" },
      ],
    }),
    demoNode({
      id: "td-d2",
      title: "Abono",
      date: "2026-09-23",
      parentId: "td-d",
      prompt: "¿Cuándo y cuánto abono la calathea?",
      esencia:
        "Abona solo en crecimiento activo y a media dosis: las sales se acumulan y queman los bordes.",
      actions: [
        "Usa abono líquido a media dosis",
        "Suspende de noviembre a febrero",
      ],
      params: [
        { label: "Dosis", value: "Media" },
        { label: "Época", value: "Marzo–octubre" },
      ],
    }),
    demoNode({
      id: "td-d2a",
      title: "NPK",
      date: "2026-09-24",
      parentId: "td-d2",
      prompt: "¿Qué NPK le va mejor a una calathea?",
      esencia:
        "Un NPK equilibrado 10-10-10 a media dosis cubre la calathea sin forzar hojas tiernas.",
      actions: ["Diluye 1 ml por litro", "Abona tras regar"],
      params: [
        { label: "NPK", value: "10-10-10" },
        { label: "Frecuencia", value: "Cada 15 días" },
      ],
    }),
    demoNode({
      id: "td-b",
      title: "Manchas y amarillamiento",
      date: "2026-09-04",
      parentId: "td-root",
      prompt:
        "Han salido manchas marrones y hojas amarillas. ¿Es exceso de riego?",
      esencia:
        "Las manchas marrones con halo amarillo separan el exceso de sales del daño por frío.",
      actions: [
        "Fotografía el envés y el haz",
        "Anota el patrón de las manchas",
      ],
      params: [
        { label: "Mancha", value: "Marrones" },
        { label: "Borde", value: "Amarillo" },
      ],
    }),
    demoNode({
      id: "td-b1",
      title: "Clorosis o exceso de sales",
      date: "2026-09-06",
      parentId: "td-b",
      prompt: "¿Cómo distingo clorosis de exceso de sales?",
      esencia:
        "El amarillo entre nervios con nervios verdes apunta a sales; el amarillo general, a falta de nutrientes.",
      actions: [
        "Compara hojas viejas y nuevas",
        "Revisa la costra blanca en el borde",
      ],
      params: [
        { label: "Nervios", value: "Verdes" },
        { label: "Sales", value: "Posible" },
      ],
    }),
    demoNode({
      id: "td-b1a",
      title: "Lavado de sustrato",
      date: "2026-09-10",
      parentId: "td-b1",
      prompt: "¿Cómo lavo las sales del sustrato sin ahogar la planta?",
      esencia:
        "Riega tres veces con agua abundante y deja drenar: las sales salen por el plato, no se quedan.",
      actions: [
        "Riega hasta que drene",
        "Vacía el plato diez minutos después",
        "Repite en dos semanas",
      ],
      params: [
        { label: "Agua", value: "3 riegos" },
        { label: "Repetición", value: "15 días" },
      ],
      pinned: true,
    }),
    demoNode({
      id: "td-b1a1",
      title: "Revisión a 15 días",
      date: "2026-09-12",
      parentId: "td-b1a",
      prompt: "¿Cómo sé si el lavado de sustrato funcionó?",
      esencia:
        "Si el amarillo no avanza en 15 días, el lavado funcionó; si avanza, toca cambiar sustrato.",
      actions: ["Compara con la foto inicial", "Mide el nuevo brote"],
      params: [
        { label: "Plazo", value: "15 días" },
        { label: "Foto", value: "Referencia" },
      ],
      status: "desactualizada",
      cards: [
        card("hecho", "La foto inicial muestra dos hojas amarillas"),
        card("supuesto", "El agua del grifo tiene dureza alta", {
          confidence: "media",
        }),
      ],
    }),
    demoNode({
      id: "td-b1b",
      title: "Agua filtrada",
      date: "2026-09-14",
      parentId: "td-b1a",
      prompt: "¿Vale la pena regar con agua filtrada?",
      esencia:
        "Filtrar el agua reduce la cal que se deposita en el sustrato y en los bordes de la hoja.",
      actions: ["Llena una jarra con filtro", "Alterna con agua de lluvia"],
      params: [
        { label: "Cal", value: "Baja" },
        { label: "Riego", value: "Filtrada" },
      ],
    }),
    demoNode({
      id: "td-b2",
      title: "Hojas nuevas enrolladas",
      date: "2026-09-16",
      parentId: "td-b",
      prompt: "Las hojas nuevas siguen enrolladas. ¿Es normal?",
      esencia:
        "Una hoja nueva enrollada es normal; si no abre en una semana, el problema es frío o riego corto.",
      actions: [
        "Espera siete días antes de intervenir",
        "Revisa la temperatura nocturna",
      ],
      params: [
        { label: "Apertura", value: "7 días" },
        { label: "Noche", value: "> 16 °C" },
      ],
    }),
    demoNode({
      id: "td-b2a",
      title: "Frío nocturno",
      date: "2026-09-18",
      parentId: "td-b2",
      prompt: "¿Puede ser frío de la noche?",
      esencia:
        "Por debajo de 16 °C la calathea deja de abrir hojas y muestra bordes oscuros.",
      actions: ["Mide la temperatura de noche", "Aleja la maceta del cristal"],
      params: [
        { label: "Noche", value: "> 16 °C" },
        { label: "Corriente", value: "Ninguna" },
      ],
    }),
    demoNode({
      id: "td-b2a1",
      title: "Mover al interior",
      date: "2026-09-20",
      parentId: "td-b2a",
      prompt: "¿Dónde la pongo para que no pase frío?",
      esencia:
        "Un pasillo interior sin corrientes mantiene la noche por encima de los 16 °C.",
      actions: ["Traslada la maceta al pasillo", "Evita la puerta de la calle"],
      params: [
        { label: "Lugar", value: "Pasillo" },
        { label: "Noche", value: "18 °C" },
      ],
    }),
    demoNode({
      id: "td-b2b",
      title: "Riego insuficiente",
      date: "2026-09-19",
      parentId: "td-b2",
      prompt: "¿Y si el problema es que riego poco?",
      esencia:
        "Si el sustrato está seco a 3 cm y la hoja no abre, el riego llega tarde.",
      actions: [
        "Riega en profundidad una vez",
        "Comprueba el peso al día siguiente",
      ],
      params: [
        { label: "Sequedad", value: "3 cm" },
        { label: "Riego", value: "Profundo" },
      ],
    }),
    demoNode({
      id: "td-b2b1",
      title: "Ajustar frecuencia",
      date: "2026-09-22",
      parentId: "td-b2b",
      prompt: "¿Cada cuánto riego ahora que sé que llego tarde?",
      esencia:
        "Pasa de riego semanal fijo a revisión cada cinco días con el dedo.",
      actions: ["Revisa cada cinco días", "Riega solo si está seco"],
      params: [
        { label: "Revisión", value: "5 días" },
        { label: "Agua", value: "Si seco" },
      ],
      status: "borrador",
    }),
    demoNode({
      id: "td-b2b1a",
      title: "Medir con higrómetro",
      date: "2026-09-25",
      parentId: "td-b2b1",
      prompt: "¿Cómo mido la humedad a más profundidad?",
      esencia:
        "El higrómetro de sustrato confirma la humedad a 10 cm, donde el dedo no llega.",
      actions: ["Introduce la sonda a 10 cm", "Limpia la sonda tras usarla"],
      params: [
        { label: "Sonda", value: "10 cm" },
        { label: "Lectura", value: "3–4" },
      ],
      cards: [
        card("hecho", "La sonda del higrómetro llega a 10 cm"),
        card("supuesto", "El sustrato tarda más de cinco días en secarse", {
          confidence: "media",
        }),
      ],
    }),
    demoNode({
      id: "td-c",
      title: "Elegir otra planta parecida",
      date: "2026-09-05",
      parentId: "td-root",
      prompt:
        "Si la calathea no se adapta, ¿qué planta parecida me recomiendas?",
      esencia:
        "Si la calathea no se adapta, una maranta o una stromanthe piden menos humedad y perdonan más.",
      actions: ["Compara luz y riego de las tres", "Elige una de hoja pequeña"],
      params: [
        { label: "Opciones", value: "3" },
        { label: "Dificultad", value: "Media" },
      ],
    }),
    demoNode({
      id: "td-c1",
      title: "Calathea medallón",
      date: "2026-09-07",
      parentId: "td-c",
      prompt: "¿La calathea medallón es igual de exigente?",
      esencia:
        "La medallón repite el patrón de la orbifolia: luz indirecta y humedad constante.",
      actions: ["Colócala con luz filtrada", "Mantén la humedad sobre 50 %"],
      params: [
        { label: "Luz", value: "Indirecta" },
        { label: "Humedad", value: "> 50 %" },
      ],
      status: "desactualizada",
      cards: [
        card("hecho", "La ventana recibe luz de mañana"),
        card("supuesto", "La casa mantiene un 45 % de humedad en invierno", {
          confidence: "media",
        }),
      ],
    }),
    demoNode({
      id: "td-c1a",
      title: "Luz indirecta",
      date: "2026-09-09",
      parentId: "td-c1",
      prompt: "¿Cuánta luz necesita la medallón?",
      esencia:
        "Un tul en la ventana basta: el sol directo de mediodía quema la medallón en una tarde.",
      actions: ["Cuelga un tul fino", "Gira la maceta cada semana"],
      params: [
        { label: "Luz", value: "Filtrada" },
        { label: "Giro", value: "Semanal" },
      ],
    }),
    demoNode({
      id: "td-c1b",
      title: "Riego",
      date: "2026-09-10",
      parentId: "td-c1",
      prompt: "¿Cada cuánto riego la medallón?",
      esencia:
        "La medallón quiere riego regular pero nunca encharcado: plato vacío diez minutos después.",
      actions: ["Riega cuando pierda peso", "Vacía el plato"],
      params: [
        { label: "Agua", value: "Cada 5 días" },
        { label: "Plato", value: "Vacío" },
      ],
    }),
    demoNode({
      id: "td-c2",
      title: "Maranta",
      date: "2026-09-08",
      parentId: "td-c",
      prompt: "¿La maranta aguanta mejor la humedad de casa?",
      esencia:
        "La maranta tolera mejor la humedad baja y cierra sus hojas por la noche.",
      actions: ["Ponla en luz media", "Riega con agua reposada"],
      params: [
        { label: "Luz", value: "Media" },
        { label: "Agua", value: "Reposada" },
      ],
    }),
    demoNode({
      id: "td-c2a",
      title: "Humedad",
      date: "2026-09-11",
      parentId: "td-c2",
      prompt: "¿Qué humedad necesita una maranta?",
      esencia:
        "La maranta agradece la bandeja de guijarros, pero sobrevive con menos humedad que la calathea.",
      actions: ["Usa bandeja con guijarros", "Agrupa con otras plantas"],
      params: [
        { label: "Humedad", value: "40–50 %" },
        { label: "Bandeja", value: "Sí" },
      ],
      pinned: true,
    }),
    demoNode({
      id: "td-c2b",
      title: "Sustrato",
      date: "2026-09-12",
      parentId: "td-c2",
      prompt: "¿Qué sustrato preparo para la maranta?",
      esencia:
        "Un sustrato suelto con turba y perlita evita que la maranta pierda raíces por encharcamiento.",
      actions: [
        "Mezcla turba, fibra de coco y perlita",
        "Trasplanta en primavera",
      ],
      params: [
        { label: "Mezcla", value: "Turba + perlita" },
        { label: "Drenaje", value: "Suelto" },
      ],
      cards: [
        card("hecho", "La maceta actual mide 12 cm de diámetro"),
        card("supuesto", "El sustrato actual retiene demasiada agua", {
          confidence: "media",
        }),
      ],
    }),
    demoNode({
      id: "td-c3",
      title: "Stromanthe",
      date: "2026-09-09",
      parentId: "td-c",
      prompt: "¿La stromanthe conserva el rosa en interior?",
      esencia:
        "La stromanthe necesita más luz que la maranta para conservar el rosa de sus hojas.",
      actions: ["Busca luz indirecta abundante", "Evita el sol de mediodía"],
      params: [
        { label: "Luz", value: "Abundante" },
        { label: "Rosa", value: "Depende de luz" },
      ],
    }),
    demoNode({
      id: "td-c3a",
      title: "Sol",
      date: "2026-09-13",
      parentId: "td-c3",
      prompt: "¿Cuánto sol directo aguanta la stromanthe?",
      esencia:
        "Dos horas de sol de mañana mantienen el rosa; el sol de tarde lo quema.",
      actions: ["Prueba sol hasta las 11 h", "Retira si aparecen manchas"],
      params: [
        { label: "Sol", value: "2 h" },
        { label: "Hora", value: "Mañana" },
      ],
      status: "borrador",
    }),
  ];

  const session: Session = {
    id: "tree-demo",
    title: "Ejemplo · Calathea con forks",
    branches: [
      {
        id: "demo-calathea",
        name: "Calathea",
        species: "Calathea orbifolia",
        closed: false,
        nodes,
      },
    ],
  };
  return session;
}
