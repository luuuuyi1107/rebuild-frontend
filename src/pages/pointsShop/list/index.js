import React, { useEffect, useState } from "react"
import LayoutPage from "@/components/LayoutPage"

import { getShopItemList } from "@/action/apis"
import "./style.scss"
import util from "@/magic/util"
import EmptyView from "@/components/EmptyView"
import ShopItems from "@/components/ShopItems"
import { withRouter } from "@/magic/withRouter"

export default withRouter((props) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const id = util.getUrlParam("id")
  const classImgs = util.cache.get("classImgs")
  const classImg = classImgs[id]
  useEffect(() => {
    getShopItemList(id).then((res) => {
      if (res.Code !== 1) return
      setItems(res.Data)
    })
  }, [])

  function getItemDetail(itemId) {
    props.router.push(`/pointsShop/detail?id=${id}&itemId=${itemId}`)
  }

  function removeHtmlTags(htmlString) {
    // Create a new element and set the HTML content
    const tempElement = document.createElement("div")
    tempElement.innerHTML = htmlString

    // Extract the inner text
    const cleanedString = tempElement.textContent || tempElement.innerText

    // Remove the temporary element from the document
    tempElement.remove()

    return cleanedString
  }

  return (
    <LayoutPage
      onBack={() => {
        props.router.push("/pointsShop/home")
      }}
      loading={loading}
      center="积分商城-列表"
      className="points-list-frame"
      right={null}
    >
      {!!classImg ? (
        <div className="class-image">
          <img src={classImg} />
        </div>
      ) : (
        <div style={{ height: "15px" }} />
      )}

      <div className="shop-list">
        {items.length === 0 ? <EmptyView imgId={3} desc={"NO ITEMS"} /> : <ShopItems clickEvent={getItemDetail} items={items} />}
      </div>
    </LayoutPage>
  )
})
