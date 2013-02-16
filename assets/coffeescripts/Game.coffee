###jshint plusplus:false, forin:false ###
###global Class, Config ###
###global particleGenerator, screens ###

'use strict'

Game = Class.extend
	init: ->

		this.config = new Config()

		return

	run: ->

		screens.ident()

		return

	reset: ->

		particleGenerator.reset();

		return

	gameOver: (animationId) ->
		window.cancelAnimationFrame(animationId)

		screens.gameOver()

		return
