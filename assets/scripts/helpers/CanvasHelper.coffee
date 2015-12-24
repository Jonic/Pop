class CanvasHelper

  load: ->

    @device = App.getHelper('device')
    @input  = App.getHelper('input')

    @elementSelector = '.canvas'

    @createCanvas()

    return this

  clear: ->

    #@element.width = @element.width
    @context.clearRect(0, 0, @element.width, @element.height)

    return this

  createCanvas: ->

    @element        = document.querySelector(@elementSelector)
    @element.height = @device.screen.height
    @element.width  = @device.screen.width

    @element.realHeight = @element.height
    @element.realWidth  = @element.width

    @context = @element.getContext('2d')

    @context.globalCompositeOperation = 'destination-atop'

    @scaleCanvas()

    @input.addCanvasTapEventListener(@elementSelector)

    return this

  scaleCanvas: ->

    backingStoreRatio = @context.webkitBackingStorePixelRatio || @context.backingStorePixelRatio || 1

    if @device.pixelRatio != backingStoreRatio
      ratio     = @device.pixelRatio / backingStoreRatio
      oldWidth  = @element.width
      oldHeight = @element.height

      @element.width  = oldWidth  * ratio
      @element.height = oldHeight * ratio

      @element.style.width  = "#{oldWidth}px"
      @element.style.height = "#{oldHeight}px"

      @context.scale(ratio, ratio)

    return this
