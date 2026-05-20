export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "Is Slot Free",
  displayText: "Is slot {2} of type {1} in squad {0} free",
  description: "Checks if a slot is available. Use case: only reserve cover if not already occupied.",
  isInvertible: true,
  params: [
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Category like cover or flank.", type: "string", initialValue: '"cover"' },
    { id: "slotId", name: "Slot ID", desc: "Slot identifier.", type: "string", initialValue: '"node_1"' },
  ],
};

export const expose = false;

export default function (squadId, slotType, slotId) {
  return this._isSlotFree(squadId, slotType, slotId);
}