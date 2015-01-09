
class BubbleClass

  destroying: false
  size:       1

  constructor: ->

    r = Utils.randomInteger(0, 200)
    g = Utils.randomInteger(0, 200)
    b = Utils.randomInteger(0, 200)
    a = Utils.random(0.75, 1)

    @color      = "rgba(#{r}, #{g}, #{b}, #{a})"
    @finalSize  = Utils.randomInteger(0, PlayState.sizeMax)
    @id         = Math.random().toString(36).substr(2, 5)
    @isTarget   = @determineTargetBubble()
    @position   =
      x: BubbleGenerator.bubblesOrigin.x
      y: BubbleGenerator.bubblesOrigin.y
    @velocity   =
      x: Utils.random(PlayState.velocityMin, PlayState.velocityMax)
      y: Utils.random(PlayState.velocityMin, PlayState.velocityMax)

    if @isTarget
      @color     = "rgba(#{r}, #{g}, #{b}, 0.8)"
      @finalSize = Utils.randomInteger(PlayState.minTargetSize, PlayState.sizeMax)

      @velocity.x *= PlayState.targetVelocityMultiplier
      @velocity.y *= PlayState.targetVelocityMultiplier

    return this

  determineTargetBubble: ->

    isTarget = false

    if BubbleGenerator.bubblesToTestForTaps.length < PlayState.maxTargetsAtOnce
      isTarget = Utils.randomPercentage() < PlayState.chanceBubbleIsTarget

    return isTarget

  draw: ->

    if @outsideCanvasBounds()
      BubbleGenerator.bubblesToDelete.push(@id)

      return

    if @isTarget
      @lineWidth = @size / 10

      if @lineWidth > Config.maxLineWidth
        @lineWidth = Config.maxLineWidth

      context.fillStyle = 'rgba(247, 247, 247, 0.9)'
      context.lineWidth = @lineWidth

    context.beginPath()
    context.arc(@position.x, @position.y, @half, 0, Math.PI * 2, true)
    context.fill()
    context.stroke() if @isTarget
    context.closePath()

    return this

  outsideCanvasBounds: ->

    beyondBoundsX = @position.x < -(@finalSize) or @position.x > canvas.width  + @finalSize
    beyondBoundsY = @position.y < -(@finalSize) or @position.y > canvas.height + @finalSize

    return beyondBoundsX or beyondBoundsY

  updateValues: ->

    if @destroying
      shrinkMultiplier = if PlayState.playing then 0.7 else 0.9

      @size *= shrinkMultiplier
    else
      if @size < @finalSize
        @size *= PlayState.bubbleGrowthMultiplier

      if @size > @finalSize
        @size = @finalSize

    @half = @size / 2

    @position.x += @velocity.x
    @position.y += @velocity.y

    @draw()

    return this

  wasTapped: (touchData) ->

    tapX      = touchData.pageX * devicePixelRatio
    tapY      = touchData.pageY * devicePixelRatio
    distanceX = tapX - @position.x
    distanceY = tapY - @position.y
    radius    = @half



    tapped = (distanceX * distanceX) + (distanceY * distanceY) < (@half * @half)

    if tapped
      Utils.console("Bubble##{@id} tapped at #{tapX}, #{tapY}")
    else
      Utils.console("Combo Broken!")

    return tapped
