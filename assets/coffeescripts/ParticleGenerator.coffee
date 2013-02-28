ParticleGenerator = Class.extend

	init: ->

		this.particlesOrigin =
			x: canvas.width / 2
			y: canvas.height / 2

		this.reset()

		this.setupParticleTapDetection()

		return

	destroyParticlesOutsideCanvasBounds: ->

		for particleId in this.particlesToDelete
			particleIndex = this.particlesArrayIds.indexOf(particleId)
			particle = this.particlesArray[particleIndex]

			if particle.isTarget
				scenes.gameOver()

			this.removeParticle(particleIndex)

		this.particlesToDelete = []

		return

	generateParticle: ->

		if utils.randomPercentage() < state.particleSpawnChance
			newParticle = new Particle()

			this.particlesArray.push(newParticle)
			this.particlesArrayIds.push(newParticle.id)

		return

	particleTapDetectionHandler: ->

		targetHit = false

		for particleId in this.particlesToTestForTaps.reverse()
			particleIndex = this.particlesArrayIds.indexOf(particleId)
			particle = this.particlesArray[particleIndex]

			touchData = event.touches[0]

			if particle? and this.particleWasTapped(particle, touchData)
				deletionIndex = this.particlesToTestForTaps.indexOf(particleId)

				this.particlesToTestForTaps.splice(deletionIndex, 1)
				this.removeParticle(particleIndex)

				targetHit = true

				break

		state.updateComboMultiplier(targetHit)

		if targetHit
			state.updateScore(particle.size, particle.finalSize)

		return

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

	removeParticle: (index) ->

		this.particlesArray.splice(index, 1)
		this.particlesArrayIds.splice(index, 1)

		return

	reset: ->

		this.particlesArray = []
		this.particlesArrayIds = []
		this.particlesToDelete = []
		this.particlesToTestForTaps = []

		return

	setupParticleTapDetection: ->

		self = this

		this.particlesToTestForTaps = []

		window.addEventListener 'touchstart', ->
			self.particleTapDetectionHandler()

			return

		return

	start: ->

		state.updateGameState('playing')

		return

	updateValuesAndDraw: ->

		for particle in this.particlesArray
			context.fillStyle = particle.color
			context.strokeStyle = particle.color

			particle.draw()
			particle.updateValues()

		return