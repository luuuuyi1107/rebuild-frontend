import { useReactive } from "@reactivedata/react"
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import { signal, effect, computed as preactComputed } from "@preact/signals-core"

export const onMounted = (fn) => {
  useEffect(() => {
    fn()
  }, [])
}
export const onUnmounted = (fn) => {
  useEffect(() => {
    return () => {
      fn()
    }
  }, [])
}

export const ref = (initValue) => {
  const valueRef = useRef(initValue)
  const versionRef = useRef(0)
  function createStore(signal) {
    let onChangeNotifyReact
    const unsubscribe = effect(() => {
      valueRef.current = signal.value
      versionRef.current++
      onChangeNotifyReact?.()
    })
    return {
      subscribe(listener) {
        onChangeNotifyReact = listener
        return () => {
          unsubscribe()
        }
      },
      getSnapshop() {
        return versionRef.current
      },
    }
  }
  const res = signal(valueRef.current)
  const store = useMemo(() => {
    return createStore(res)
  }, [res])
  useSyncExternalStore(store.subscribe, store.getSnapshop)
  return res
  // const _value = useRef(initValue)
  // const [ref, setRef] = useState({ value: initValue })
  // Object.defineProperty(ref, "value", {
  //   get() {
  //     return _value.current
  //   },
  //   set(newValue) {
  //     _value.current = newValue
  //     setRef({ value: newValue })
  //   },
  // })
  // return ref
}
export const reactive = useReactive
export const computed = (computeFn) => {
  const res = preactComputed(computeFn)
  function createStore(res) {
    let onChangeNotifyReact
    const unsubscribe = effect(() => {
      res.value
      onChangeNotifyReact?.()
    })
    return {
      subscribe(listener) {
        onChangeNotifyReact = listener
        return () => {
          unsubscribe()
        }
      },
      getSnapshop() {
        return res.value
      },
    }
  }
  const store = useMemo(() => {
    return createStore(res)
  }, [res])
  useSyncExternalStore(store.subscribe, store.getSnapshop)
  return res.value
}

export const watch = (sSatcher, fn) => {
  const watcher = typeof sSatcher === "object" ? sSatcher : [sSatcher]
  const value = useMemo(
    () =>
      watcher.map((x) => {
        return typeof x == "function" ? x() : x
      }),
    [watcher]
  )
  const ref = useRef(value)
  if (value.toString() !== ref.current.toString()) {
    ref.current = value
  }
  useEffect(fn, ref.current)
}

export { effect }
