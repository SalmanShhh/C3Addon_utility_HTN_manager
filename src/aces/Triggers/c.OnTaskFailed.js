export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "On Task Failed",
  displayText: "On task failed",
  description: "Triggered when a task fails. Use case: run a fallback task or recovery behavior.",
  isTrigger: true,
  isInvertible: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}