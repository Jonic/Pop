###jshint plusplus:false, forin:false ###
###global Class, Config ###
###global headsUp, particleGenerator, screens ###

'use strict'

Game = Class.extend
	init: ->

		this.config = new Config()

		window.addEventListener('touchmove', (event) ->
			event.preventDefault()
		)

		return

	gameOver: (animationId) ->

		window.cancelAnimationFrame(animationId)

		screens.gameOver()

		this.reset()

		return

	run: ->

		screens.ident()

		return

	reset: ->

		headsUp.reset()

		particleGenerator.reset()

		return

	start: ->

		headsUp.setToInitialValues()

		particleGenerator.start()

		return
