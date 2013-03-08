class Input

	cancelTouchMoveEvents: ->

		window.addEventListener('touchmove', (event) ->
			event.preventDefault()
			return
		)

		@