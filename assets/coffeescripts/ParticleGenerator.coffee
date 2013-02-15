###jshint plusplus:false, forin:false ###
###global Class ###
###global Particle, canvas, context, game ###

'use strict'

ParticleGenerator = Class.extend
	init: ->
		self = this

		this.setupParticleOrigin()

		this.particlesArray = []
		this.particlesArrayIds = []
		this.particlesToDelete = []

		this.setupParticleTapDetection()

		return

	requestAnimationFrame: ->
		self = this

		this.animationId = window.requestAnimationFrame ->
			self.requestAnimationFrame()

			return

		context.clearRect(0, 0, canvas.width, canvas.height)

		this.generateParticle(1)

		for particle in this.particlesArray
			context.fillStyle = particle.color
			context.strokeStyle = particle.color

			particle.draw()
			particle.updateValues()

		for particleId in this.particlesToDelete
			particleIndex = this.particlesArrayIds.indexOf(particleId)
			particle = this.particlesArray[particleIndex]

			if particle.isTarget
				this.resetParticleArrays()
				game.gameOver(this.animationId)

			this.removeParticle(particleIndex)

		this.particlesToDelete = []

		return

	generateParticle: (count) ->
		for num in [count..1]
			newParticle = new Particle()

			if newParticle.isTarget
				this.particlesArray.push(newParticle)
				this.particlesArrayIds.push(newParticle.id)
			else
				this.particlesArray.unshift(newParticle)
				this.particlesArrayIds.unshift(newParticle.id)

		return

	removeParticle: (index) ->
		this.particlesArray.splice(index, 1)
		this.particlesArrayIds.splice(index, 1)

		return

	resetParticleArrays: ->
		this.particlesArray = []
		this.particlesArrayIds = []
		this.particlesToDelete = []

		return

	setupParticleOrigin: ->
		self = this

		this.particlesOrigin =
			x: canvas.width / 2
			y: canvas.height / 2

		document.addEventListener 'mousemove', (event) ->
			self.updateParticlesOrigin(event)

			return

		document.addEventListener 'touchmove', (event) ->
			self.updateParticlesOrigin(event)

			return

		return

	setupParticleTapDetection: ->
		self = this

		this.particlesToTestForTaps = []

		window.addEventListener 'touchstart', (event) ->
			tapX = event.touches[0].pageX
			tapY = event.touches[0].pageY

			$('.debug .tapX').text(tapX)
			$('.debug .tapY').text(tapY)

			for particleId in self.particlesToTestForTaps
				particleIndex = self.particlesArrayIds.indexOf(particleId)
				particle = self.particlesArray[particleIndex]

				minX = particle.position.x - particle.half
				maxX = minX + particle.size

				hitX = tapX >= minX and tapX <= maxX

				minY = particle.position.y - particle.half
				maxY = minY + particle.size

				hitY = tapY >= minY and tapY <= maxY

				if hitX and hitY
					deletionIndex = self.particlesToTestForTaps.indexOf(particleId)
					self.particlesToTestForTaps.splice(deletionIndex, 1)
					self.removeParticle(particleIndex)

			return

		return

	updateParticlesOrigin: (event) ->
		event.preventDefault()

		#this.particlesOrigin.x = event.pageX
		#this.particlesOrigin.y = event.pageY

		return
