class Bus {
  static instance
  callbacks

  static getInstance() {
    if (!this.instance) {
      this.instance = new Bus()
      return this.instance
    }
    return this.instance
  }

  constructor() {
    this.callbacks = {}
  }

  on(event, callback) {
    const wrappedCallback = (e) => {
      callback(e.detail)
    }
    this.callbacks[event] = { original: callback, wrapped: wrappedCallback }
    document.addEventListener(event, wrappedCallback)
  }

  emit(event, detail) {
    document.dispatchEvent(new CustomEvent(event, { detail }))
  }

  off(event) {
    if (this.callbacks[event]) {
      document.removeEventListener(event, this.callbacks[event].wrapped)
      delete this.callbacks[event]
    }
  }
}

export default Bus.getInstance()
