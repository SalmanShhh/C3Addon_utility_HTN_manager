export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Set Slot Position",
  displayText: "Set slot {2} of type {1} in squad {0} to {3}, {4}",
  description: "Defines one slot position from event-sheet coordinates. Use case: set cover node positions at layout start.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Category like cover or flank.", type: "string", initialValue: '"cover"' },
    { id: "slotId", name: "Slot ID", desc: "Slot identifier.", type: "string", initialValue: '"node_1"' },
    { id: "x", name: "X", desc: "Slot world X.", type: "number", initialValue: "0" },
    { id: "y", name: "Y", desc: "Slot world Y.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (squadId, slotType, slotId, x, y) {
  return this._setSlotPosition(squadId, slotType, slotId, x, y);
}