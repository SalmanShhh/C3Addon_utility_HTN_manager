export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Load Slot Positions From JSON",
  displayText: "Load slot positions for squad {0} type {1} from {2}",
  description: "Loads many slot positions from JSON array data. Use case: import a pre-authored cover map.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
    { id: "slotType", name: "Slot Type", desc: "Category like cover or flank.", type: "string", initialValue: '"cover"' },
    { id: "slotsJson", name: "Slots JSON", desc: "JSON array of {id,x,y} entries.", type: "string", initialValue: '"[]"' },
  ],
};

export const expose = true;

export default function (squadId, slotType, slotsJson) {
  return this._loadSlotPositionsFromJson(squadId, slotType, slotsJson);
}