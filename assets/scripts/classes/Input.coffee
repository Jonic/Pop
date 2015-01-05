
class Input

	init: ->

		this.cancelTouchMoveEvents()

		@

	addGameStartTapEventHandler: () ->

		body.addEventListener(inputVerb, this.gameStartTapEventHandler)

		@

	cancelTouchMoveEvents: ->

		window.addEventListener 'touchmove', (event) ->

			event.preventDefault()

			return

		@

	gameStartTapEventHandler: (event) ->

		event.preventDefault()

		game.start()

		@

	getTapCoordinates: (event) ->

		if hasTouchEvents
			tapCoordinates = event.touches[0]
		else
			tapCoordinates =
				pageX: event.clientX,
				pageY: event.clientY

		return tapCoordinates

	particleWasTapped: (particle, touchData) ->

		tapX      = touchData.pageX * devicePixelRatio
		tapY      = touchData.pageY * devicePixelRatio
		distanceX = tapX - particle.position.x
		distanceY = tapY - particle.position.y
		radius    = particle.half

		return (distanceX * distanceX) + (distanceY * distanceY) < (particle.half * particle.half)

	particleTapDetectionHandler: (event) ->

		targetHit = false

		for particleId in particleGenerator.particlesToTestForTaps
			particleIndex = particleGenerator.particlesArrayIds.indexOf(particleId)
			particle      = particleGenerator.particlesArray[particleIndex]
			touchData     = this.getTapCoordinates(event)

			if particle? and this.particleWasTapped(particle, touchData)
				deletionIndex       = particleGenerator.particlesToTestForTaps.indexOf(particleId)
				particle.destroying = true
				targetHit           = true

				particleGenerator.particlesToTestForTaps.splice(deletionIndex, 1)

				break

		playState.updateComboMultiplier(targetHit)

		if targetHit
			playState.updateScore(particle.size, particle.finalSize)

		@

	removeGameStartTapEventHandler: ->

		document.body.removeEventListener(inputVerb, this.gameStartTapEventHandler)

		@

	setupParticleTapDetection: ->

		self = this

		particleGenerator.particlesToTestForTaps = []

		window.addEventListener inputVerb, (event) ->

			self.particleTapDetectionHandler(event)

			return

		@