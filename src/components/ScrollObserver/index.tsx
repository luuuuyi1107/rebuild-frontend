import React, { useState, useRef, useEffect, ReactNode } from "react"

// 定义组件接收的 props 类型
interface ScrollObserverProps<T> {
  children: ReactNode
  fetchData: (page: number, pageSize: number) => Promise<{ Data?: T[]; Code?: number; Message?: string }>
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  setLoading?: (loading: boolean) => void
  pageSize?: number
}

// 使用泛型来适应不同类型的数据项
function ScrollObserver<T>(props: ScrollObserverProps<T>) {
  const [page, setPage] = useState<number>(1)
  const pageSize = props.pageSize ?? 15
  const hasMore = useRef<boolean>(true)
  const lastElementRef = useRef<HTMLDivElement>(null)

  // 在 useEffect 内部创建 observer，避免在组件每次渲染时都创建新实例
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore.current) {
        setPage((prev) => prev + 1)
      }
    })

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current)
    }

    return () => {
      if (lastElementRef.current) {
        observer.unobserve(lastElementRef.current)
      }
    }
  }, [])

  useEffect(() => {
    hasMore.current = false
    props.setLoading?.(true)

    props
      .fetchData(page, pageSize)
      .then((res) => {
        if (res?.Data && Array.isArray(res.Data)) {
          hasMore.current = res.Data.length >= pageSize
          props.setItems((prev) => [...prev, ...(res.Data as T[])])
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
      })
      .finally(() => {
        props.setLoading?.(false)
      })
  }, [page, pageSize])

  return (
    <>
      {props.children}
      <div ref={lastElementRef} style={{ height: "1px" }} />
    </>
  )
}

export default ScrollObserver
