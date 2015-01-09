
class GameClass

  constructor: ->

    Scenes.ident()

    return this

  over: ->

    Scenes.gameOver()

    Utils.console('Game Over')

    PlayState.stopLevelUpIncrement()

    return this

  start: ->

    PlayState.reset()
    UI.reset()
    Input.removeGameStartTapEventHandler()
    BubbleGenerator.reset()

    Scenes.playing()

    Utils.console('Playing')

    return this
