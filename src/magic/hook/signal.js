const observers = []

const getCurrentObserver = () => {
  return observers[observers.length - 1]
}

export const signal = (value) => {
  const subscribers = new Set()
  // 获取 Signal value
  const getter = () => {
    // 获取此次 Signal getter 调用时的 Observer
    const currentObserver = getCurrentObserver()
    if (currentObserver) {
      // 如果此次 Signal getter 调用时的 Observer 存在
      // 则将其存储至当前 Signal 的 subscribers
      // 订阅当前 Signal 的变化
      subscribers.add(currentObserver)
    }
    return value
  }
  // 修改 Signal value
  const setter = (newValue) => {
    if (value !== newValue) {
      value = newValue
      // 将所有订阅了当前 Signal 变化的 Observer 一次性都取出来并执行
      subscribers.forEach((subscriber) => subscriber())
    }
  }
  return [getter, setter]
}

export const effect = (effectFn) => {
  const execute = () => {
    // 无论是否在副作用函数中调用了 Signal getter
    // 先假设副作用函数为某个 Signal 的 Observer
    // 将其存储至 observers 中
    observers.push(execute)
    try {
      // 执行副作用函数
      // 若副作用函数确实为某个 Signal 的 Observer（即副作用函数中调用了 Signal getter）
      // 则在 Signal getter 中会将 execute 存储至内部的 subscribers 中
      // 否则不执行任何操作
      effectFn()
    } finally {
      // 删除副作用函数
      observers.pop()
    }
  }
  // 副作用函数立即执行
  execute()
}

export const memo = (memo) => {
  const [_value, _setValue] = signal()

  effect(() => {
    _setValue(memo())
  })

  return _value
}
