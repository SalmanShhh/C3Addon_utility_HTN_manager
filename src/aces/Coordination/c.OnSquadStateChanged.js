export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "On Squad State Changed",
  displayText: "On squad state changed",
  description: "Triggered when shared squad key-values change. Use case: react when tactic flips.",
  isTrigger: true,
  isInvertible: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}