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

		state.setupLevelUpIncrement()
		particleGenerator.start()

		@