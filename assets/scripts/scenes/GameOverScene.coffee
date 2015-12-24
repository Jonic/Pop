class GameOverScene extends Scene

  constructor: ->

    super

    @id                  = 'game-over'
    @playAgainEventBound = false

    return this

  load: ->

    super

    @input.addEventListener '.play-again', 'click', =>
      @ui.transitionTo('playing')
      return

    return this
