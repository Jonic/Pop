
class UIClass

  constructor: ->

    @setupBasicInterfaceEvents()

    return this

  reset: ->

    @levelCounter           = Utils.$('.hud-value-level')
    @scoreCounter           = Utils.$('.hud-value-score')
    @comboMultiplierCounter = Utils.$('.hud-value-combo')
    @playAgain              = Utils.$('.play-again')

    @updateComboMultiplierCounter()
    @updateLevelCounter()
    @updateScoreCounter()

    return this

  setupBasicInterfaceEvents: ->

    Input.registerHandler '.game-logo', inputVerb, ->
      Input.gameStartTapEventHandler()
    , ['title']

    Input.registerHandler '.play-again', inputVerb, ->
      Input.gameStartTapEventHandler()
    , ['game-over']

    return this

  updateBodyClass: (className) ->

    body.className = ''
    body.classList.add('scene-' + className)

    return this

  updateComboMultiplierCounter: ->

    Utils.updateUITextNode(@comboMultiplierCounter, PlayState.comboMultiplier)

    return this

  updateLevelCounter: ->

    Utils.updateUITextNode(@levelCounter, PlayState.level)

    return this

  updateScoreCounter: ->

    scoreToFormat = Utils.formatWithComma(PlayState.score)

    Utils.updateUITextNode(@scoreCounter, scoreToFormat)

    return this
