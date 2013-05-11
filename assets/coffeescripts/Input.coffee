class Input

	init: ->

		this.cancelTouchMoveEvents()

		@

	addGameStartTapEventHandler: () ->

		document.body.addEventListener(inputVerb, this.gameStartTapEventHandler)

		@

	cancelTouchMoveEvents: ->

		window.addEventListener('touchmove', (event) ->

			event.preventDefault()

			return

		)

		@

	gameStartTapEventHandler: (event) ->

		event.preventDefault();

		scenes.summary.classList.add('hidden')

		game.start()

		@

	removeGameStartTapEventHandler: ->

		document.body.removeEventListener(inputVerb, this.gameStartTapEventHandler)

		@