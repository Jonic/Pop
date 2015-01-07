
class InputClass

  constructor: ->

    @cancelTouchMoveEvents()

    window.addEventListener inputVerb, (event) ->
      #console.log event.target.nodeName.toLowerCase()
      return

    return this

  addGameStartTapEventHandler: () ->

    body.addEventListener(inputVerb, @gameStartTapEventHandler)

    return this

  cancelTouchMoveEvents: ->

    window.addEventListener 'touchmove', (event) ->
      event.preventDefault()

      return

    return this

  gameStartTapEventHandler: (event) ->

    event.preventDefault()

    Game.start()

    return this

  getTouchData: (event) ->

    if touchData
      tapCoordinates = event.touches[0]
    else
      touchData =
        pageX: event.clientX,
        pageY: event.clientY

    return touchData

  registerHandler: (selector, scenes, callback) ->

    if typeof(scenes) == 'string'
      scene_string = scenes
      scenes = [scene_string]

    document.querySelector(selector).addEventListener inputVerb, (event) =>
      event.preventDefault()
      callback.apply() if Scenes.current in scenes
      return

    return this

  removeGameStartTapEventHandler: ->

    document.body.removeEventListener(inputVerb, @gameStartTapEventHandler)

    return this
