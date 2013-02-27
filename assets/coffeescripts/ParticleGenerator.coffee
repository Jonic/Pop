ParticleGenerator = Class.extend

    init: ->

        this.particlesOrigin =
            x: canvas.width / 2
            y: canvas.height / 2

        this.particlesArray = []
        this.particlesArrayIds = []
        this.particlesToDelete = []
        this.particlesToTestForTaps = []

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

        if targetHit
            headsUp.updateScore(particle.size, particle.finalSize)
            comboMultiplier = headsUp.comboMultiplier + 1
        else
            comboMultiplier = 1

        headsUp.updateComboMultiplierCounter(comboMultiplier)

        return

    particleWasTapped: (particle, touchData) ->

        tapX = touchData.pageX * devicePixelRatio
        tapY = touchData.pageY * devicePixelRatio

        utils.updateUITextNode(headsUp.tapX, tapX)
        utils.updateUITextNode(headsUp.tapY, tapY)

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

        return

    setupParticleTapDetection: ->

        self = this

        this.particlesToTestForTaps = []

        window.addEventListener 'touchstart', ->
            self.particleTapDetectionHandler()

            return

        return

    start: ->

        this.comboMultiplierCounter.text(headsUp.comboMultiplier)

        this.requestAnimationFrame()

        return

    updateValuesAndDraw: ->

        for particle in this.particlesArray
            context.fillStyle = particle.color
            context.strokeStyle = particle.color

            particle.draw()
            particle.updateValues()

        return