import { withLogin } from "@/magic/withLogin"
import { depositGTHuiPay } from "@/action/apis"
import DepositTemplate from "@/components/DepositTemplate"
import { notificationAsync } from "@/magic/notification"
export default withLogin(() => {
  return (
    <DepositTemplate
      type={26}
      depositApi={depositGTHuiPay}
      title="U惠收银台"
      errorHandler={(res) => {
        if (res.Data?.recommend_url) {
          location.href = res.Data.recommend_url
        } else {
          return notificationAsync.alertAndReject(res.Message)
        }
      }}
    />
  )
})
