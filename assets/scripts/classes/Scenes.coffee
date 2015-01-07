
class ScenesClass

  @current = null

  credits: ->

    @current = 'credits'

    UI.updateBodyClass('credits')

    return this

  gameOver: ->

    @current = 'game-over'

    UI.updateBodyClass('game-over')

    Input.addGameStartTapEventHandler()

    return this

  leaderboard: ->

    @current = 'leaderboard'

    return this

  playing: ->

    @current = 'playing'

    UI.updateBodyClass('playing')

    return this

  ident: ->

    @current = 'ident'

    UI.updateBodyClass('ident')

    window.setTimeout =>
      @title()
    , 500

    return this

  title: ->

    @current = 'title'

    UI.updateBodyClass('title')

    Input.addGameStartTapEventHandler();

    return this
