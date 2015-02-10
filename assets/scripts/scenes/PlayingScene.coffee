
class PlayingScene extends Scene

  constructor: ->

    super

    @id                              = 'playing'
    @updatesInBackGround             = true
    @levelUpInterval                 = 5000
    @maxLevel                        = 50
    @maxDiameterAsPercentageOfScreen = 15
    @maxLineWidth                    = 5
    @pointsPerPop                    = 10

    return this

  load: ->

    super

    @ui.registerElement('comboMultiplierCounter', '.hud-value-combo')
    @ui.registerElement('levelCounter',           '.hud-value-level')
    @ui.registerElement('scoreCounter',           '.hud-value-score')

    @comboMultiplier = 0
    @level           = 1
    @score           = 0

    @setupLevelUpIncrement()

    @setHeadsUpValues()

    @targetBubblesCount = 0

    @playing = true

    @setupDifficultyConfig()

    return this

  decrementTargetBubblesCount: ->

    @targetBubblesCount -= 1

    if @targetBubblesCount < 0
      @targetBubblesCount = 0

    return this

  gameOver: ->

    @ui.transitionTo('game-over')
    @input.removeAllEntities()

    return this

  generateBubble: ->

    if @playing && randomPercentage() < @difficultyConfig['bubbleSpawnChance'].current
      bubbleConfig = @newBubbleConfig()
      bubble       = new BubbleEntity(this, bubbleConfig)

      if bubble.isTarget
        @addEntity(bubble)
        @input.addEntity(bubble)
      else
        @addEntity(bubble, true)

      @targetBubblesCount += 1 if bubble.isTarget

    return this

  newBubbleConfig: ->

    return {
      bubbleGrowthMultiplier:   @difficultyConfig['bubbleGrowthMultiplier'].current
      chanceBubbleIsTarget:     @difficultyConfig['chanceBubbleIsTarget'].current
      diameterMax:              @difficultyConfig['diameterMax'].current
      maxTargetsAtOnce:         @difficultyConfig['maxTargetsAtOnce'].current
      minTargetDiameter:        @difficultyConfig['minTargetDiameter'].current
      targetVelocityMultiplier: @difficultyConfig['targetVelocityMultiplier'].current
      velocityMax:              @difficultyConfig['velocityMax'].current
      velocityMin:              @difficultyConfig['velocityMin'].current
      maxLineWidth:             @maxLineWidth
      playing:                  @playing
      targetBubblesCount:       @targetBubblesCount
    }

  setupDifficultyConfig: ->

    maxDiameter = (@device.screen.width / 100) * @maxDiameterAsPercentageOfScreen

    @difficultyConfig =
      bubbleGrowthMultiplier:   { current: 0, easy: 1.05,              difficult: 1.10              }
      bubbleSpawnChance:        { current: 0, easy: 60,                difficult: 100               }
      chanceBubbleIsTarget:     { current: 0, easy: 50,                difficult: 90                }
      diameterMax:              { current: 0, easy: maxDiameter,       difficult: maxDiameter * 0.6 }
      maxTargetsAtOnce:         { current: 0, easy: 3,                 difficult: 6                 }
      minTargetDiameter:        { current: 0, easy: maxDiameter * 0.7, difficult: maxDiameter * 0.4 }
      targetVelocityMultiplier: { current: 0, easy: 0.3,               difficult: 0.5               }
      velocityMax:              { current: 0, easy: 6,                 difficult: 10                }
      velocityMin:              { current: 0, easy: -6,                difficult: -10               }

    @updateValuesForDifficulty()

    return this

  setHeadsUpValues: ->

    updateUITextNode(@ui.element('comboMultiplierCounter'), @comboMultiplier)
    updateUITextNode(@ui.element('levelCounter'),           @level)
    updateUITextNode(@ui.element('scoreCounter'),           formatWithComma(@score))

    return this

  setupLevelUpIncrement: ->

    @levelUpCounter = window.setInterval =>
      @updateLevel()
      return
    , @levelUpInterval

    return this

  stopLevelUpIncrement: ->

    window.clearInterval(@levelUpCounter)

    return this

  unload: ->

    if @playing == true
      for bubble in @entities
        bubble.destroying = true

      @playing = false

      @stopLevelUpIncrement()

  update: ->

    super

    @generateBubble()

    return this

  updateComboMultiplier: (targetHit) ->

    if targetHit
      @comboMultiplier += 1
    else
      @comboMultiplier = 0

    @setHeadsUpValues()

    return this

  updateLevel: ->

    @level += 1

    if @level >= @maxLevel
      window.clearInterval(@levelUpCounter)

    @setHeadsUpValues()

    @updateValuesForDifficulty()

    return this

  updateScore: (sizeWhenTapped, sizeWhenFullyGrown) ->

    #((defaultScorePerPop + (100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))) * comboMultiplier) * (levelNumber + 1)

    targetSizeBonus = Math.round(100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))
    popPointValue   = @pointsPerPop + targetSizeBonus
    levelMultiplier = @level + 1

    @score += (popPointValue * @comboMultiplier) * levelMultiplier

    @setHeadsUpValues()

    return this

  updateValuesForDifficulty: ->

    levelMulitplier = @level / @maxLevel

    for propertyName, propertyValues of @difficultyConfig
      valueDifference = propertyValues.difficult - propertyValues.easy
      adjustedValue   = (valueDifference * levelMulitplier) + propertyValues.easy

      @difficultyConfig[propertyName].current = adjustedValue

    return this
