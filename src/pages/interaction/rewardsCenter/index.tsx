import LayoutPage from "@/components/LayoutPage"
import { withLogin } from "@/magic/withLogin"
import util from "@/magic/util"
import { Icon } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"
import { getIsMonthlyEnable } from "../monthlyWater"
export default withRouter(
  withLogin((props) => {
    const entrs = [
      { name: "每日签到", icon: "ic_checkin.svg", desc: "每日签到, 奖励领不完！", path: "/site/signin" },
      { name: "红包中心", icon: "ic_redenvlop.svg", desc: "立即领取你的专属红包！", path: "/interaction/redPacketCenter" },
      { name: "月返提前领", icon: "ic_rebate.svg", desc: "查看本月返水, 提领无压力！", path: "/interaction/monthlyWater" },
      { name: "优惠码兑换", icon: "ic_coupon.svg", desc: "输入序号, 立即领好康！", path: "/interaction/coupon" },
    ]

    return (
      <LayoutPage center="优惠中心">
        <div className="px-[7px] pt-[7px]">
          {entrs.map((entr) => (
            <div
              key={entr.name}
              className="border-b-[1px] border-[#F1F1F1] border-solid border-[0px] flex items-center py-[11px] pl-[7px] pr-[16px]"
              onClick={() => {
                if (entr.name === "月返提前领" && !getIsMonthlyEnable()) {
                  return
                }

                props.router.push(entr.path)
              }}
            >
              <img className="ml-[4px] mr-[12px]" src={util.buildAssetsPath(`assets/icons/${entr.icon}`)} />
              <div className="flex-1">
                <div className="text-14px font-[400] text-[#333] leading-tight mb-[8px]">{entr.name}</div>
                <div className="text-12px font-[400] text-[#666666] leading-tight">{entr.desc}</div>
              </div>
              <Icon icon="ion-ios-arrow-forward" className="text-[18px] text-[#999]" />
            </div>
          ))}
        </div>
      </LayoutPage>
    )
  })
)
