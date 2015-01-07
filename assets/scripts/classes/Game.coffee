
class GameClass

  constructor: ->

    Scenes.ident()

    return this

  over: ->

    Scenes.gameOver()

    PlayState.stopLevelUpIncrement()

    return this

  start: ->

    PlayState.reset()
    UI.reset()
    Input.removeGameStartTapEventHandler()
    BubbleGenerator.reset()

    Scenes.playing()

    return this
