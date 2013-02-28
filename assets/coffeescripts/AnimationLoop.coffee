AnimationLoop = Class.extend

	init: ->

		return

	cancelAnimationFrame: ->

		window.cancelAnimationFrame(animationLoopId)

		return

	requestAnimationFrame: ->

		self = this

		animationLoopId = window.requestAnimationFrame ->
			self.requestAnimationFrame()

			return

		canvas.width = canvas.width

		particleGenerator.generateParticle()
		particleGenerator.updateValuesAndDraw()
		particleGenerator.destroyParticlesOutsideCanvasBounds()

		return