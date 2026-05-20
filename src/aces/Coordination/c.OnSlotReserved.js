export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "On Slot Reserved",
  displayText: "On slot reserved",
  description: "Triggered when a slot gets reserved. Use case: update debug overlays for cover claims.",
  isTrigger: true,
  isInvertible: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}