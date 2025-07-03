const config = [
  {
    title: "球数玩法",
    list: [
      {
        name: "号码投注",
        router: ["pks", "bet"],
        lx: 1,
      },
      {
        name: "大小单双",
        router: ["pks", "bet"],
        lx: 2,
      },
      {
        name: "龙虎",
        router: ["pks", "bet"],
        lx: 4,
      },
    ],
  },
  {
    title: "冠亚军玩法",
    list: [
      {
        name: "冠亚和值",
        router: ["pks", "bet"],
        type: "1",
        lx: 10,
      },
      {
        name: "冠亚形态",
        router: ["pks", "bet"],
        type: "2",
        lx: 11,
      },
      {
        name: "冠亚双面",
        router: ["pks", "bet"],
        type: "3",
        lx: 5,
      },
    ],
  },
]
export default config
