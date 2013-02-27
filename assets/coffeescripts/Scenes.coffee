Scenes = Class.extend

	init: ->

		this.splash()

		return

	credits: ->

		return

	gameOver: ->

		alert('GAME OVER')

		animationLoop.cancelAnimationFrame()

		game.reset()

		return

	howToPlay: ->

		return

	installationPrompt: ->

		utils.updateUITextNode('body', 'ADD THIS TO YOUR HOME SCREEN TO PLAY')

		return

	mobilePrompt: ->

		utils.updateUITextNode('body', 'YOU NEED TO RUN THIS ON A MOBILE DEVICE')

		return

	splash: ->

		return

	title: ->

		game.start()

		return