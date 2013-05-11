class ParticleGenerator

	init: ->

		this.particlesOrigin =
			x: canvas.width / 2
			y: canvas.height / 2

		this.setToInitialState()
		this.setupParticleTapDetection()

		@

	animationLoopActions: ->

		if state.gameState == 'playing'
			this.generateParticle()

		this.updateParticlesValues()
		this.removeParticlesAfterTap()

		if this.particlesToDelete.length > 0
			this.destroyParticlesOutsideCanvasBounds()

		@

	destroyParticlesOutsideCanvasBounds: ->

		for particleId in this.particlesToDelete
			particleIndex = this.particlesArrayIds.indexOf(particleId)
			particle = this.particlesArray[particleIndex]

			if particle?
				if particle.isTarget
					this.gameOver()

				this.removeParticle(particle)

		this.particlesToDelete = []

		@

	gameOver: ->

		this.stop()

		for particle in this.particlesArray
			particle.destroying = true

		state.particleSpawnChance = 0

		game.over()

		@

	generateParticle: ->

		if utils.randomPercentage() < state.particleSpawnChance
			newParticle = new Particle()

			particle = newParticle.init()

			this.particlesArray.push(particle)
			this.particlesArrayIds.push(particle.id)

			if particle.isTarget
				this.particlesToTestForTaps.unshift(particle.id)

		@

	getTapCoordinates: (event) ->

		if hasTouchEvents
			tapCoordinates = event.touches[0]
		else
			tapCoordinates = {
				pageX: event.clientX,
				pageY: event.clientY
			}

		return tapCoordinates

	particleTapDetectionHandler: (event) ->

		targetHit = false

		for particleId in this.particlesToTestForTaps
			particleIndex = this.particlesArrayIds.indexOf(particleId)
			particle = this.particlesArray[particleIndex]

			touchData = this.getTapCoordinates(event)

			if particle? and this.particleWasTapped(particle, touchData)
				deletionIndex = this.particlesToTestForTaps.indexOf(particleId)
				this.particlesToTestForTaps.splice(deletionIndex, 1)

				particle.destroying = true
				targetHit = true

				break

		state.updateComboMultiplier(targetHit)

		if targetHit
			state.updateScore(particle.size, particle.finalSize)

		@

	particleWasTapped: (particle, touchData) ->

		tapX = touchData.pageX * devicePixelRatio
		tapY = touchData.pageY * devicePixelRatio

		distanceX = tapX - particle.position.x
		distanceY = tapY - particle.position.y
		radius = particle.half

		return (distanceX * distanceX) + (distanceY * distanceY) < (particle.half * particle.half)

	removeParticle: (particle) ->

		id = particle.id

		index = this.particlesArrayIds.indexOf(id)

		this.particlesArray.splice(index, 1)
		this.particlesArrayIds.splice(index, 1)

		@

	removeParticlesAfterTap: ->

		for particle in this.particlesArray
			if particle? and particle.size < 1
				this.removeParticle(particle)

		@

	setToInitialState: ->

		this.particlesArray = []
		this.particlesArrayIds = []
		this.particlesToDelete = []
		this.particlesToTestForTaps = []

		@

	setupParticleTapDetection: ->

		self = this

		this.particlesToTestForTaps = []

		window.addEventListener(inputVerb, (event) ->
			self.particleTapDetectionHandler(event)

			return
		)

		@

	stop: ->

		state.updateGameState('stopped')
		state.stopLevelUpIncrement()

		@

	updateParticlesValues: ->

		for particle in this.particlesArray
			if particle?
				context.fillStyle = particle.color
				context.strokeStyle = particle.color

				particle.updateValues()

		@