###jshint plusplus:false, forin:false ###
###global Class ###
###global game ###

'use strict'

HeadsUp = Class.extend
	init: ->

		this.levelCounter = $('.level')
		this.scoreCounter = $('.score')

		return

	installPrompt: ->

		$('body').empty().text('ADD THIS TO YOUR HOME SCREEN TO PLAY')

		return

	mobilePrompt: ->

		$('body').empty().text('YOU NEED TO RUN THIS ON A MOBILE DEVICE, YOU MUG')

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

	updateScore: (sizeWhenTapped, sizeWhenFullyGrown) ->

		#((defaultScorePerPop + (100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))) * comboMultiplier) * (levelNumber + 1)

		targetSizeBonus = Math.round(100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))
		popPointValue = game.config.pointsPerPop + targetSizeBonus
		levelMultiplier = this.level + 1

		this.score += (popPointValue * this.comboMultiplier) * (levelMultiplier)

		this.scoreCounter.text(this.score)

		return
