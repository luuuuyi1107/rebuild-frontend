import React from "react"
import util from "@/magic/util"
import FavoriteButton from "@/components/FavoriteButton"
import { withRouter } from "@/magic/withRouter"

export default withRouter((props) => {
  const items = (
    props.type === "热门彩"
      ? props.lotteries.filter((game) => game.hot)
      : props.lotteries.filter((game) => game.lotterySecond[0] === props.type)
  ).slice()

  if (props.type === "热门彩") {
    items.sort(function (a, b) {
      return a.hot - b.hot
    })
  } else {
    items.sort(function (a, b) {
      return a.lotterySecond[1] - b.lotterySecond[1]
    })
  }

  return items.map((game, i, arr) => (
    <div className="col relative" key={game.id + game.allOrder}>
      <div
        className={`game-item ${game.id}`}
        onClick={() => {
          props.router.push(game.link, game.params)
        }}
      >
        <div className="box l-box">
          <i className={`game-icon ${game.id}-icon`} />
        </div>
        <div className="box r-box">
          <p>{game.name}</p>
          <p>{game.text}</p>
        </div>
        {!!util.isLogin() && <FavoriteButton onClick={props.addToFavorities.bind(this, game.id)} active={props.favoriteGames.includes(game.id)} />}
      </div>
    </div>
  ))
})
