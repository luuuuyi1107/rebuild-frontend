/**
 * API 响应的标准接口
 * @template T 响应数据的类型
 */
interface ApiResponse<T = any> {
  Code: number // 响应状态码，0 表示成功，其他值表示错误
  Message?: string
  Data?: T // 响应数据，类型为 T
}

/**
 * API Promise 类型，表示一个返回 ApiResponse<T> 的 Promise
 * @template T 响应数据的类型
 */
type ApiPromise<T = any> = Promise<ApiResponse<T>>

/**
 * 月度返利数据接口
 */
interface iRebateData {
  AvailableRebate: number // 可获取的返利金额
  AppliedRebate: number // 已申请的返利金额
  RestOfRebate: number // 剩余的返利金额
}

/**
 * 返利记录接口
 */
interface iRebateRecord {
  Time: string
  AvailableRebate: number
  RebateAmount: number
}

// 定义返利数据接口
interface RealMonthWater {
  WaterMoney: number // 本月返利金额
  ApplyMonth: number // 已申请金额
  RemainMoney: number // 剩余可领金额
}

// 定义返利记录接口
interface UserMonthWaterApplyDetail {
  AddTime: string // 时间
  MonthCanGetMoney: number // 本月可领取返利
  ApplyMoney: number // 申请额度
  Status: number // 0:申请中,1:通过,2:拒绝,3:系统派发
}
