###jshint plusplus:false, forin:false, eqeqeq: false ###
###global Class, Particle ###
###global canvas, context, game, headsUp ###

'use strict'

ParticleGenerator = Class.extend
	init: ->

		this.particlesOrigin =
			x: canvas.width / 2
			y: canvas.height / 2

		this.particlesArray = []
		this.particlesArrayIds = []
		this.particlesToDelete = []
		this.particlesToTestForTaps = []

		this.comboMultiplierCounter = $('.combo')

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

	reset: ->

		return

	removeParticle: (index) ->

		this.particlesArray.splice(index, 1)
		this.particlesArrayIds.splice(index, 1)

		return

	setupParticleTapDetection: ->

		self = this

		this.particlesToTestForTaps = []

		window.addEventListener 'touchstart', (event) ->
			tapX = event.touches[0].pageX
			tapY = event.touches[0].pageY

			targetHit = false

			for particleId in self.particlesToTestForTaps
				particleIndex = self.particlesArrayIds.indexOf(particleId)
				particle = self.particlesArray[particleIndex]

				if particle?
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

						targetSizeMultiplier = Math.abs(Math.round((particle.size / particle.finalSize) * 100) - 100)

						targetHit = true

						break

			if targetHit
				headsUp.updateScore(targetSizeMultiplier)
				headsUp.comboMultiplier += 1
			else
				headsUp.comboMultiplier = 1

			self.comboMultiplierCounter.text(headsUp.comboMultiplier)

			return

		return

	start: ->

		this.comboMultiplierCounter.text(headsUp.comboMultiplier)

		particleGenerator.requestAnimationFrame()

		return
