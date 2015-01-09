
class InputClass

  constructor: ->

    @cancelTouchMoveEvents()

    window.addEventListener inputVerb, (event) ->
      #Utils.console(event.type + ' on ' + event.target.nodeName.toLowerCase())
      return
    , false

    return this

  cancelTouchMoveEvents: ->

    window.addEventListener 'touchmove', (event) ->
      event.preventDefault()

      return

    return this

  gameStartTapEventHandler: () ->

    event.preventDefault()

    Game.start()

    return this

  getTouchData: (event) ->

    return event.touches[0] if hasTouchEvents

    touchData =
      pageX: event.clientX,
      pageY: event.clientY

    return touchData

  registerHandler: (selector, action, callback, scenes) ->

    console.log "Input.regsiterHandler(#{selector}, #{action}, #{callback}, #{scenes})"

    if typeof scenes == 'string'
      scene  = scenes
      scenes = [scene]

    element = document.querySelector(selector)

    element.addEventListener action, (event) =>
      event.preventDefault()
      console.log "Calling #{action} input on #{element} in #{Scenes.current})"
      callback.apply() if scenes.length == 0 || Scenes.current in scenes
      return

    return this

  removeGameStartTapEventHandler: ->

    document.body.removeEventListener(inputVerb, @gameStartTapEventHandler)

    return this
