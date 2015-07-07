
class UserInterfaceHelper

  load: ->

    @elements = {}

    return this

  element: (name) ->

    return @elements[name]

  removeAllElements: (sceneName) ->

    @elements = {}

    return this

  registerElement: (name, selector) ->

    @elements[name] = $(selector)

    return this

  removeElement: (name) ->

    delete @elements[name] if @elements[name]?

    return this

  transitionTo: (targetSceneID, instant = false) ->

    targetScene = App.scenes[targetSceneID]

    if App.currentScene?
      App.currentScene.unload()
      #@updateBodyClass("scene-#{targetSceneID}-out")

    targetScene.load()

    @updateBodyClass("scene-#{targetSceneID}")

    App.currentScene = targetScene

    return this

  updateBodyClass: (className) ->

    document.body.className = ''
    document.body.classList.add(className)

    return this
