import Modal from "react-modal"
import classNames from "classnames"
import React, { useEffect, useMemo, useState, createContext, useContext } from "react"
import "./style.scss"
import Bus from "@/magic/EventBus"
import ClipLoader from "react-spinners/ClipLoader"

const ModalContext = createContext()

export const withModalContext = (Component) => {
  return React.forwardRef((props, ref) => {
    const inModal = useContext(ModalContext)
    return <Component ref={ref} inModal={inModal} {...props} />
  })
}

/**
 * onClose, onShow use when emit by bus event
 */
export default ({
  name = "",
  children,
  isOpen = false,
  className = "",
  animation = "fade",
  animationTime = 300,
  onClose = () => {},
  onShow = () => {},
  shouldCloseOnOverlayClick = false,
  scrollable = true,
  loading = false,
}) => {
  Modal.setAppElement("#root")
  const [isInit, setIsInit] = useState(true)
  const [myIsOpen, setOpen] = useState(isOpen)
  const [isActive, setActive] = useState(false)
  const ANIMATION_TIME = animationTime
  const INIT_WAIT_TIME = 1000
  const UNINIT_DELAY_TIME = 300
  const showModal = () => {
    onShow?.()
    setOpen(true)
  }
  const closeModal = () => {
    setActive(false)
    setTimeout(() => {
      onClose?.()
      setOpen(false)
    }, ANIMATION_TIME)
  }
  useEffect(() => {
    setTimeout(() => {
      setIsInit(false)
    }, INIT_WAIT_TIME)
    if (name) {
      Bus.on(`${name}.show`, showModal)
      Bus.on(`${name}.close`, closeModal)
    }
    Bus.on(`modal.close`, closeModal)
    return () => {
      if (name) {
        Bus.off(`${name}.show`)
        Bus.off(`${name}.close`)
      }
      Bus.off(`modal.close`)
    }
  }, [])
  useEffect(() => {
    if (isOpen) {
      if (isInit) {
        setTimeout(showModal, UNINIT_DELAY_TIME)
      } else {
        showModal()
      }
    } else {
      closeModal()
    }
  }, [isOpen])

  const maskTransparent = useMemo(() => animation == "lift", [animation])
  return (
    <ModalContext.Provider value={true}>
      <Modal
        className={classNames("Modal", className, `animate_${animation}`, { active: isActive, in_active: !isActive, scrollable })}
        isOpen={myIsOpen}
        onAfterOpen={() => setActive(true)}
        overlayClassName={classNames("Mask", { transparent: maskTransparent })}
        onRequestClose={() => {
          closeModal()
        }}
        shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      >
        {loading && (
          <div className="fixed w-full h-full top-0 left-0 loading-mask flex justify-center items-center" style={{ backgroundColor: "#00000066" }}>
            <ClipLoader color="#fff" size={30} loading={loading} />
          </div>
        )}
        {children}
      </Modal>
    </ModalContext.Provider>
  )
}

export const CloseBtn = ({ onClick }) => {
  return (
    <span
      className="absolute -top-0.5 -right-0.5 rounded-full bg-[#ffffffb6] w-1.5 h-1.5 text-[#52463A] flex items-center justify-center"
      onClick={onClick}
    >
      x
    </span>
  )
}
