
class ParticleGeneratorClass

  constructor: ->

    @particlesArray         = []
    @particlesArrayIds      = []
    @particlesToDelete      = []
    @particlesToTestForTaps = []

    @particlesOrigin =
      x: canvas.width  / 2
      y: canvas.height / 2

    @registerParticleTapDetectionHandler()

    return this

  animationLoopActions: ->

    if PlayState.playing
      @generateParticle()

    @updateParticlesValues()
    @removeParticlesAfterTap()

    if @particlesToDelete.length > 0
      @destroyParticlesOutsideCanvasBounds()

    return this

  destroyParticlesOutsideCanvasBounds: ->

    @particlesToDelete.map (particleId) =>
      particleIndex = @particlesArrayIds.indexOf(particleId)
      particle      = @particlesArray[particleIndex]

      if particle?
        @gameOver() if particle.isTarget
        @removeParticle(particle)

    @particlesToDelete = []

    return this

  gameOver: ->

    @stop()

    @particlesArray.map (particle) =>
      particle.destroying = true

    PlayState.particleSpawnChance = 0

    Game.over()

    return this

  generateParticle: ->

    if Utils.randomPercentage() < PlayState.particleSpawnChance
      particle = new ParticleClass()

      @particlesArray.push(particle)
      @particlesArrayIds.push(particle.id)

      if particle.isTarget
        @particlesToTestForTaps.unshift(particle.id)

    return this

  particleTapDetectionHandler: () ->

    targetHit = false
    particle  = false

    @particlesToTestForTaps.map (particleId) =>
      particleIndex = @particlesArrayIds.indexOf(particleId)
      particle      = @particlesArray[particleIndex]
      touchData     = Input.getTouchData(event)

      if particle? and particle.wasTapped(touchData)
        deletionIndex       = @particlesToTestForTaps.indexOf(particleId)
        particle.destroying = true
        targetHit           = true

        @particlesToTestForTaps.splice(deletionIndex, 1)

        return

    PlayState.updateComboMultiplier(targetHit)

    PlayState.updateScore(particle.size, particle.finalSize) if targetHit

    return this

  registerParticleTapDetectionHandler: ->

    Input.registerHandler '.ui-playing', inputVerb, ->
      ParticleGenerator.particleTapDetectionHandler()
    , ['playing']

    return this

  removeParticle: (particle) ->

    id    = particle.id
    index = @particlesArrayIds.indexOf(id)

    @particlesArray.splice(index, 1)
    @particlesArrayIds.splice(index, 1)

    return this

  removeParticlesAfterTap: ->

    @particlesArray.map (particle) =>
      @removeParticle(particle) if particle.size < 1

      return

    return this

  reset: ->

    @particlesArray         = []
    @particlesArrayIds      = []
    @particlesToDelete      = []
    @particlesToTestForTaps = []

    return this

  stop: ->

    PlayState.update(false)
    PlayState.stopLevelUpIncrement()

    return this

  updateParticlesValues: ->

    @particlesArray.map (particle) =>
      context.fillStyle   = particle.color
      context.strokeStyle = particle.color

      particle.updateValues()

      return

    return this
