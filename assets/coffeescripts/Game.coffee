Game = Class.extend

	init: ->

		config.setupDatGui() if debug

		return

	run: ->

		animationLoop.requestAnimationFrame()

		this.reset()

		scenes.title()

		return

	reset: ->

		state.reset()

		headsUp.reset()

		particleGenerator.reset()

		return

	start: ->

		state.setupLevelUpIncrement()

		particleGenerator.start()

		return