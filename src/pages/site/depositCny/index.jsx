import { withLogin } from "@/magic/withLogin"
import { depositCny } from "@/action/apis"
import DepositTemplate from "@/components/DepositTemplate"
export default withLogin(() => {
  // cny deposit type 19
  return <DepositTemplate type={19} depositApi={depositCny} title="数字人民币充值" />
})
