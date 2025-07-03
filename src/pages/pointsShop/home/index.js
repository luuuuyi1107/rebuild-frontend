import React, { useEffect, useState } from "react"
import LayoutPage from "@/components/LayoutPage"

import { getShopClass, getShopItemList, getShopSet } from "@/action/apis"
import "./style.scss"
import util from "@/magic/util"
import ShopItems from "@/components/ShopItems"
import { Icon } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"

export default withRouter((props) => {
  const [items, setItems] = useState([])
  const [unClassifyItems, setUnClassifyItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [banner, setBanner] = useState(util.cache.get("pointsBanner") || "")

  useEffect(() => {
    getShopSet().then((res) => {
      if (res.Code !== 1) return
      util.cache.set("pointsBanner", res.Data.Logos)
      setBanner(res.Data.Logos)
    })

    getShopClass()
      .then((res) => {
        if (res.Code !== 1) return
        const _listImgs = {}
        const _items = res.Data.map((item) => {
          const [entrImg, listImg] = item.Logo.split("|")
          _listImgs[item.ID + ""] = listImg
          return { ...item, entrImg, listImg }
        })
        setItems(_items)
        util.cache.set("classImgs", _listImgs)
      })
      .finally(() => {
        setLoading(false)
      })

    getShopItemList(0).then((res) => {
      if (res.Code !== 1) return
      setUnClassifyItems(res.Data)
    })
  }, [])

  function itemClickEvent(id) {
    props.router.push(`/pointsShop/list?id=${id}`)
  }

  function getItemDetail(itemId) {
    props.router.push(`/pointsShop/detail?id=0&itemId=${itemId}`)
  }

  return (
    <LayoutPage loading={loading} center="积分商城" className="shop-classes" right={null}>
      {!!banner && (
        <div className="shop-banner">
          <img src={banner} />
        </div>
      )}

      <div className="classes">
        {items.map((item) => (
          <div
            className="item"
            key={item.ID}
            onClick={() => {
              itemClickEvent(item.ID)
            }}
          >
            <img className="classimg" src={item.entrImg} />
            <div className="title">{item.Name}</div>
          </div>
        ))}
      </div>

      {unClassifyItems.length > 0 && (
        <div className="classes-gap-line">
          <div className="line" />
          <div className="middle">
            <Icon icon="ion-heart" />
            猜你喜欢
            <Icon icon="ion-heart" />
          </div>
          <div className="line" />
        </div>
      )}

      {unClassifyItems.length > 0 && <ShopItems items={unClassifyItems} clickEvent={getItemDetail} />}
    </LayoutPage>
  )
})
