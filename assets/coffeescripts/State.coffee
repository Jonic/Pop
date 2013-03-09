class State

	defaults:
		level: 1
		score: 0
		comboMultiplier: 0

	setup: ->

		this.reset()

		config.updateValuesForDifficulty()

		state.setupLevelUpIncrement()

		@

	stopLevelUpIncrement: ->

		window.clearInterval this.levelUpCounter

		@

	setupLevelUpIncrement: ->

		self = this

		this.levelUpCounter = window.setInterval ->
			self.updateLevel()

			return
		, config.levelUpInterval * 1000

		@

	reset: ->

		this.stopLevelUpIncrement()

		this.level = this.defaults.level
		this.score = this.defaults.score
		this.comboMultiplier = this.defaults.comboMultiplier

		this.chanceParticleIsTarget = config.chanceParticleIsTarget.easy
		this.maxTargetsAtOnce = config.maxTargetsAtOnce.easy
		this.minTargetSize = config.minTargetSize.easy
		this.particleGrowthMultiplier = config.particleGrowthMultiplier.easy
		this.particleSpawnChance = config.particleSpawnChance.easy
		this.sizeMax = config.sizeMax.easy
		this.targetVelocityMultiplier = config.targetVelocityMultiplier.easy
		this.velocityMin = config.velocityMin.easy
		this.velocityMax = config.velocityMax.easy

		@

	updateComboMultiplier: (targetHit) ->

		this.comboMultiplier = if targetHit then this.comboMultiplier + 1 else this.defaults.comboMultiplier

		headsUp.updateComboMultiplierCounter()

		@

	updateGameState: (newState) ->

		this.gameState = newState

		@

	updateLevel: ->

		this.level += 1

		if this.level >= config.maxLevel
			window.clearInterval this.levelUpCounter

		headsUp.updateLevelCounter()
		config.updateValuesForDifficulty()

		@

	updateScore: (sizeWhenTapped, sizeWhenFullyGrown) ->

		#((defaultScorePerPop + (100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))) * comboMultiplier) * (levelNumber + 1)

		targetSizeBonus = Math.round(100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))
		popPointValue = config.pointsPerPop + targetSizeBonus
		levelMultiplier = this.level + 1

		this.score += (popPointValue * this.comboMultiplier) * (levelMultiplier)

		headsUp.updateScoreCounter()

		@