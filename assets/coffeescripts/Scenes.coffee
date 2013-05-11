class Scenes

	init: ->

		this.summary = document.querySelector('.summary')
		this.playAgain = document.querySelector('.play-again')

		@

	credits: ->

		@

	gameOver: ->

		input.addGameStartTapEventHandler()

		this.summary.classList.remove('hidden')

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

		input.addGameStartTapEventHandler();

		@