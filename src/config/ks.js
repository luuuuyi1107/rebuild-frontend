const config = [
  {
    title: "球数玩法",
    list: [
      {
        name: "号码投注",
        router: ["ks", "bet"],
        lx: 16,
      },
      {
        name: "大小单双",
        router: ["ks", "bet"],
        lx: 17,
      },
    ],
  },
  {
    title: "形态玩法",
    list: [
      {
        name: "号码形态",
        router: ["ks", "bet"],
        lx: 4,
      },
      {
        name: "总和值",
        router: ["ks", "bet"],
        lx: 1,
      },
      {
        name: "总和双面",
        router: ["ks", "bet"],
        lx: 2,
      },
    ],
  },
  {
    title: "任选玩法",
    list: [
      {
        name: "对子直选",
        router: ["ks", "bet"],
        type: "1",
        lx: 6,
      },
      {
        name: "豹子多选",
        router: ["ks", "bet"],
        type: "3",
        lx: 10,
      },
      {
        name: "对子单选",
        router: ["ks", "bet"],
        lx: 12,
      },
      {
        name: "对子复选",
        router: ["ks", "bet"],
        type: "2",
        lx: 13,
      },
      {
        name: "二不同号",
        router: ["ks", "bet"],
        lx: 14,
      },
      {
        name: "三不同号",
        router: ["ks", "bet"],
        lx: 15,
      },
    ],
  },
]
export default config
