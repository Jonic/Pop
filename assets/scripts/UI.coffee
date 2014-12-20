
class UI

	init: ->

		this.body                   = document.body
		this.levelCounter           = utils.$('.hud-value-level')
		this.scoreCounter           = utils.$('.hud-value-score')
		this.comboMultiplierCounter = utils.$('.hud-value-combo')
		this.playAgain              = utils.$('.play-again')

		@

	updateBodyClass: (className) ->

		this.body.className = ''
		this.body.classList.add('scene-' + className)

		@

	setToInitialState: ->

		this.updateComboMultiplierCounter()
		this.updateLevelCounter()
		this.updateScoreCounter()

		@

	updateComboMultiplierCounter: ->

		utils.updateUITextNode(this.comboMultiplierCounter, playState.comboMultiplier)

		@

	updateLevelCounter: ->

		utils.updateUITextNode(this.levelCounter, playState.level)

		@

	updateScoreCounter: ->

		scoreToFormat = utils.formatWithComma(playState.score)

		utils.updateUITextNode(this.scoreCounter, scoreToFormat)

		@
