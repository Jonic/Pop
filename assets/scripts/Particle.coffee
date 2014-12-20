
class Particle

	init: ->

		colors =
			r: utils.randomInteger(0, 200)
			g: utils.randomInteger(0, 200)
			b: utils.randomInteger(0, 200)
			a: utils.random(0.75, 1)

		this.color      = 'rgba(' + colors.r + ', ' + colors.g + ', ' + colors.b + ', ' + colors.a + ')'
		this.destroying = false
		this.finalSize  = utils.randomInteger(0, playState.sizeMax)
		this.id         = Math.random().toString(36).substr(2, 5)
		this.isTarget   = this.determineTargetParticle()
		this.position   =
			x: particleGenerator.particlesOrigin.x
			y: particleGenerator.particlesOrigin.y
		this.size       = 1
		this.velocity   =
			x: utils.random(playState.velocityMin, playState.velocityMax)
			y: utils.random(playState.velocityMin, playState.velocityMax)

		if this.isTarget
			this.color     = 'rgba(' + colors.r + ', ' + colors.g + ', ' + colors.b + ', 0.8)'
			this.finalSize = utils.randomInteger(playState.minTargetSize, playState.sizeMax)

			this.velocity.x *= playState.targetVelocityMultiplier
			this.velocity.y *= playState.targetVelocityMultiplier

		@

	determineTargetParticle: ->

		isTarget = false

		if particleGenerator.particlesToTestForTaps.length < playState.maxTargetsAtOnce
			isTarget = utils.randomPercentage() < playState.chanceParticleIsTarget

		return isTarget

	draw: ->

		if this.outsideCanvasBounds()
			particleGenerator.particlesToDelete.push(this.id)

			return

		if this.isTarget
			this.lineWidth = this.size / 10

			if this.lineWidth > config.maxLineWidth
				this.lineWidth = config.maxLineWidth

			context.fillStyle = 'rgba(247, 247, 247, 0.9)'
			context.lineWidth = this.lineWidth

		context.beginPath()
		context.arc(this.position.x, this.position.y, this.half, 0, Math.PI * 2, true)
		context.fill()
		context.stroke() if this.isTarget
		context.closePath()

		@

	outsideCanvasBounds: ->

		beyondBoundsX = this.position.x < -(this.finalSize) or this.position.x > canvas.width  + this.finalSize
		beyondBoundsY = this.position.y < -(this.finalSize) or this.position.y > canvas.height + this.finalSize

		return beyondBoundsX or beyondBoundsY

	updateValues: ->

		if this.destroying
			shrinkMultiplier = if playState.playing then 0.7 else 0.9

			this.size *= shrinkMultiplier
		else
			if this.size < this.finalSize
				this.size *= playState.particleGrowthMultiplier

			if this.size > this.finalSize
				this.size = this.finalSize

		this.half = this.size / 2

		this.position.x += this.velocity.x
		this.position.y += this.velocity.y

		this.draw()

		@
