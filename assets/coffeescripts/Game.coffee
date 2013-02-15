###jshint plusplus:false, forin:false ###
###global Class ###
###global particleGenerator, screens ###

'use strict'

Game = Class.extend
	init: ->

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
