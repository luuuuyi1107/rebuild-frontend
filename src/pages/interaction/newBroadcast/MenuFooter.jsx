import classNames from "classnames"
import util from "@/magic/util"
import Badge from "@/components/Badge"
import item from "@/pages/site/selectBetRecord/item"
export default ({ menuList, selectedMenu, setSelectedMenu, setSubWork, onLogin, unreadTotalCount, newRequestFriendLength }) => {
  return (
    <div className={`bg-[#F9F9F9] grid grid-cols-${menuList.length}`}>
      {menuList.map((menuItem) => {
        const active = selectedMenu === menuItem.key
        const count = menuItem.key === "wechat" ? unreadTotalCount : menuItem.key === "address" ? newRequestFriendLength : 0
        return (
          <div
            className="py-[0.14rem] flex items-center flex-col relative"
            key={menuItem.key}
            onClick={() => {
              if (menuItem.key === "my" && !util.isLogin()) {
                onLogin()
                return
              }
              setSubWork("")
              setSelectedMenu(menuItem.key)
            }}
          >
            <div className="relative">
              <Badge count={count} className="rounded-full">
                {
                  active ? <menuItem.active /> : <menuItem.icon />
                }
                {/* <img className="w-[26px] h-[26px]" src={
                  menuItem.icon.endsWith(".svg")
                    ? util.buildAssetsPath(`assets/icons/${active ? menuItem.active : menuItem.icon}`)
                    : active ? menuItem.active : menuItem.icon

                } /> */}
              </Badge>
            </div>
            <div className={classNames({ "text-[#07C160]": active, "text-black": !active })}>{menuItem.label}</div>
          </div>
        )
      })}
    </div>
  )
}
