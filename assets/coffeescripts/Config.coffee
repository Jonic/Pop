class Config

	maxLineWidth: 5
	levelUpInterval: 20
	maxLevel: 50
	pointsPerPop: 10

	chanceParticleIsTarget:
		easy: 2
		difficult: 3

	maxTargetsAtOnce:
		easy: 2
		difficult: 4

	minTargetSize:
		easy: 80
		difficult: 50

	particleGrowthMultiplier:
		easy: 1.05
		difficult: 1.10

	particleSpawnChance:
		easy: 40
		difficult: 100

	sizeMax:
		easy: 100
		difficult: 60

	targetVelocityMultiplier:
		easy: 0.3
		difficult: 0.5

	velocityMin:
		easy: -5
		difficult: -8

	velocityMax:
		easy: 5
		difficult: 8

	propertiesToUpdateWithDifficulty: [
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

	updateValuesForDifficulty: ->

		for property in this.propertiesToUpdateWithDifficulty
			propertyConfig = this[property]

			valueDifference = propertyConfig.difficult - propertyConfig.easy
			levelMulitplier = state.level / this.maxLevel

			state[property] = (valueDifference * levelMulitplier) + propertyConfig.easy

		@