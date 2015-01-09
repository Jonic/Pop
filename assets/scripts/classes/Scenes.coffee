
class ScenesClass

  @current = null

  credits: ->

    @current = 'credits'

    Utils.console('Load Scene: Credits')

    UI.updateBodyClass('credits')

    return this

  gameOver: ->

    @current = 'game-over'

    Utils.console('Load Scene: Game Over')

    UI.updateBodyClass('game-over')

    return this

  leaderboard: ->

    @current = 'leaderboard'

    Utils.console('Load Scene: Leaderboard')

    return this

  playing: ->

    @current = 'playing'

    Utils.console('Load Scene: Playing')

    UI.updateBodyClass('playing')

    return this

  ident: ->

    @current = 'ident'

    Utils.console('Load Scene: Ident')

    UI.updateBodyClass('ident')

    window.setTimeout =>
      @title()
    , 2500

    return this

  title: ->

    @current = 'title'

    Utils.console('Load Scene: Title Screen')

    UI.updateBodyClass('title')

    return this
