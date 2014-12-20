
class Scenes

	credits: ->

		ui.updateBodyClass('credits')

		@

	gameOver: ->

		ui.updateBodyClass('game-over')

		input.addGameStartTapEventHandler()

		@

	leaderboard: ->

		@

	playing: ->

		ui.updateBodyClass('playing')

		@

	splash: ->

		self = this

		ui.updateBodyClass('splash')

		window.setTimeout ->
			self.title()
		, 5000

		@

	title: ->

		ui.updateBodyClass('title')

		input.addGameStartTapEventHandler();

		@
