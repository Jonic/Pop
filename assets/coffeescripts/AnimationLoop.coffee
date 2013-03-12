class AnimationLoop

	init: ->

		this.requestAnimationFrame()

		@

	cancelAnimationFrame: ->

		window.cancelAnimationFrame(animationLoopId)

		@

	requestAnimationFrame: ->

		self = this

		animationLoopId = window.requestAnimationFrame ->
			self.requestAnimationFrame()

			return

		canvas.width = canvas.width

		particleGenerator.animationLoopActions()

		@