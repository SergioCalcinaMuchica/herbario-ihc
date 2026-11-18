import type { Card, CardType, KnowledgeNode } from "../types";

let seq = 1;

/** Genera un identificador único con el prefijo indicado. */
export const uid = (prefix: string) => `${prefix}${seq++}`;

/** Adelanta el contador de ids por encima del máximo existente tras hidratar. */
export function advanceUid(minNext: number) {
  seq = Math.max(seq, minNext);
}

/** Construye una carta de contexto con sus valores por defecto de ámbito y voz. */
export function card(
  type: CardType,
  text: string,
  extra: Partial<Card> = {},
): Card {
  return {
    id: uid("c"),
    type,
    text,
    state: type === "supuesto" ? "sin_confirmar" : "activo",
    scope:
      type === "preferencia"
        ? "global"
        : type === "artefacto"
          ? "especie"
          : "hilo",
    source: type === "hecho" ? "usuario" : "ia",
    ...extra,
  };
}

/** Construye un nodo de conocimiento (Respuesta) con valores por defecto. */
export function node(
  o: Partial<KnowledgeNode> &
    Pick<KnowledgeNode, "id" | "branchId" | "title" | "species">,
): KnowledgeNode {
  return {
    date: "2026-11-05",
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
    generatedAt: "2026-11-05 09:00",
    pinned: false,
    status: "lista",
    milestones: [],
    done: 3,
    ...o,
  };
}

export const POR_QUE = (t: string) => ({ title: "Por qué", body: t });
export const VIGILAR = (t: string) => ({ title: "Qué vigilar", body: t });
