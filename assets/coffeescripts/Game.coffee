class Game

	run: ->

		input.cancelTouchMoveEvents()
		particleGenerator.init()
		state.reset()
		headsUp.reset()

		animationLoop.requestAnimationFrame()

		scenes.splash()

		@

	reset: ->

		@

	start: ->

		state.setup()
		state.updateGameState('playing')

		headsUp.reset()
		particleGenerator.reset()

		@