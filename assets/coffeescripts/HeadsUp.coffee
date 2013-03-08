class HeadsUp

	levelCounter: '.level'
	scoreCounter: '.score'
	comboMultiplierCounter: '.combo'
	tapX: '.tapX'
	tapY: '.tapY'

	reset: ->

		this.updateComboMultiplierCounter()
		this.updateLevelCounter()
		this.updateScoreCounter()

		@

	updateComboMultiplierCounter: ->

		utils.updateUITextNode(this.comboMultiplierCounter, state.comboMultiplier)

		@

	updateLevelCounter: ->

		utils.updateUITextNode(this.levelCounter, state.level)

		@

	updateScoreCounter: ->

		utils.updateUITextNode(this.scoreCounter, state.score)

		@