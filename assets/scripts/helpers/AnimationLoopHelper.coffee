
class AnimationLoopHelper

  constructor: ->

    @animationLoopId = null
    @delta           = 0
    @fps             = 0
    @lastTime        = 0

    return this

  start: ->

    @frame()

    return this

  stop: ->

    window.cancelAnimationFrame(@animationLoopId)

    return this

  frame: (now) ->

    @delta    = now - @lastTime
    @fps      = Math.round(1000 / @delta)
    @lastTime = now

    #fps(@fps)

    App.update(@delta)

    @animationLoopId = window.requestAnimationFrame (now) =>
      @frame(now)
      return

    return this
