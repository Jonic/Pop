HeadsUp = Class.extend

	init: ->

		this.levelCounter = '.level'
		this.scoreCounter = '.score'
		this.comboMultiplierCounter = '.combo'
		this.tapX = '.tapX'
		this.tapY = '.tapY'

		return

	reset: ->

		this.updateComboMultiplierCounter()
		this.updateLevelCounter()
		this.updateScoreCounter()

		return

	updateComboMultiplierCounter: ->

		utils.updateUITextNode(this.comboMultiplierCounter, state.comboMultiplier)

		return

	updateLevelCounter: ->

		utils.updateUITextNode(this.levelCounter, state.level)

		return

	updateScoreCounter: ->

		utils.updateUITextNode(this.scoreCounter, state.score)

		return