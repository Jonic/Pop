class AnimationLoop

	init: ->

		this.requestAnimationFrame()
		this.animationLoopId

		@

	cancelAnimationFrame: ->

		window.cancelAnimationFrame(this.animationLoopId)

		@

	requestAnimationFrame: ->

		self = this

		this.animationLoopId = window.requestAnimationFrame ->

			self.requestAnimationFrame()

			return

		canvas.width = canvas.width

		particleGenerator.animationLoopActions()

		@