/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class UserInterfaceHelper {
  load() {
    this.elements = {}

    return this
  }

  element(name) {
    return this.elements[name]
  }

  removeAllElements(sceneName) {
    this.elements = {}

    return this
  }

  registerElement(name, selector) {
    this.elements[name] = $(selector)

    return this
  }

  removeElement(name) {
    if (this.elements[name] != null) {
      delete this.elements[name]
    }

    return this
  }

  transitionTo(targetSceneID, instant) {
    if (instant == null) {
      instant = false
    }
    const targetScene = App.scenes[targetSceneID]

    if (App.currentScene != null) {
      App.currentScene.unload()
    }
    // @updateBodyClass("scene-#{targetSceneID}-out")

    targetScene.load()

    this.updateBodyClass(`scene-${targetSceneID}`)

    App.currentScene = targetScene

    return this
  }

  updateBodyClass(className) {
    document.body.className = ''
    document.body.classList.add(className)

    return this
  }
}
