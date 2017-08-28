class GameOverScene extends Scene {
  constructor() {
    super(...arguments)

    this.id = 'game-over'
    this.playAgainEventBound = false

    return this
  }

  load() {
    super.load(...arguments)

    this.input.addEventListener('.play-again', 'click', () => {
      this.ui.transitionTo('playing')
    })

    return this
  }
}
