
class ConfigClass

  chanceParticleIsTarget:
    easy:      50
    difficult: 90

  levelUpInterval: 5

  maxLevel: 50

  maxLineWidth: 5

  maxTargetsAtOnce:
    easy:      3
    difficult: 6

  particleGrowthMultiplier:
    easy:      1.05
    difficult: 1.10

  particleSpawnChance:
    easy:      60
    difficult: 100

  particleDiameterAsPercentageOfScreen: 15

  pointsPerPop: 10

  propertiesToUpdateWithDifficulty: [
    'particleSpawnChance'
    'chanceParticleIsTarget'
    'particleGrowthMultiplier'
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

    baseScreenWidth   = Math.min(body.clientWidth, body.clientHeight) / 100
    baseParticleWidth = Math.round(baseScreenWidth * @particleDiameterAsPercentageOfScreen)

    @baseParticleSize = baseParticleWidth * devicePixelRatio

    @minTargetSize =
      easy:      @baseParticleSize * 0.7
      difficult: @baseParticleSize * 0.4


    @sizeMax =
      easy:      @baseParticleSize
      difficult: @baseParticleSize * 0.6

    return this

  updateValuesForDifficulty: ->

    for property in @propertiesToUpdateWithDifficulty
      propertyConfig  = @[property]
      valueDifference = propertyConfig.difficult - propertyConfig.easy
      levelMulitplier = PlayState.level / @maxLevel

      PlayState[property] = (valueDifference * levelMulitplier) + propertyConfig.easy

    return this
