export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "On Plan Interrupted",
  displayText: "On plan interrupted",
  description: "Triggered when high-urgency input interrupts a plan. Use case: swap from patrol to combat immediately.",
  isTrigger: true,
  isInvertible: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}