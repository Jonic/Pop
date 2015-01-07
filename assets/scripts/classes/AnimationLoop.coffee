
class AnimationLoopClass

  constructor: ->

    @requestAnimationFrame()

    return this

  cancelAnimationFrame: ->

    window.cancelAnimationFrame(@animationLoopId)

    return this

  requestAnimationFrame: ->

    @animationLoopId = window.requestAnimationFrame =>

      @requestAnimationFrame()

      return

    canvas.width = canvas.width

    BubbleGenerator.animationLoopActions()

    return this
