export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "On Plan Failed",
  displayText: "On plan failed",
  description: "Triggered when no valid plan is found. Use case: force an idle or safe fallback action.",
  isTrigger: true,
  isInvertible: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}