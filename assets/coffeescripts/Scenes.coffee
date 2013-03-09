class Scenes

	credits: ->

		@

	gameOver: ->

		summary = document.querySelector('.summary')
		playAgain = document.querySelector('.play-again')

		summary.classList.remove('hidden')

		playAgain.addEventListener('click', (event) ->
			event.preventDefault();

			summary.classList.add('hidden')

			game.start()

			return
		)

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