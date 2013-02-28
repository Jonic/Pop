Config = Class.extend

	init: ->

		this.maxLineWidth = 10
		this.levelUpInterval = 20
		this.maxLevel = 50
		this.pointsPerPop = 10

		this.particleSpawnChance =
			easy: 60
			difficult: 100

		this.chanceParticleIsTarget =
			easy: 2
			difficult: 5

		this.particleGrowthMultiplier =
			easy: 1.05
			difficult: 1.5

		this.sizeMax =
			easy: 80
			difficult: 40

		this.minTargetSize =
			easy: 80
			difficult: 30

		this.velocityMin =
			easy: -5
			difficult: -15

		this.velocityMax =
			easy: 5
			difficult: 15

		this.targetVelocityMultiplier =
			easy: 0.3
			difficult: 1

		this.propertiesToUpdateWithDifficulty = [
			'particleSpawnChance',
			'chanceParticleIsTarget',
			'particleGrowthMultiplier',
			'sizeMax',
			'minTargetSize',
			'velocityMin',
			'velocityMax'
			'targetVelocityMultiplier'
		]

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

	updateValuesForDifficulty: ->

		for property in this.propertiesToUpdateWithDifficulty
			propertyConfig = this[property]

			valueDifference = propertyConfig.difficult - propertyConfig.easy
			levelMulitplier = state.level / this.maxLevel

			state[property] = (valueDifference * levelMulitplier) + propertyConfig.easy

		return