class Input

	init: ->

		this.cancelTouchMoveEvents()

		@

	cancelTouchMoveEvents: ->

		window.addEventListener('touchmove', (event) ->
			event.preventDefault()
			return
		)

		@