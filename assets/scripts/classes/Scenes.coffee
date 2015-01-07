
class ScenesClass

  @current = null

  credits: ->

    @current = 'credits'

    UI.updateBodyClass('credits')

    return this

  gameOver: ->

    @current = 'game-over'

    UI.updateBodyClass('game-over')

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
    , 2500

    return this

  title: ->

    @current = 'title'

    UI.updateBodyClass('title')

    return this
