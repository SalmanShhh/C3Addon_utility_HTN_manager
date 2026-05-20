export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "On Task Network Registered",
  displayText: "On task network registered",
  description: "Triggered after a network loads. Use case: print setup success in debug events.",
  isTrigger: true,
  isInvertible: false,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}