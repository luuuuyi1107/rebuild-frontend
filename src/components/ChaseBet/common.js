import _ from "lodash"
export const num2Ch = _.zipObject(
  new Array(10).fill(0).map((v, i) => v + i),
  ["○", "一", "二", "三", "四", "五", "六", "七", "八", "九"]
)
