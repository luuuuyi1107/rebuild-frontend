class Bus {
  static instance
  callbacks

  static getInstance() {
    if (!this.instance) {
      this.instance = new Bus()
    }
    return this.instance
  }

  constructor() {
    this.callbacks = {}
  }

  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(callback)
  }

  emit(event, data) {
    const handlers = this.callbacks[event]
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }

  off(event, callback) {
    const handlers = this.callbacks[event]
    if (handlers) {
      const index = handlers.indexOf(callback)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    }
    // console.log(this.callbacks[event])
  }
}

export default Bus.getInstance()
