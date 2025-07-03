import React, { useEffect, useRef } from "react"

const useVisibility = (onVisible, onVenish) => {
  const ref = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible && onVisible() // Call the parent callback when visible
        } else {
          onVenish && onVenish()
        }
      },
      { threshold: 1 } // Trigger when 10% of the element is visible
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [onVisible])

  return ref
}

// Visibility Component
export default ({ onVisible, onVenish }) => {
  const ref = useVisibility(onVisible, onVenish)

  return <div ref={ref} className="w-full h-0"></div>
}
