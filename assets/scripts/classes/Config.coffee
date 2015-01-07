
class ConfigClass

  chanceBubbleIsTarget:
    easy:      50
    difficult: 90

  levelUpInterval: 5

  maxLevel: 50

  maxLineWidth: 5

  maxTargetsAtOnce:
    easy:      3
    difficult: 6

  bubbleGrowthMultiplier:
    easy:      1.05
    difficult: 1.10

  bubbleSpawnChance:
    easy:      60
    difficult: 100

  bubbleDiameterAsPercentageOfScreen: 15

  pointsPerPop: 10

  propertiesToUpdateWithDifficulty: [
    'bubbleSpawnChance'
    'chanceBubbleIsTarget'
    'bubbleGrowthMultiplier'
    'sizeMax'
    'maxTargetsAtOnce'
    'minTargetSize'
    'velocityMin'
    'velocityMax'
    'targetVelocityMultiplier'
  ]

  targetVelocityMultiplier:
    easy:      0.3
    difficult: 0.5

  velocityMin:
    easy:      -6
    difficult: -10

  velocityMax:
    easy:      6
    difficult: 10

  constructor: ->

    baseScreenWidth = Math.min(body.clientWidth, body.clientHeight) / 100
    baseBubbleWidth = Math.round(baseScreenWidth * @bubbleDiameterAsPercentageOfScreen)
    @baseBubbleSize = baseBubbleWidth * devicePixelRatio

    @minTargetSize =
      easy:      @baseBubbleSize * 0.7
      difficult: @baseBubbleSize * 0.4

    @sizeMax =
      easy:      @baseBubbleSize
      difficult: @baseBubbleSize * 0.6

    return this

  updateValuesForDifficulty: ->

    @propertiesToUpdateWithDifficulty.map (property) =>
      propertyConfig  = @[property]
      valueDifference = propertyConfig.difficult - propertyConfig.easy
      levelMulitplier = PlayState.level / @maxLevel

      PlayState[property] = (valueDifference * levelMulitplier) + propertyConfig.easy

      return

    return this
