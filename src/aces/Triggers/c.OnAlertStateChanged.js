export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "On Alert State Changed",
  displayText: "On alert state changed",
  description: "Triggered when alert tier changes. Use case: change music or UI for suspicion/combat states.",
  isTrigger: true,
  isInvertible: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}