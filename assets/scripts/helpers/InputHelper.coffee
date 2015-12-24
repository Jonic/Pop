class InputHelper

  constructor: ->

    @device = new DeviceHelper()

    @cancelTouchMoveEvents()

    #@setupConsole()

    return this

  load: ->

    @entityIds              = []
    @entitiesToTest         = []
    @entitiesPendingRemoval = []

    return this

  addCanvasTapEventListener: (canvasSelector) ->

    @addEventListener canvasSelector, 'click', =>
      @testEntitiesForEvents()
      return

    return this

  addEntity: (entity) ->

    @entityIds.push(entity.id)
    @entitiesToTest.push(entity)

    return this

  addEventListener: (selector = 'body', type, callback, consoleOutput = false) ->

    type = @convertClickToTouch(type)

    debugConsole("Input.addEventListener(#{selector}, #{type}, #{callback})") if consoleOutput

    $(selector).addEventListener type, callback, false

    return this

  cancelTouchMoveEvents: ->

    window.addEventListener 'touchmove', (event) ->
      event.preventDefault()
      return

    return this

  convertClickToTouch: (type) ->

    if type == 'click' && @device.hasTouchEvents
      return 'touchstart'
    else
      return type

  getTouchData: (event) ->

    if @device.hasTouchEvents
      touchData =
        x: event.touches[0].pageX,
        y: event.touches[0].pageY
    else
      touchData =
        x: event.clientX,
        y: event.clientY

    return touchData

  removeEventListener: (selector = 'body', type, callback) ->

    type = @convertClickToTouch(type)

    debugConsole("Input.removeEventListener(#{selector}, #{type}, #{callback})")

    $(selector).removeEventListener type, callback, false

    return this

  setupConsole: ->

    @addEventListener 'body', 'click', (event) ->
      type      = event.type
      node      = event.target.nodeName.toLowerCase()
      id        = event.target.id || 'n/a'
      classList = event.target.classList || 'n/a'

      debugConsole("#{type} on #{node} - id: #{id} - class: #{classList}")
      return

    return this

  queueEntityForRemoval: (id) ->

    @entitiesPendingRemoval.push(id)

    return this

  removeAllEntities: ->

    @entitiesToTest = []

    return this

  removeQueuedEntities: ->

    @removeEntity(id) for id in @entitiesPendingRemoval

    @entitiesPendingRemoval = []

    return this

  removeEntity: (id) ->

    index = @entityIds.indexOf(id);

    if index != -1
      @entityIds.splice(index, 1)
      @entitiesToTest.splice(index, 1)

    return this

  testEntitiesForEvents: ->

    @touchData = @getTouchData(event)

    for entity in @entitiesToTest
      tapped = entity.wasTapped()

      entity.tapHandler(tapped)

      #break if tapped

    @removeQueuedEntities()

    return this
