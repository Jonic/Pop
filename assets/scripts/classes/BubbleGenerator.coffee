
class BubbleGeneratorClass

  constructor: ->

    @bubblesArray         = []
    @bubblesArrayIds      = []
    @bubblesToDelete      = []
    @bubblesToTestForTaps = []

    @bubblesOrigin =
      x: canvas.width  / 2
      y: canvas.height / 2

    @registerBubbleTapDetectionHandler()

    return this

  animationLoopActions: ->

    if PlayState.playing
      @generateBubble()

    @updateBubblesValues()
    @removeBubblesAfterTap()

    if @bubblesToDelete.length > 0
      @destroyBubblesOutsideCanvasBounds()

    return this

  destroyBubblesOutsideCanvasBounds: ->

    @bubblesToDelete.map (bubbleId) =>
      bubbleIndex = @bubblesArrayIds.indexOf(bubbleId)
      bubble      = @bubblesArray[bubbleIndex]

      if bubble?
        @gameOver() if bubble.isTarget
        @removeBubble(bubble)

    @bubblesToDelete = []

    return this

  gameOver: ->

    @stop()

    @bubblesArray.map (bubble) =>
      bubble.destroying = true

    PlayState.bubbleSpawnChance = 0

    Game.over()

    return this

  generateBubble: ->

    if Utils.randomPercentage() < PlayState.bubbleSpawnChance
      bubble = new BubbleClass()

      @bubblesArray.push(bubble)
      @bubblesArrayIds.push(bubble.id)

      if bubble.isTarget
        @bubblesToTestForTaps.unshift(bubble.id)

    return this

  bubbleTapDetectionHandler: () ->

    targetHit = false
    bubble  = false

    @bubblesToTestForTaps.map (bubbleId) =>
      bubbleIndex = @bubblesArrayIds.indexOf(bubbleId)
      bubble      = @bubblesArray[bubbleIndex]
      touchData     = Input.getTouchData(event)

      if bubble? and bubble.wasTapped(touchData)
        deletionIndex       = @bubblesToTestForTaps.indexOf(bubbleId)
        bubble.destroying = true
        targetHit           = true

        @bubblesToTestForTaps.splice(deletionIndex, 1)

        return

    PlayState.updateComboMultiplier(targetHit)

    PlayState.updateScore(bubble.size, bubble.finalSize) if targetHit

    return this

  registerBubbleTapDetectionHandler: ->

    Input.registerHandler '.ui-playing', inputVerb, ->
      BubbleGenerator.bubbleTapDetectionHandler()
    , ['playing']

    return this

  removeBubble: (bubble) ->

    id    = bubble.id
    index = @bubblesArrayIds.indexOf(id)

    @bubblesArray.splice(index, 1)
    @bubblesArrayIds.splice(index, 1)

    return this

  removeBubblesAfterTap: ->

    @bubblesArray.map (bubble) =>
      @removeBubble(bubble) if bubble.size < 1

      return

    return this

  reset: ->

    @bubblesArray         = []
    @bubblesArrayIds      = []
    @bubblesToDelete      = []
    @bubblesToTestForTaps = []

    return this

  stop: ->

    PlayState.update(false)
    PlayState.stopLevelUpIncrement()

    return this

  updateBubblesValues: ->

    @bubblesArray.map (bubble) =>
      context.fillStyle   = bubble.color
      context.strokeStyle = bubble.color

      bubble.updateValues()

      return

    return this
