export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "On Slot Released",
  displayText: "On slot released",
  description: "Triggered when a slot is released or expires. Use case: make slot visible as available again.",
  isTrigger: true,
  isInvertible: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}