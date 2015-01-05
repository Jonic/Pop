
class PlayState

	init: ->

		this.defaults =
			level:           1
			score:           0
			comboMultiplier: 0

		@

	stopLevelUpIncrement: ->

		window.clearInterval(this.levelUpCounter)

		@

	setupLevelUpIncrement: ->

		self = this

		this.levelUpCounter = window.setInterval ->

			self.updateLevel()

			return

		, config.levelUpInterval * 1000

		@

	setToInitialState: ->

		this.level                    = this.defaults.level
		this.chanceParticleIsTarget   = config.chanceParticleIsTarget.easy
		this.comboMultiplier          = this.defaults.comboMultiplier
		this.maxTargetsAtOnce         = config.maxTargetsAtOnce.easy
		this.minTargetSize            = config.minTargetSize.easy
		this.particleGrowthMultiplier = config.particleGrowthMultiplier.easy
		this.particleSpawnChance      = config.particleSpawnChance.easy
		this.score                    = this.defaults.score
		this.sizeMax                  = config.sizeMax.easy
		this.targetVelocityMultiplier = config.targetVelocityMultiplier.easy
		this.velocityMin              = config.velocityMin.easy
		this.velocityMax              = config.velocityMax.easy

		this.update(true)

		config.updateValuesForDifficulty()

		this.setupLevelUpIncrement()

		@

	updateComboMultiplier: (targetHit) ->

		this.comboMultiplier = if targetHit then this.comboMultiplier + 1 else this.defaults.comboMultiplier

		ui.updateComboMultiplierCounter()

		@

	update: (newState) ->

		this.playing = newState

		@

	updateLevel: ->

		this.level += 1

		if this.level >= config.maxLevel
			window.clearInterval(this.levelUpCounter)

		ui.updateLevelCounter()
		config.updateValuesForDifficulty()

		@

	updateScore: (sizeWhenTapped, sizeWhenFullyGrown) ->

		#((defaultScorePerPop + (100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))) * comboMultiplier) * (levelNumber + 1)

		targetSizeBonus = Math.round(100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))
		popPointValue   = config.pointsPerPop + targetSizeBonus
		levelMultiplier = this.level + 1

		this.score += (popPointValue * this.comboMultiplier) * (levelMultiplier)

		ui.updateScoreCounter()

		@
