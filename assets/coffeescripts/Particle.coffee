Particle = Class.extend

    init: ->

        self = this

        colors =
            r: utils.randomInteger(0, 255)
            g: utils.randomInteger(0, 255)
            b: utils.randomInteger(0, 255)
            a: utils.random(0.8, 1)

        this.color = 'rgba(' + colors.r + ', ' + colors.g + ', ' + colors.b + ', ' + colors.a + ')'

        this.size = 1
        this.finalSize = utils.randomInteger(config.sizeMin, config.sizeMax)
        this.half = Math.round(this.size / 2)

        this.position =
            x: particleGenerator.particlesOrigin.x
            y: particleGenerator.particlesOrigin.y

        this.velocity =
            x: utils.random(config.velocityMin, config.velocityMax)
            y: utils.random(config.velocityMin, config.velocityMax)

        this.id = Math.random().toString(36).substr(2, 5)
        this.isTarget = this.determineTargetParticle()

        if this.isTarget
            this.color = 'rgb(' + colors.r + ', ' + colors.g + ', ' + colors.b + ')'
            this.velocity.x = this.velocity.x * config.targetVelocityMultiplier
            this.velocity.y = this.velocity.y * config.targetVelocityMultiplier
            this.lineWidth = 1;

            particleGenerator.particlesToTestForTaps.push(this.id)

        return

    determineTargetParticle: ->

        if this.finalSize >= config.minTargetSize
            Math.floor(Math.random() * 101) < config.chanceParticleIsTarget

    draw: ->

        if this.withinCanvasBounds()
            context.beginPath()
            context.arc(this.position.x, this.position.y, this.half, 0, Math.PI * 2, true)

            if this.isTarget
                context.fillStyle = 'rgb(255, 255, 255)'
                context.lineWidth = this.lineWidth
                context.stroke()

                if this.lineWidth < config.maxLineWidth
                    this.lineWidth = this.lineWidth * 1.1
                else if this.lineWidth > config.maxLineWidth
                    this.lineWidth = config.maxLineWidth

            context.fill()
            context.closePath()
        else
            particleGenerator.particlesToDelete.push(this.id)

        return

    updateValues: ->

        if this.size < this.finalSize
            this.size = this.size * config.particleGrowthMultiplier

        if this.size > this.finalSize
            this.size = this.finalSize

        this.half = Math.round(this.size / 2)

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        return

    withinCanvasBounds: ->

        beyondBoundsX = this.position.x < -(this.size) or this.position.x > canvas.width  + this.size
        beyondBoundsY = this.position.y < -(this.size) or this.position.y > canvas.height + this.size

        !(beyondBoundsX or beyondBoundsY)