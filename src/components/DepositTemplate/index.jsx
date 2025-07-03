import { reactive } from "@/magic/hook/vue"
import classNames from "classnames"
import { apiHandler } from "@/action"
import _ from "lodash"
import { notificationAsync } from "@/magic/notification"
import { withLogin } from "@/magic/withLogin"
import { cancelDeposit, getDepositList } from "@/action/apis"
import LayoutPage from "@/components/LayoutPage"
import styles from "./style.module.scss"

export default withLogin(
  ({
    type,
    depositApi,
    onSubmit,
    errorHandler,
    onExistsOrder,
    moneyList = [
      [10, 50, 100, 200],
      [500, 800, 1000, 2000],
    ],
    title,
  }) => {
    const data = reactive({
      info: {
        type,
      },
      req: { money: "", lastClick: "" },
    })
    const validate = () => {
      if (!_.isNumber(data.req.money)) {
        throw new Error("请输入存款金额")
      }
    }
    const submit = async () => {
      await checkOldOrder()
      try {
        validate()
        const res = await apiHandler(
          () =>
            depositApi({
              amount: data.req.money,
              returnurl: location.href + "?back=true",
            }),
          { errorHandler }
        )
        onSubmit ? onSubmit(res) : window.open(res.Data.url, "_self")
      } catch (e) {
        notificationAsync.alert(e.message)
      }
    }
    const checkOldOrder = async () => {
      const res = await apiHandler(() => getDepositList({ type: data.info.type }))
      const pendingOrders = res.Data.filter((x) => x.Status == 2)
      if (pendingOrders.length) {
        // still has order
        const [order] = pendingOrders
        // await Promise.all(pendingOrders.map((x) => cancelDeposit({ id: x.ID })))
        try {
          await notificationAsync.confirm(`您存在待支付订单［${order.Money}元］，请完成支付或取消重新下单`, {
            buttonLabels: ["取消订单", "前往支付"],
          })
        } catch (e) {
          await Promise.all(pendingOrders.map((x) => cancelDeposit({ id: x.ID })))
          throw new Error()
        }
        if (onExistsOrder) {
          onExistsOrder()
        } else {
          window.open(order.Account, "_self")
          throw new Error()
        }
      }
    }
    return (
      <LayoutPage right={null} className={styles["site-deposit"]} center={title}>
        <div className="money-section bg-white p-1 text-1.25">
          <div className="border-0 border-b border-solid border-b-gray-200 pb-0.5 flex leading-3">
            <div className="">充值金额</div>
            <div className="flex-1 px-1">
              <input
                placeholder="可自行填写充值金额"
                className="money-input border-0 w-full text-1.25"
                type="text"
                value={data.req.money}
                onChange={(e) => {
                  const result = e.target.value.replace(/\D/, "")
                  data.req.money = result && !isNaN(parseFloat(result)) ? parseFloat(result) : ""
                }}
              />
            </div>
            <div className="">元</div>
          </div>
          {moneyList.map((list, i) => (
            <div className="pt-1 flex flex-wrap justify-around" key={i}>
              {list.map((money, j) =>
                money ? <MoneyBtn key={`${i}_${j}`} data={data} money={money} /> : <div key={`${i}_${j}`} className="w-[20%]"></div>
              )}
            </div>
          ))}
        </div>
        <div className="submit-section p-1">
          <div className="tip text-1 text-[#E14138] px-0.5">
            <div>1.请先填写您需要的充值金额。</div>
            <div className="mt-0.25">2.提交后自动跳转到支付页面完成支付。</div>
          </div>
          <div className="submit text-1.25 mt-2">
            <a className="bg-theme w-full rounded-sm py-1 text-white block text-center" onClick={submit}>
              立即存款
            </a>
          </div>
        </div>
      </LayoutPage>
    )
  }
)

const MoneyBtn = ({ data, money }) => (
  <div
    className={classNames("money-btn", {
      active: data.req.lastClick == money,
    })}
    onClick={() => {
      data.req.money = data.req.lastClick = money
    }}
  >
    {money}元
  </div>
)
