
class PlayStateClass

  defaults:
    comboMultiplier: 0
    level:           1
    score:           0

  reset: ->

    @chanceParticleIsTarget   = Config.chanceParticleIsTarget.easy
    @comboMultiplier          = @defaults.comboMultiplier
    @level                    = @defaults.level
    @maxTargetsAtOnce         = Config.maxTargetsAtOnce.easy
    @minTargetSize            = Config.minTargetSize.easy
    @particleGrowthMultiplier = Config.particleGrowthMultiplier.easy
    @particleSpawnChance      = Config.particleSpawnChance.easy
    @score                    = @defaults.score
    @sizeMax                  = Config.sizeMax.easy
    @targetVelocityMultiplier = Config.targetVelocityMultiplier.easy
    @velocityMin              = Config.velocityMin.easy
    @velocityMax              = Config.velocityMax.easy

    @update(true)

    Config.updateValuesForDifficulty()

    @setupLevelUpIncrement()

    return this

  stopLevelUpIncrement: ->

    window.clearInterval(@levelUpCounter)

    return this

  setupLevelUpIncrement: ->

    @levelUpCounter = window.setInterval =>

      @updateLevel()

      return

    , Config.levelUpInterval * 1000

    return this

  updateComboMultiplier: (targetHit) ->

    @comboMultiplier = if targetHit then @comboMultiplier + 1 else @defaults.comboMultiplier

    UI.updateComboMultiplierCounter()

    return this

  update: (newState) ->

    @playing = newState

    return this

  updateLevel: ->

    @level += 1

    if @level >= Config.maxLevel
      window.clearInterval(@levelUpCounter)

    UI.updateLevelCounter()
    Config.updateValuesForDifficulty()

    return this

  updateScore: (sizeWhenTapped, sizeWhenFullyGrown) ->

    #((defaultScorePerPop + (100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))) * comboMultiplier) * (levelNumber + 1)

    targetSizeBonus = Math.round(100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))
    popPointValue   = Config.pointsPerPop + targetSizeBonus
    levelMultiplier = @level + 1

    @score += (popPointValue * @comboMultiplier) * (levelMultiplier)

    UI.updateScoreCounter()

    return this
