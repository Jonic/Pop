###jshint plusplus:false, forin:false ###
###global Class ###
###global dat ###

'use strict'

Config = Class.extend
	init: ->

		this.particleSpawnChance = 100
		this.chanceParticleIsTarget = 5
		this.particleGrowthMultiplier = 1.05
		this.maxLineWidth = 10
		this.levelUpInterval = 15
		this.maxLevel = 50
		this.pointsPerPop = 10

		this.sizeMin = 0
		this.sizeMax = 70

		this.minTargetSize = 40

		this.velocityMin = -5
		this.velocityMax = 5

		this.targetVelocityMultiplier = 0.3

		this.setupDatGui()

		return

	setupDatGui: ->

		gui = new dat.GUI()

		environment = gui.addFolder('Environment')
		environment.add(this, 'chanceParticleIsTarget', 0, 100)
		environment.add(this, 'particleSpawnChance', 0, 100)
		environment.add(this, 'maxLineWidth')


		size = gui.addFolder('Size')
		size.add(this, 'minTargetSize', 40)
		size.add(this, 'sizeMin', 0)
		size.add(this, 'sizeMax', 70)

		velocity = gui.addFolder('Velocity')
		velocity.add(this, 'targetVelocityMultiplier', 0.3)
		velocity.add(this, 'velocityMin', -5)
		velocity.add(this, 'velocityMax', 5)

		return
