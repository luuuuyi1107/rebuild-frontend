import React from "react"
import { Icon } from "react-onsenui"
import { sortBy } from "lodash"
import lottoView from "./lottoView" /**彩票**/
import cardView from "./cardView" /**棋牌**/
import slotView from "./slotView" /**电子**/
import casinoView from "./casinoView" /**视讯/体育**/
import sportView from "./sportView" /**体育**/

/**热门**/
let config = [
  // {
  //   title: "热门",
  //   id: "hot",
  //   icon: <Icon icon="ion-fireball" />,
  //   list: [],
  // },
  {
    title: "彩票",
    id: "lottory",
    icon: <i className="lottory-icon">8</i>,
    list: lottoView,
  },
  {
    title: "真人",
    id: "casino",
    icon: <Icon icon="ion-ios-videocam" />,
    list: casinoView,
  },
  {
    title: "棋牌",
    id: "card-game",
    icon: <Icon icon="ion-heart" />,
    list: cardView,
  },
  {
    title: "电子",
    id: "slot",
    icon: <Icon icon="ion-ios-game-controller-b" />,
    list: slotView,
  },
  {
    title: "体育",
    id: "sport",
    icon: <Icon icon="ion-ios-football" />,
    list: sportView,
  },
]

export default config
