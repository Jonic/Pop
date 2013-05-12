class Config

	init: ->

		this.particleWidthAsPercentageOfScreen = 15

		baseScreenWidth = Math.min(document.body.clientWidth, document.body.clientHeight)
		baseParticleWidth = Math.round((baseScreenWidth / 100) * this.particleWidthAsPercentageOfScreen)

		this.baseParticleSize = baseParticleWidth * devicePixelRatio

		this.maxLineWidth = 5
		this.levelUpInterval = 5
		this.maxLevel = 50
		this.pointsPerPop = 10

		this.chanceParticleIsTarget =
			easy: 50
			difficult: 90

		this.maxTargetsAtOnce =
			easy: 3
			difficult: 6

		this.minTargetSize =
			easy: this.baseParticleSize * 0.7
			difficult: this.baseParticleSize * 0.4

		this.particleGrowthMultiplier =
			easy: 1.05
			difficult: 1.10

		this.particleSpawnChance =
			easy: 60
			difficult: 100

		this.sizeMax =
			easy: this.baseParticleSize
			difficult: this.baseParticleSize * 0.6

		this.targetVelocityMultiplier =
			easy: 0.3
			difficult: 0.5

		this.velocityMin =
			easy: -6
			difficult: -10

		this.velocityMax =
			easy: 6
			difficult: 10

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