class HeadsUp

	init: ->

		self = this

		this.containerElement = document.querySelector('.headsup')
		this.levelCounter = '.hu-value-level'
		this.scoreCounter = '.hu-value-score'
		this.comboMultiplierCounter = '.hu-value-combo'

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

		this.containerElement.classList.remove('hidden');

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