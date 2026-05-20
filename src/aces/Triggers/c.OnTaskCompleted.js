export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "On Task Completed",
  displayText: "On task completed",
  description: "Triggered after task completion is reported. Use case: chain to the next animation state.",
  isTrigger: true,
  isInvertible: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}