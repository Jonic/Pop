class Scene

  constructor: ->

    @entitiesCount          = 0
    @entityIds              = []
    @entities               = []
    @entitiesPendingRemoval = []
    @updatesInBackGround    = false

    return this

  addEntity: (entity, unshift = false) ->

    if !unshift
      @entityIds.push(entity.id)
      @entities.push(entity)
    else
      @entityIds.unshift(entity.id)
      @entities.unshift(entity)

    @entitiesCount += 1

    return this

  load: ->

    @config = App.getHelper('config')
    @device = App.getHelper('device')
    @input  = App.getHelper('input')
    @ui     = App.getHelper('ui')

    return this

  removeAllEntities: ->

    @entitiesCount = 0
    @entities      = []
    @entityIds     = []

    return this

  removeEntity: (id) ->

    @entitiesPendingRemoval.push(id)

    return this

  unload: ->

    #@removeAllEntities()

    return this

  update: ->

    if @entitiesCount > 0
      @updateEntities()

      @processEntitiesMarkedForRemoval()

    return this

  updateEntities: ->

    entity.update() for entity in @entities

    return this

  processEntitiesMarkedForRemoval: ->

    for id in @entitiesPendingRemoval
      index = @entityIds.indexOf(id)

      @entities.splice(index, 1)
      @entityIds.splice(index, 1)

      @entitiesCount -= 1

    @entitiesPendingRemoval = []

    @entitiesCount = 0 if @entitiesCount < 0
