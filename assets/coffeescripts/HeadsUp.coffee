class HeadsUp

	init: ->

		this.containerElement = document.querySelector('.headsup')
		this.levelCounter = document.querySelector('.hu-value-level')
		this.scoreCounter = document.querySelector('.hu-value-score')
		this.comboMultiplierCounter = document.querySelector('.hu-value-combo')

		@

	hide: ->

		this.containerElement.classList.add('hidden');

		@

	setToInitialState: ->

		this.updateComboMultiplierCounter()
		this.updateLevelCounter()
		this.updateScoreCounter()

		this.show()

		@

	show: ->

		this.containerElement.classList.remove('hidden')

		@

	updateComboMultiplierCounter: ->

		utils.updateUITextNode(this.comboMultiplierCounter, state.comboMultiplier)

		@

	updateLevelCounter: ->

		utils.updateUITextNode(this.levelCounter, state.level)

		@

	updateScoreCounter: ->

		scoreToFormat = utils.formatWithComma(state.score)

		utils.updateUITextNode(this.scoreCounter, scoreToFormat)

		@