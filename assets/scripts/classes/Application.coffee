
class Application

  constructor: ->

    @currentScene     = null
    @delta            = 0
    @helpers          = {}
    @scenes           = {}
    @backgroundScenes = []

    return this

  load: ->

    @initHelpers()
    @initScenes()

    @getHelper('animationLoop').start()
    @getHelper('ui').transitionTo('ident')

    return this

  initHelpers: ->

    @helpers = {
      animationLoop: { object: new AnimationLoopHelper() }
      canvas:        { object: new CanvasHelper()        }
      config:        { object: new ConfigHelper()        }
      device:        { object: new DeviceHelper()        }
      input:         { object: new InputHelper()         }
      renderer:      { object: new RendererHelper()      }
      ui:            { object: new UserInterfaceHelper() }
    }

    for helper in @helpers
      @loadHelper(helper) if !helper.loaded

    return this

  loadHelper: (helper) ->

    helper.object.load() if helper.object.load?
    helper.loaded = true

    return this

  initScenes: ->

    @scenes = {
      'ident':     new IdentScene()
      'game-over': new GameOverScene()
      'playing':   new PlayingScene()
      'title':     new TitleScene()
    }

    for sceneName, sceneObject of @scenes
      @backgroundScenes.push(sceneObject) if sceneObject.updatesInBackGround

    return this

  getHelper: (name) ->

    helper = @helpers[name]

    if !helper.loaded
      @loadHelper(helper)

    return helper.object

  update: (delta) ->

    @delta = delta

    if @currentScene?
      @getHelper('canvas').clear()
      @currentScene.update()

      for backgroundScene in @backgroundScenes
        backgroundScene.update() if backgroundScene.id != @currentScene.id

      @getHelper('renderer').process()

    return this
