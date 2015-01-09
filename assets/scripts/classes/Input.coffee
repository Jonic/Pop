
class InputClass

  constructor: ->

    @cancelTouchMoveEvents()

    event_details = {
      element: Utils.$('.event_details .element')
      action:  Utils.$('.event_details .action')
    }

    window.addEventListener inputVerb, (event) ->
      console.log event
      Utils.updateUITextNode(event_details.element, event.target.nodeName.toLowerCase())
      Utils.updateUITextNode(event_details.action,  event.type)
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

    if touchData
      tapCoordinates = event.touches[0]
    else
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
