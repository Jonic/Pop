State = Class.extend

	init: ->

		this.defaults =
			level: 1
			score: 0
			comboMultiplier: 0

		return

	setup: ->

		this.reset()

		config.updateValuesForDifficulty()

		return

	setupLevelUpIncrement: ->

		self = this

		this.levelUpCounter = window.setInterval ->
			self.updateLevel()
			return
		, config.levelUpInterval * 1000

		return

	reset: ->

		window.clearInterval this.levelUpCounter

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

		return

	updateComboMultiplier: (targetHit) ->

		state.comboMultiplier = if targetHit then state.comboMultiplier + 1 else 1

		headsUp.updateComboMultiplierCounter()

		return

	updateGameState: (newState) ->

		this.gameState = newState

		return

	updateLevel: ->

		this.level += 1

		if this.level >= config.maxLevel
			window.clearInterval this.levelUpCounter

		headsUp.updateLevelCounter()
		config.updateValuesForDifficulty()

		return

	updateScore: (sizeWhenTapped, sizeWhenFullyGrown) ->

		#((defaultScorePerPop + (100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))) * comboMultiplier) * (levelNumber + 1)

		targetSizeBonus = Math.round(100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))
		popPointValue = config.pointsPerPop + targetSizeBonus
		levelMultiplier = this.level + 1

		this.score += (popPointValue * this.comboMultiplier) * (levelMultiplier)

		headsUp.updateScoreCounter()

		return