class Game

	init: ->

		config.init()
		particleGenerator.init()
		scenes.init()
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

	start: ->

		state.setToInitialState()
		headsUp.setToInitialState()
		input.removeGameStartTapEventHandler()
		particleGenerator.setToInitialState()

		@
