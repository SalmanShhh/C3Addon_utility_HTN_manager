export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Release Slot",
  displayText: "Release slot {2} of type {1} in squad {0}",
  description: "Releases a reserved slot. Use case: free cover slot when an agent moves away.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Category like cover or flank.", type: "string", initialValue: '"cover"' },
    { id: "slotId", name: "Slot ID", desc: "Slot identifier.", type: "string", initialValue: '"node_1"' },
  ],
};

export const expose = true;

export default function (squadId, slotType, slotId) {
  return this._releaseSlot(squadId, slotType, slotId);
}