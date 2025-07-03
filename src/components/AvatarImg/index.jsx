import React from "react"
import { Icon } from "react-onsenui"
import "./style.scss"
import { getAvatar } from "@/action/apis"
import { computed, onMounted, reactive } from "@/magic/hook/vue"
import classNames from "classnames"
export default ({ UID, avatarLink, shape = "square", width, height, icSize, className, onClick = () => {} }) => {
  const initData = reactive({
    datas: [],
  })
  const avatar = computed(() => initData.datas[+UID % initData.datas.length])
  const showPersonImg = computed(() => avatar || avatarLink)
  const boxSize = computed(() => ({
    height: (height || width) + 5,
    width,
    paddingTop: 5,
  }))
  onMounted(async () => {
    if (!avatarLink && UID) {
      const res = await getAvatar()
      initData.datas = res.Data || []
    }
  })
  return (
    <div
      className={classNames(`avatar ${shape}`, className)}
      style={{
        ...boxSize,
        lineHeight: "100%",
        fontSize: showPersonImg ? 0 : height,
      }}
      onClick={onClick}
    >
      {avatarLink ? (
        <img style={{ width: "100%", height: height }} src={avatarLink} />
      ) : avatar?.FilePath ? (
        <img style={{ width: "100%", height: height }} src={avatar.FilePath} />
      ) : (
        <Icon
          style={{
            fontSize: icSize || width || ".8rem",
          }}
          icon="ion-person"
        />
      )}
    </div>
  )
}
