/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Application {
  constructor() {
    this.currentScene = null
    this.delta = 0
    this.helpers = {}
    this.scenes = {}
    this.backgroundScenes = []

    this.initHelpers()
    this.initScenes()

    return this
  }

  load() {
    callNativeApp('PopRush Loaded! Aww Yeah!')

    this.getHelper('animationLoop').start()
    this.getHelper('ui').transitionTo('ident')

    return this
  }

  initHelpers() {
    this.helpers = {
      animationLoop: { object: new AnimationLoopHelper() },
      canvas: { object: new CanvasHelper() },
      config: { object: new ConfigHelper() },
      device: { object: new DeviceHelper() },
      input: { object: new InputHelper() },
      renderer: { object: new RendererHelper() },
      ui: { object: new UserInterfaceHelper() },
    }

    for (let helper of Array.from(this.helpers)) {
      if (!helper.loaded) {
        this.loadHelper(helper)
      }
    }

    return this
  }

  loadHelper(helper) {
    if (helper.object.load !== null) {
      helper.object.load()
    }
    helper.loaded = true

    return this
  }

  initScenes() {
    this.scenes = {
      ident: new IdentScene(),
      'game-over': new GameOverScene(),
      playing: new PlayingScene(),
      title: new TitleScene(),
    }

    for (let sceneName in this.scenes) {
      const sceneObject = this.scenes[sceneName]
      if (sceneObject.updatesInBackGround) {
        this.backgroundScenes.push(sceneObject)
      }
    }

    return this
  }

  getHelper(name) {
    const helper = this.helpers[name]

    if (!helper.loaded) {
      this.loadHelper(helper)
    }

    return helper.object
  }

  update(delta) {
    this.delta = delta

    if (this.currentScene != null) {
      this.getHelper('canvas').clear()
      this.currentScene.update()

      for (let backgroundScene of Array.from(this.backgroundScenes)) {
        if (backgroundScene.id !== this.currentScene.id) {
          backgroundScene.update()
        }
      }

      this.getHelper('renderer').process()
    }

    return this
  }
}
