import { sortBy } from "lodash"
import util from "@/magic/util"
import AvatarIcon from "@/components/AvatarIcon"
export default () => {
  const groupImgs = [
    ...new Array(6).fill(1).map((value, index) => `girl0${index + 1}`),
    ...new Array(4).fill(1).map((value, index) => `boy0${index + 1}`),
  ].map((img) => `https://76shangchuan.com/touxiang/${img}.png`)

  const users = ["Rachel888", "六合大神888", "会员898033", "8033", "仙女下凡", "小仙女", "Ray666", "酷妹946", "Alice", "Billy", "Jacky"].map(
    (NickName) => ({ NickName, Avatar: groupImgs[Math.floor(groupImgs.length * Math.random())], bounce: Math.floor(Math.random() * 100000000) })
  )
  const sortedUsers = sortBy(users, "bounce")

  return (
    <div className="px-1">
      {sortedUsers.map((user, index) => (
        <div key={user.NickName + "_" + index} className="flex items-center text-black py-0.75">
          <div className="w-5 text-[28px] font-[500] text-[#737373] flex items-center justify-center">
            {index < 3 ? <img className="w-3.5" src={util.buildAssetsPath(`/images/Broadcast/trophy${index + 1}.png`)} alt={index + 1} /> : index + 1}
          </div>
          <AvatarIcon className="w-[42px] mr-1 rounded-[5px]" src={user.Avatar} />
          <div className="flex-1 text-left">
            <div className="text-[16px]">{user.NickName}</div>
            <div>
              盈利金额: <span className="text-[#07C160]">{user.bounce}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
