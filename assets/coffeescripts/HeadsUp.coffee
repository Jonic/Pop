###jshint plusplus:false, forin:false ###
###global Class ###
###global game ###

'use strict'

HeadsUp = Class.extend
	init: ->

		this.levelCounter = $('.level')
		this.scoreCounter = $('.score')

		return

	reset: ->

		window.clearInterval this.levelUpCounter

		return

	setToInitialValues: ->

		self = this

		this.level = 1
		this.score = 0

		this.comboMultiplier = 1

		this.levelCounter.text(this.level)
		this.scoreCounter.text(this.score)

		this.levelUpCounter = window.setInterval ->
			self.updateLevel()
			return
		, game.config.levelUpInterval * 1000

		return

	updateLevel: ->

		this.level += 1
		this.levelCounter.text(this.level)

		if this.level >= game.config.maxLevel
			window.clearInterval this.levelUpCounter

		return

	updateScore: (targetSizeMultiplier) ->

		points = game.config.pointsPerPop + targetSizeMultiplier
		pointsAfterComboMultiplier = points * this.comboMultiplier
		levelMultiplier = this.level + 1

		this.score += pointsAfterComboMultiplier * levelMultiplier
		this.scoreCounter.text(this.score)

		return
