import { withLogin } from "@/magic/withLogin"
import { depositGTAliPayChannel } from "@/action/apis"
import DepositTemplate from "@/components/DepositTemplate"
import { notificationAsync } from "@/magic/notification"
export default withLogin(() => {
  return (
    <DepositTemplate
      moneyList={[
        [100, 200, 300, 500],
        [600, 800, 1000, 2000],
      ]}
      type={25}
      depositApi={depositGTAliPayChannel}
      title="支付宝转银行卡"
      onExistsOrder={() => {}}
      errorHandler={(res) => {
        if (res.Data?.recommend_url) {
          location.href = res.Data.recommend_url
        } else if (res.Data?.url) {
          location.href = res.Data.url
        } else {
          return notificationAsync.alertAndReject(res.Message)
        }
      }}
    />
  )
})
