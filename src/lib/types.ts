export type Scope = 'hilo' | 'especie' | 'global';
export type CardType = 'hecho' | 'supuesto' | 'preferencia' | 'artefacto';
export type CardState = 'activo' | 'sin_confirmar' | 'confirmado' | 'corregido' | 'ignorado';
export type Confidence = 'alta' | 'media' | 'baja';
/** Quién sostiene la carta: el usuario o la IA. El tipo nunca sustituye a la voz. */
export type CardSource = 'usuario' | 'ia';
export type NodeStatus = 'lista' | 'borrador' | 'generando' | 'desactualizada';

export interface Term {
  word: string;
  plain: string;
  def: string;
}

export interface Brief {
  goal?: 'elegir' | 'identificar' | 'diagnosticar' | 'cuidar' | '';
  light?: 'poca' | 'indirecta' | 'sol' | '';
  water?: 'bajo' | 'medio' | 'alto' | '';
  drainage?: 'si' | 'no' | 'no_se' | '';
  pets?: 'mascotas' | 'sin_mascotas' | '';
  space?: 'pequeno' | 'amplio' | '';
  since?: 'menos_semana' | 'semanas' | 'meses' | '';
  recent?: 'abono' | 'trasplante' | 'nada' | '';
}

export interface Card {
  id: string;
  type: CardType;
  text: string;
  state: CardState;
  confidence?: Confidence;
  scope: Scope;
  detail?: string;
  /** 'entrada' = supuesto leído antes de generar; 'generacion' = nació con la lámina. */
  phase?: 'entrada' | 'generacion';
  /** Voz de la carta. Un hecho siempre es del usuario; la IA solo propone o supone. */
  source?: CardSource;
  /** Cita textual del mensaje del usuario, cuando exista. */
  sourceText?: string;
}

export interface Section {
  title: string;
  body: string;
}

export interface Param {
  label: string;
  value: string;
}

export type PlantArt = 'upright' | 'stems' | 'rosette' | 'trailing' | 'cactus' | 'fern' | 'orchid' | 'palm';
export type PetSafety = 'segura' | 'precaucion' | 'toxica';

export interface Candidate {
  id: string;
  name: string;
  scientific: string;
  art: PlantArt;
  color: string;
  fit: string;
  needs: string;
  light: string;
  water: string;
  size: string;
  difficulty: 1 | 2 | 3;
  pets: PetSafety;
}

export interface KnowledgeNode {
  id: string;
  branchId: string;
  /** Respuesta de la que nace esta consulta. Sin padre = raíz de una línea. */
  parentId?: string;
  title: string;
  species: string;
  date: string;
  prompt: string;
  esencia: string;
  terms: Term[];
  replaced: Record<string, string>;
  actions: string[];
  params: Param[];
  sections: Section[];
  cards: Card[];
  candidates?: Candidate[];
  brief?: Brief;
  model: string;
  version: number;
  generatedAt: string;
  pinned: boolean;
  status: NodeStatus;
  staleReason?: string;
  milestones: string[];
  done: number;
  /** Pasos de «Qué hacer» que el usuario marcó como hechos (por posición). */
  stepsDone?: number[];
}

export interface Branch {
  id: string;
  name: string;
  species: string;
  closed: boolean;
  nodes: KnowledgeNode[];
}

export interface Session {
  id: string;
  title: string;
  branches: Branch[];
}
