class Entity

  constructor: ->

    @animationLoop = App.getHelper('animationLoop')
    @canvas        = App.getHelper('canvas')
    @config        = App.getHelper('config')
    @input         = App.getHelper('input')
    @device        = App.getHelper('device')
    @renderer      = App.getHelper('renderer')

    @context = @canvas.context

    @id                 = null
    @parent             = null
    @removeOnCanvasExit = true

    @height = 0
    @width  = 0

    @position = {
      x: 0
      y: 0
    }

    @velocity = {
      x: 0
      y: 0
    }

    return this

  addSelfToRenderQueue: ->

    @renderer.enqueue(this)

    return this

  canvasExitCallback: ->

    return this

  isInsideCanvasBounds: ->

    return !@isOutsideCanvasBounds()

  isOutsideCanvasBounds: ->

    outsideLeft   = @position.x < -@width
    outsideRight  = @position.x - @width > @canvas.element.realWidth
    outsideX      = outsideLeft || outsideRight
    outsideTop    = @position.y < -@height
    outsideBottom = @position.y - @height > @canvas.element.realWheight
    outsideY      = outsideTop || outsideBottom

    return outsideX || outsideY

  removeSelfFromParent: ->

    @parent.removeEntity(@id) if @parent?

    return this

  update: ->

    if @isOutsideCanvasBounds()
      @canvasExitCallback()   if @canvasExitCallback?
      @removeSelfFromParent() if @removeOnCanvasExit

    return this
