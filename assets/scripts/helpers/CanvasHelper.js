class CanvasHelper {
  load() {
    this.device = App.getHelper('device')
    this.input = App.getHelper('input')

    this.elementSelector = '.canvas'

    this.createCanvas()

    return this
  }

  clear() {
    // @element.width = @element.width
    this.context.clearRect(0, 0, this.element.width, this.element.height)

    return this
  }

  createCanvas() {
    this.element = document.querySelector(this.elementSelector)
    this.element.height = this.device.screen.height
    this.element.width = this.device.screen.width

    this.element.realHeight = this.element.height
    this.element.realWidth = this.element.width

    this.context = this.element.getContext('2d')

    this.context.globalCompositeOperation = 'destination-atop'

    this.scaleCanvas()

    this.input.addCanvasTapEventListener(this.elementSelector)

    return this
  }

  scaleCanvas() {
    const backingStoreRatio =
      this.context.webkitBackingStorePixelRatio ||
      this.context.backingStorePixelRatio ||
      1

    if (this.device.pixelRatio !== backingStoreRatio) {
      const ratio = this.device.pixelRatio / backingStoreRatio
      const oldWidth = this.element.width
      const oldHeight = this.element.height

      this.element.width = oldWidth * ratio
      this.element.height = oldHeight * ratio

      this.element.style.width = `${oldWidth}px`
      this.element.style.height = `${oldHeight}px`

      this.context.scale(ratio, ratio)
    }

    return this
  }
}
