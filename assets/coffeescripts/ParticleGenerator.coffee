class ParticleGenerator

	init: ->

		this.particlesOrigin =
			x: canvas.width / 2
			y: canvas.height / 2

		this.reset()

		this.setupParticleTapDetection()

		@

	animationLoopActions: ->

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

		state.particleSpawnChance = 0

		for particle in this.particlesArray
			particle.destroying = true

		scenes.gameOver()

		@

	generateParticle: ->

		if utils.randomPercentage() < state.particleSpawnChance
			newParticle = new Particle()

			particle = newParticle.init()

			this.particlesArray.push(particle)
			this.particlesArrayIds.push(particle.id)

			if particle.isTarget
				this.particlesToTestForTaps.push(particle.id)

		@

	particleTapDetectionHandler: ->

		targetHit = false

		for particleId in this.particlesToTestForTaps.reverse()
			particleIndex = this.particlesArrayIds.indexOf(particleId)
			particle = this.particlesArray[particleIndex]

			touchData = event.touches[0]

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

		minX = particle.position.x - particle.half
		maxX = minX + particle.size

		hitX = tapX >= minX and tapX <= maxX

		minY = particle.position.y - particle.half
		maxY = minY + particle.size

		hitY = tapY >= minY and tapY <= maxY

		hitX and hitY

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

	reset: ->

		this.particlesArray = []
		this.particlesArrayIds = []
		this.particlesToDelete = []
		this.particlesToTestForTaps = []

		@

	setupParticleTapDetection: ->

		self = this

		this.particlesToTestForTaps = []

		window.addEventListener 'touchstart', ->
			self.particleTapDetectionHandler()

			return

		@

	start: ->

		state.updateGameState('playing')

		@

	updateParticlesValues: ->

		for particle in this.particlesArray
			if particle?
				context.fillStyle = particle.color
				context.strokeStyle = particle.color

				particle.updateValues()

		@