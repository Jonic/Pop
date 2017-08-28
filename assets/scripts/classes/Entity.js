/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Entity {
  constructor() {
    this.animationLoop = App.getHelper('animationLoop')
    this.canvas = App.getHelper('canvas')
    this.config = App.getHelper('config')
    this.input = App.getHelper('input')
    this.device = App.getHelper('device')
    this.renderer = App.getHelper('renderer')

    this.context = this.canvas.context

    this.id = null
    this.parent = null
    this.removeOnCanvasExit = true

    this.height = 0
    this.width = 0

    this.position = {
      x: 0,
      y: 0,
    }

    this.velocity = {
      x: 0,
      y: 0,
    }

    return this
  }

  addSelfToRenderQueue() {
    this.renderer.enqueue(this)

    return this
  }

  canvasExitCallback() {
    return this
  }

  isInsideCanvasBounds() {
    return !this.isOutsideCanvasBounds()
  }

  isOutsideCanvasBounds() {
    const outsideLeft = this.position.x < -this.width
    const outsideRight =
      this.position.x - this.width > this.canvas.element.realWidth
    const outsideX = outsideLeft || outsideRight
    const outsideTop = this.position.y < -this.height
    const outsideBottom =
      this.position.y - this.height > this.canvas.element.realWheight
    const outsideY = outsideTop || outsideBottom

    return outsideX || outsideY
  }

  removeSelfFromParent() {
    if (this.parent != null) {
      this.parent.removeEntity(this.id)
    }

    return this
  }

  update() {
    if (this.isOutsideCanvasBounds()) {
      if (this.canvasExitCallback != null) {
        this.canvasExitCallback()
      }
      if (this.removeOnCanvasExit) {
        this.removeSelfFromParent()
      }
    }

    return this
  }
}
