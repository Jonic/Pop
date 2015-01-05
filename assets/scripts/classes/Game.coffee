
class Game

	init: ->

		config.init()
		particleGenerator.init()
		playState.init()
		ui.init()
		input.init()

		animationLoop.init()

		scenes.ident()

		@

	over: ->

		scenes.gameOver()

		playState.stopLevelUpIncrement()

		@

	start: ->

		playState.setToInitialState()
		ui.setToInitialState()
		input.removeGameStartTapEventHandler()
		particleGenerator.setToInitialState()

		scenes.playing()

		@
