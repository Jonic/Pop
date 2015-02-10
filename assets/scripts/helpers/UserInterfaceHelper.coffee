
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

  transitionTo: (targetScene, instant = false) ->

    if App.currentScene? && typeof App.currentScene.unload == 'function'
      App.currentScene.unload()

      #@updateBodyClass("scene-#{targetScene}-out")

    App.currentScene = App.scenes[targetScene]

    App.currentScene.load()

    @updateBodyClass("scene-#{App.currentScene.id}")

    return this

  updateBodyClass: (className) ->

    document.body.className = ''
    document.body.classList.add(className)

    return this
