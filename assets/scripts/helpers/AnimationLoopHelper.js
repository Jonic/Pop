/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class AnimationLoopHelper {
  load() {
    this.animationLoopId = null
    this.delta = 0
    this.fps = 0
    this.lastTime = 0

    return this
  }

  correctValue(value) {
    return value * this.delta * (60 / 1000)
  }

  frame(now) {
    this.delta = now - this.lastTime
    this.fps = Math.round(1000 / this.delta)
    this.lastTime = now

    fps(this.fps)

    App.update(this.delta)

    return (this.animationLoopId = window.requestAnimationFrame(now => {
      this.frame(now)
      return

      return this
    }))
  }

  start() {
    this.frame()

    return this
  }

  stop() {
    window.cancelAnimationFrame(this.animationLoopId)

    return this
  }
}
