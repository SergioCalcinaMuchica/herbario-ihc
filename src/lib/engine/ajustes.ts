// Ajustes directos sobre la ficha (idea de DirectGPT, Masson et al., CHI 2024):
// el usuario toca una parte de la respuesta y elige qué pedir sobre ella,
// y la misma ficha cambia en su lugar en vez de abrir un mensaje nuevo.
import type { Candidate, KnowledgeNode, Param } from "../types";
import { FLOWERS, LOW_LIGHT, SAFE, SAFE_SUN, SUN } from "../data/candidates";

export interface Opcion {
  id: string;
  label: string;
}

type Kind = "luz" | "riego" | "tierra" | "maceta" | "mascotas";

function kindOf(label: string): Kind | null {
  const l = label.toLowerCase();
  if (l === "luz") return "luz";
  if (/riego|agua/.test(l)) return "riego";
  if (/tierra|sustrato/.test(l)) return "tierra";
  if (/maceta|drenaje/.test(l)) return "maceta";
  if (/mascota/.test(l)) return "mascotas";
  return null;
}

const PARAM_OPTIONS: Record<Kind, Opcion[]> = {
  luz: [
    { id: "porque", label: "¿Por qué?" },
    { id: "poca", label: "Mi lugar tiene poca luz" },
    { id: "invierno", label: "¿Y en invierno?" },
  ],
  riego: [
    { id: "porque", label: "¿Por qué?" },
    { id: "invierno", label: "¿Y en invierno?" },
    { id: "tiempo", label: "Tengo poco tiempo" },
  ],
  tierra: [
    { id: "porque", label: "¿Por qué?" },
    { id: "donde", label: "¿Dónde la consigo?" },
  ],
  maceta: [
    { id: "porque", label: "¿Por qué?" },
    { id: "sin", label: "Mi maceta no tiene agujeros" },
  ],
  mascotas: [
    { id: "porque", label: "¿Por qué?" },
    { id: "gato", label: "Tengo un gato que muerde las plantas" },
  ],
};

/** Opciones que se ofrecen al tocar un dato de cuidado. */
export function paramOptions(p: Param): Opcion[] {
  const kind = kindOf(p.label);
  return kind ? PARAM_OPTIONS[kind] : [];
}

function addStep(node: KnowledgeNode, step: string) {
  if (!node.actions.includes(step)) node.actions = [...node.actions, step];
}

/** Aplica la opción elegida sobre un dato: agrega la explicación y, si hace falta, cambia el dato o suma un paso. */
export function applyParamOption(node: KnowledgeNode, index: number, optionId: string) {
  const p = node.params[index];
  const kind = kindOf(p.label);
  const toxic = /t[óo]xic/i.test(p.value);
  const unknown = /confirmar/i.test(p.value);
  let note = "";

  if (kind === "luz") {
    if (optionId === "porque")
      note = "La luz es lo que la planta usa para crecer. Con poca luz crece débil y pierde color, y con sol fuerte las hojas se queman.";
    if (optionId === "poca")
      note = "Ponla lo más cerca posible de la ventana. Si las hojas nuevas salen pequeñas o pálidas, le falta luz.";
    if (optionId === "invierno")
      note = "En invierno hay menos luz. Acércala a la ventana, sin que las hojas toquen el vidrio frío.";
  }
  if (kind === "riego") {
    if (optionId === "porque")
      note = "Si la tierra queda mojada mucho tiempo, las raíces se quedan sin aire y se pudren. Por eso se riega cuando la tierra se seca arriba.";
    if (optionId === "invierno")
      note = "En invierno la tierra tarda más en secarse. Riega más o menos la mitad de seguido.";
    if (optionId === "tiempo") {
      note = "Pon un recordatorio semanal en el celular y toca la tierra ese día. Si viajas, riega a fondo antes de salir.";
      addStep(node, "Pon un recordatorio semanal para revisar la tierra");
    }
  }
  if (kind === "tierra") {
    if (optionId === "porque")
      note = "La tierra suelta deja pasar el agua y el aire hasta las raíces. La tierra dura se aprieta y guarda demasiada agua.";
    if (optionId === "donde")
      note = "En viveros y tiendas de jardinería. Pide tierra para plantas de interior.";
  }
  if (kind === "maceta") {
    if (optionId === "porque")
      note = "Los agujeros dejan salir el agua que sobra. Sin ellos, el agua se junta abajo y pudre las raíces.";
    if (optionId === "sin") {
      p.value = "Cambiarla por una con agujeros";
      note = "Pásala a una maceta con agujeros, o ponla en una maceta de plástico con agujeros dentro de la que tienes.";
      addStep(node, "Cambia la maceta por una con agujeros abajo");
    }
  }
  if (kind === "mascotas") {
    if (optionId === "porque")
      note = unknown
        ? "No sé qué planta es, así que no puedo decir si es tóxica. Dime su nombre para revisarlo."
        : toxic
          ? "Sus hojas tienen sustancias que irritan la boca y el estómago de gatos y perros."
          : "No tiene sustancias que dañen a gatos o perros, aunque es mejor que no se la coman.";
    if (optionId === "gato") {
      if (toxic || unknown) {
        note = "Ponla colgada o en un estante alto donde el gato no llegue. Si la muerde y vomita, llévalo al veterinario.";
        addStep(node, "Ubícala donde el gato no llegue");
      } else {
        note = "No le hará daño, pero si la muerde mucho la planta se estropea. Puedes darle al gato una maceta con pasto para gatos.";
      }
    }
  }
  p.note = note;
}

/* ---------- Plantas candidatas ---------- */

export const CAND_OPTIONS: Opcion[] = [
  { id: "pequena", label: "Una más pequeña" },
  { id: "segura", label: "Una segura para mascotas" },
  { id: "quitar", label: "Quitar esta" },
];

const POOL: Candidate[] = [...LOW_LIGHT, ...SAFE, ...SUN, ...FLOWERS, ...SAFE_SUN];

/** Tamaño más grande que dice el texto, por ejemplo 80 en «40–80 cm». */
function maxSize(c: Candidate): number {
  const nums = c.size.match(/\d+(,\d+)?/g)?.map((n) => Number(n.replace(",", "."))) ?? [];
  if (!nums.length) return Infinity;
  const max = Math.max(...nums);
  return /\bm\b/.test(c.size) && !/cm/.test(c.size) ? max * 100 : max;
}

/** Cambia una candidata según la opción. Devuelve false si no hay otra planta que cumpla. */
export function applyCandOption(node: KnowledgeNode, index: number, optionId: string): boolean {
  const list = node.candidates ?? [];
  const current = list[index];
  if (optionId === "quitar") {
    node.candidates = list.filter((_, i) => i !== index);
    return true;
  }
  const shown = new Set(list.map((c) => c.name));
  const pick = POOL.find(
    (c) =>
      !shown.has(c.name) &&
      (optionId === "pequena" ? maxSize(c) < maxSize(current) : c.pets === "segura"),
  );
  if (!pick) return false;
  node.candidates = list.map((c, i) => (i === index ? { ...pick } : c));
  return true;
}

/* ---------- Ajustes de toda la respuesta ---------- */

/** Deja el párrafo principal en su primera frase y los pasos en tres. Devuelve false si ya estaba así. */
export function makeShorter(node: KnowledgeNode): boolean {
  const first = node.esencia.split(/(?<=\.)\s+/)[0];
  const changed = first !== node.esencia || node.actions.length > 3;
  node.esencia = first;
  node.actions = node.actions.slice(0, 3);
  return changed;
}

/** Cambia todas las palabras difíciles marcadas por su versión simple. Devuelve false si no había ninguna. */
export function makeSimpler(node: KnowledgeNode): boolean {
  const pending = node.terms.filter((t) => !node.replaced[t.word]);
  for (const t of pending) node.replaced[t.word] = t.plain;
  return pending.length > 0;
}
