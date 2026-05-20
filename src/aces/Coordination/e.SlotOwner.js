export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Gets owner UID of a slot. Use case: verify which agent owns a cover slot.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad key string.", type: "string" },
    { id: "slotType", name: "Slot Type", desc: "Category like cover.", type: "string" },
    { id: "slotId", name: "Slot ID", desc: "Slot identifier.", type: "string" },
  ],
};

export const expose = true;

export default function (squadId, slotType, slotId) {
  return this._getSlotOwner(squadId, slotType, slotId);
}