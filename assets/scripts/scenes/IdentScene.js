/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class IdentScene extends Scene {
  constructor() {
    super(...arguments)

    this.id = 'ident'

    return this
  }

  load() {
    super.load(...arguments)

    window.setTimeout(() => {
      return this.ui.transitionTo('title')
    }, 2500)

    return this
  }
}
