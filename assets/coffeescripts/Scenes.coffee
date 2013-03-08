class Scenes

	credits: ->

		@

	gameOver: ->

		alert('GAME OVER')

		animationLoop.cancelAnimationFrame()

		game.reset()

		@

	howToPlay: ->

		@

	installationPrompt: ->

		utils.updateUITextNode('body', 'ADD THIS TO YOUR HOME SCREEN TO PLAY')

		@

	mobilePrompt: ->

		utils.updateUITextNode('body', 'YOU NEED TO RUN THIS ON A MOBILE DEVICE')

		@

	splash: ->

		this.title()

		@

	title: ->

		game.start()

		@