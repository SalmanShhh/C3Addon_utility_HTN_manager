export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Performance: Set Planning Mode",
  displayText: "Set planning mode to {0}",
  description: "Switches how often planning runs. Beginner tip: use Per frame while learning, then switch to Interval if frame rate drops with many agents.",
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "Per frame updates every tick; interval uses seconds.",
      type: "combo",
      initialValue: "per_frame",
      items: [
        { per_frame: "Per frame" },
        { interval_sec: "Interval (seconds)" },
      ],
    },
  ],
};

export const expose = true;

export default function (mode) {
  this._setPlanningMode(mode);
}