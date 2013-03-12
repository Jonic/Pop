class Game

	init: ->

		config.init()
		particleGenerator.init()
		state.init()
		headsUp.init()
		input.init()

		animationLoop.init()

		scenes.splash()

		@

	over: ->

		scenes.gameOver()
		state.stopLevelUpIncrement()

		@

	reset: ->

		@

	start: ->

		state.setToInitialState()
		headsUp.setToInitialState()
		particleGenerator.setToInitialState()

		@