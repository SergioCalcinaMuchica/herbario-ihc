import type { Card, KnowledgeNode, Scope, Term } from "../types";
import { card } from "../data/factory";
import { app, toast } from "./state.svelte";
import { activeNode, allNodes, allNodesEverywhere, ownerOfCard, sessionOfNode } from "./queries";

const SCOPES: Scope[] = ["hilo", "especie", "global"];

export function touch(node: KnowledgeNode) {
  node.version += 1;
  node.generatedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
}

/** Marca las láminas que dependen de una carta cambiada. */
function markDependents(card: Card, owner: KnowledgeNode) {
  const affected = allNodesEverywhere().filter((n) => {
    if (n.id === owner.id) return false;
    if (card.scope === "global") return true;
    if (card.scope === "especie") return n.species === owner.species;
    const session = sessionOfNode(owner) ?? app.session;
    const b = session.branches.find((x) => x.id === owner.branchId);
    if (!b) return false;
    const i = b.nodes.findIndex((x) => x.id === owner.id);
    return b.nodes.slice(i + 1).some((x) => x.id === n.id);
  });
  const reason = `Cambio en «${card.text}» (${card.scope}) desde «${owner.title}»`;
  affected.forEach((n) => {
    n.status = "desactualizada";
    n.staleReason = reason;
  });
  return affected.length;
}

export function confirmCard(c: Card) {
  c.state = "confirmado";
  c.phase = undefined;
  const owner = ownerOfCard(c);
  if (owner) touch(owner);
  toast("Supuesto confirmado: queda versionado");
}

export function correctCard(c: Card, text: string) {
  if (!text.trim()) return;
  const owner = ownerOfCard(c);
  c.text = text.trim();
  c.state = "corregido";
  c.phase = undefined;
  if (owner) {
    touch(owner);
    owner.status = "desactualizada";
    owner.staleReason = `Corregiste «${c.text}» en esta respuesta.`;
    markDependents(c, owner);
  }
  toast("Supuesto corregido: las láminas dependientes quedan desactualizadas");
}

export function ignoreCard(c: Card) {
  const owner = ownerOfCard(c);
  c.state = "ignorado";
  c.phase = undefined;
  if (owner) {
    touch(owner);
    owner.status = "desactualizada";
    owner.staleReason = `Ignoraste «${c.text}» en esta respuesta.`;
    markDependents(c, owner);
  }
  toast("Supuesto ignorado: las láminas dependientes quedan desactualizadas");
}

export function resolvePreference(keep: Card, all: Card[]) {
  const owner = ownerOfCard(keep);
  keep.state = "confirmado";
  keep.phase = undefined;
  all.filter((c) => c.id !== keep.id).forEach((c) => (c.state = "ignorado"));
  if (owner) {
    touch(owner);
    markDependents(keep, owner);
  }
  toast("Preferencia resuelta para este ámbito");
}


export function editCard(c: Card, text: string) {
  if (!text.trim()) return;
  const owner = ownerOfCard(c);
  c.text = text.trim();
  c.phase = undefined;
  if (owner) {
    touch(owner);
    owner.status = "desactualizada";
    owner.staleReason = `Editaste «${c.text}» en esta respuesta.`;
    markDependents(c, owner);
  }
  toast("Dato actualizado");
}

export function removeCard(c: Card) {
  const node = ownerOfCard(c);
  if (!node) return;
  node.cards = node.cards.filter((x) => x.id !== c.id);
  touch(node);
  markDependents(c, node);
  toast("Carta quitada");
}

export function setScope(c: Card, scope: Scope) {
  const owner = ownerOfCard(c);
  c.scope = scope;
  c.phase = undefined;
  if (owner) {
    touch(owner);
    markDependents(c, owner);
  }
  toast(`Ámbito: ${scope}`);
}

export function nextScope(c: Card) {
  const i = SCOPES.indexOf(c.scope);
  setScope(c, SCOPES[(i + 1) % SCOPES.length]);
}

export function replaceTerm(node: KnowledgeNode, term: Term, scope: Scope) {
  node.replaced[term.word] = term.plain;
  const pref = card(
    "preferencia",
    `Usar «${term.plain}» en lugar de «${term.word}»`,
    { scope, source: "usuario" },
  );
  node.cards.push(pref);
  touch(node);
  markDependents(pref, node);
  toast(`Término reemplazado · ámbito ${scope}`);
}

export function restoreTerms(node: KnowledgeNode) {
  node.replaced = {};
  touch(node);
  toast("Texto original restaurado");
}

export function addPreference(text: string, scope: Scope) {
  const node = activeNode();
  if (!node) return;
  const pref = card("preferencia", text, { scope, source: "usuario" });
  node.cards.push(pref);
  touch(node);
  markDependents(pref, node);
  toast("Preferencia guardada");
}
