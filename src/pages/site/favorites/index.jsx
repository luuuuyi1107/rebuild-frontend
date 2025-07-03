import { useState, useEffect, useRef } from "react"
import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"
import tabs from "@/pages/site/home/gameConfig"
import { withLogin } from "@/magic/withLogin"
import { withRouter } from "@/magic/withRouter"
import _ from "lodash"
import FavoriteButton from "@/components/FavoriteButton"
import "@/pages/site/home/gameIcon.scss"

//
export default withLogin(
  withRouter((props) => {
    const originalFavoriteGames = util.cache.get(util.getUserId() + "_favoriteGames") ?? []
    const [favoriteGames, setFavoriteGames] = useState(originalFavoriteGames)
    const favoritRef = useRef(originalFavoriteGames)
    const gameObject = _(tabs)
      .flatMap((tab) => tab.list)
      .keyBy("id")
      .value()

    useEffect(() => {
      return () => {
        if (favoritRef.current.length === 0) {
          util.cache.remove(util.getUserId() + "_favoriteGames")
          return
        }

        util.cache.set(util.getUserId() + "_favoriteGames", favoritRef.current)
      }
    }, [])

    function toggleFavorite(gameId) {
      const newFavoriteGames = favoriteGames.includes(gameId) ? favoriteGames.filter((id) => id !== gameId) : [...favoriteGames, gameId]
      setFavoriteGames(newFavoriteGames)
      favoritRef.current = newFavoriteGames
    }

    function getGameDetail(game) {
      props.router.push(game.link, { ...game.params, fromFavorites: true })
    }

    return (
      <LayoutPage center="我的收藏" right={null}>
        <div className="bg-gray-100 h-full">
          {originalFavoriteGames.length === 0 ? (
            <div className="text-center leading-5 text-gray-500">暂无收藏游戏</div>
          ) : (
            <div className="grid grid-cols-2 bg-white">
              {originalFavoriteGames.map((gameId) => {
                const game = gameObject[gameId]
                return (
                  <div
                    key={gameId}
                    onClick={() => getGameDetail(game)}
                    className="flex items-center border-gray-100 p-1 border-x-0 border-t-0 border-b-[1px] border-solid relative"
                  >
                    <i className={`game-icon ${game.id}-icon !w-[45px] !h-[45px] mr-1`} />
                    <div className="flex-1">
                      <div>{game.name}</div>
                      <div>{game.text}</div>
                    </div>
                    <FavoriteButton onClick={() => toggleFavorite(game.id)} active={favoriteGames.includes(game.id)} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </LayoutPage>
    )
  })
)
