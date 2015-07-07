
class BubbleEntity extends Entity

  constructor: (parent, configValues) ->

    super

    @parent       = parent
    @configValues = configValues

    @height   = 0
    @id       = "bubble_" + Math.random().toString(36).substr(2, 5)
    @position =
      x: @device.screen.width  / 2
      y: @device.screen.height / 2
    @velocity =
      x: random(@configValues.velocityMin, @configValues.velocityMax)
      y: random(@configValues.velocityMin, @configValues.velocityMax)
    @width    = 0

    @alpha            = 0.75
    @color            = randomColor()
    @destroying       = false
    @diameter         = 1
    @fillColor        = @color
    @strokeColor      = @color
    @finalDiameter    = randomInteger(0, configValues.diameterMax)
    @isTarget         = @determineTargetBubble()
    @radius           = 0.5
    @shrinkMultiplier = 0.9

    if @isTarget
      @alpha         = 0.9
      @fillColor     = "240, 240, 240"
      @finalDiameter = randomInteger(@configValues.minTargetDiameter, @configValues.diameterMax)
      @lineWidth     = @diameter / 10

      @velocity.x *= @configValues.targetVelocityMultiplier
      @velocity.y *= @configValues.targetVelocityMultiplier

    return this

  canvasExitCallback: ->

    super

    @parent.gameOver() if @isTarget

    return this

  determineTargetBubble: ->

    if @configValues.targetBubblesCount < @configValues.maxTargetsAtOnce
      return randomPercentage() < @configValues.chanceBubbleIsTarget

    return false

  render: ->

    @context.lineWidth   = @lineWidth
    @context.fillStyle   = rgba(@fillColor,   @alpha)
    @context.strokeStyle = rgba(@strokeColor, @alpha)

    @context.beginPath()
    @context.arc(@position.x, @position.y, @radius, 0, Math.PI * 2, true)
    @context.fill()
    @context.stroke() if @isTarget
    @context.closePath()

    return this

  update: ->

    super

    if @destroying
      @diameter *= (if @parent.playing then 0.6 else @shrinkMultiplier)

      @removeSelfFromParent() if @diameter < 1
    else
      @diameter *= @configValues.bubbleGrowthMultiplier if @diameter < @finalDiameter

    @diameter  = clamp(@diameter, 0, @finalDiameter)
    @lineWidth = clamp(@diameter / 10, 0, @configValues.maxLineWidth) if @isTarget

    @height = @diameter
    @width  = @diameter
    @radius = @diameter / 2

    @position.x += @animationLoop.correctValue(@velocity.x)
    @position.y += @animationLoop.correctValue(@velocity.y)

    @addSelfToRenderQueue()

    return this

  wasTapped: () ->

    touchData = @input.touchData

    tapX      = touchData.x
    tapY      = touchData.y
    distanceX = tapX - @position.x
    distanceY = tapY - @position.y
    tapped    = (distanceX * distanceX) + (distanceY * distanceY) < (@radius * @radius)

    if tapped
      message = "Bubble##{@id} tapped at #{tapX}, #{tapY}"
    else
      message = "Combo Broken!"

    debugConsole(message)

    return tapped

  tapHandler: (targetHit) ->

    @parent.updateComboMultiplier(targetHit)

    if targetHit
      @parent.updateScore(@diameter, @finalDiameter)
      @destroying = true
      @parent.decrementTargetBubblesCount()
      @input.queueEntityForRemoval(@id)

    return this
