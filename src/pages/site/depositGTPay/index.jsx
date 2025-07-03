import { withLogin } from "@/magic/withLogin"
import { depositGTPay } from "@/action/apis"
import DepositTemplate from "@/components/DepositTemplate"
import { notificationAsync } from "@/magic/notification"
export default withLogin(() => {
  return (
    <DepositTemplate
      type={24}
      depositApi={depositGTPay}
      title="U盈收银台"
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
