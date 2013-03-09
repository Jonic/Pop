class HeadsUp

	containerElement: document.querySelector('.headsup')
	levelCounter: '.hu-value-level'
	scoreCounter: '.hu-value-score'
	comboMultiplierCounter: '.hu-value-combo'

	reset: ->

		this.updateComboMultiplierCounter()
		this.updateLevelCounter()
		this.updateScoreCounter()

		this.show()

		@

	hide: ->

		this.containerElement.classList.add('hidden');

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