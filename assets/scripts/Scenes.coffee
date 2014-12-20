
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

	ident: ->

		self = this

		ui.updateBodyClass('ident')

		window.setTimeout ->
			self.title()
		, 5000

		@

	title: ->

		ui.updateBodyClass('title')

		input.addGameStartTapEventHandler();

		@
