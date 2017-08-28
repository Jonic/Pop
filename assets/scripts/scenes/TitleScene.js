class TitleScene extends Scene {
  constructor() {
    super(...arguments)

    this.id = 'title'

    return this
  }

  load() {
    super.load(...arguments)

    this.input.addEventListener('.game-logo', 'click', () => {
      this.ui.transitionTo('playing')
    })

    return this
  }

  unload() {
    super.unload(...arguments)

    return this
  }
}
