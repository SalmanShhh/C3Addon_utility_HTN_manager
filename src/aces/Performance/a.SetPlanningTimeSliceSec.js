export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Performance: Set Planning Time Slice",
  displayText: "Set planning time slice to {0} seconds",
  description: "Sets max planning time allowed per update in seconds. Beginner tip: start at 0 (off), then try 0.001-0.003 if big AI spikes cause frame drops.",
  params: [
    {
      id: "seconds",
      name: "Seconds",
      desc: "0 disables time slicing; higher values allow more planning work each update.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (seconds) {
  this._setPlanningTimeSliceSec(seconds);
}