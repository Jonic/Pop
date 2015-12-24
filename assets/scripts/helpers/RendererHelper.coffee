class RendererHelper

  load: ->

    @renderStack = []

    return this

  enqueue: (entity) ->

    @renderStack.push(entity)

    return this

  process: ->

    for entity in @renderStack
      entity.render() if entity.isInsideCanvasBounds()

    @reset()

    return this

  reset: ->

    @renderStack = []

    return this
