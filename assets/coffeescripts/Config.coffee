class Config

	init: ->

		this.maxLineWidth = 5
		this.levelUpInterval = 20
		this.maxLevel = 50
		this.pointsPerPop = 10

		this.chanceParticleIsTarget =
			easy: 2
			difficult: 3

		this.maxTargetsAtOnce =
			easy: 2
			difficult: 4

		this.minTargetSize =
			easy: 80
			difficult: 50

		this.particleGrowthMultiplier =
			easy: 1.05
			difficult: 1.10

		this.particleSpawnChance =
			easy: 40
			difficult: 100

		this.sizeMax =
			easy: 100
			difficult: 60

		this.targetVelocityMultiplier =
			easy: 0.3
			difficult: 0.5

		this.velocityMin =
			easy: -5
			difficult: -8

		this.velocityMax =
			easy: 5
			difficult: 8

		this.propertiesToUpdateWithDifficulty = [
			'particleSpawnChance',
			'chanceParticleIsTarget',
			'particleGrowthMultiplier',
			'sizeMax',
			'maxTargetsAtOnce',
			'minTargetSize',
			'velocityMin',
			'velocityMax'
			'targetVelocityMultiplier'
		]

		@

	updateValuesForDifficulty: ->

		for property in this.propertiesToUpdateWithDifficulty
			propertyConfig = this[property]

			valueDifference = propertyConfig.difficult - propertyConfig.easy
			levelMulitplier = state.level / this.maxLevel

			state[property] = (valueDifference * levelMulitplier) + propertyConfig.easy

		@