/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class PlayingScene extends Scene {
  constructor() {
    super(...arguments)

    this.id = 'playing'
    this.updatesInBackGround = true
    this.levelUpInterval = 5000
    this.maxLevel = 50
    this.maxDiameterAsPercentageOfScreen = 15
    this.maxLineWidth = 5
    this.pointsPerPop = 10

    return this
  }

  load() {
    super.load(...arguments)

    this.ui.registerElement('comboMultiplierCounter', '.hud-value-combo')
    this.ui.registerElement('levelCounter', '.hud-value-level')
    this.ui.registerElement('scoreCounter', '.hud-value-score')

    this.comboMultiplier = 0
    this.level = 1
    this.score = 0

    this.setupLevelUpIncrement()

    this.setHeadsUpValues()

    this.targetBubblesCount = 0

    this.playing = true

    this.setupDifficultyConfig()

    return this
  }

  decrementTargetBubblesCount() {
    this.targetBubblesCount -= 1

    if (this.targetBubblesCount < 0) {
      this.targetBubblesCount = 0
    }

    return this
  }

  gameOver() {
    this.ui.transitionTo('game-over')
    this.input.removeAllEntities()

    return this
  }

  generateBubble() {
    if (
      this.playing &&
      randomPercentage() < this.difficultyConfig.bubbleSpawnChance.current
    ) {
      const bubbleConfig = this.newBubbleConfig()
      const bubble = new BubbleEntity(this, bubbleConfig)

      if (bubble.isTarget) {
        this.addEntity(bubble)
        this.input.addEntity(bubble)
      } else {
        this.addEntity(bubble, true)
      }

      if (bubble.isTarget) {
        this.targetBubblesCount += 1
      }
    }

    return this
  }

  newBubbleConfig() {
    return {
      bubbleGrowthMultiplier: this.difficultyConfig.bubbleGrowthMultiplier
        .current,
      chanceBubbleIsTarget: this.difficultyConfig.chanceBubbleIsTarget.current,
      diameterMax: this.difficultyConfig.diameterMax.current,
      maxTargetsAtOnce: this.difficultyConfig.maxTargetsAtOnce.current,
      minTargetDiameter: this.difficultyConfig.minTargetDiameter.current,
      targetVelocityMultiplier: this.difficultyConfig.targetVelocityMultiplier
        .current,
      velocityMax: this.difficultyConfig.velocityMax.current,
      velocityMin: this.difficultyConfig.velocityMin.current,
      maxLineWidth: this.maxLineWidth,
      playing: this.playing,
      targetBubblesCount: this.targetBubblesCount,
    }
  }

  setupDifficultyConfig() {
    const maxDiameter =
      this.device.screen.width / 100 * this.maxDiameterAsPercentageOfScreen

    this.difficultyConfig = {
      bubbleGrowthMultiplier: { current: 0, easy: 1.05, difficult: 1.1 },
      bubbleSpawnChance: { current: 0, easy: 60, difficult: 100 },
      chanceBubbleIsTarget: { current: 0, easy: 50, difficult: 90 },
      diameterMax: {
        current: 0,
        easy: maxDiameter,
        difficult: maxDiameter * 0.6,
      },
      maxTargetsAtOnce: { current: 0, easy: 3, difficult: 6 },
      minTargetDiameter: {
        current: 0,
        easy: maxDiameter * 0.7,
        difficult: maxDiameter * 0.4,
      },
      targetVelocityMultiplier: { current: 0, easy: 0.3, difficult: 0.5 },
      velocityMax: { current: 0, easy: 4, difficult: 7 },
      velocityMin: { current: 0, easy: -4, difficult: -7 },
    }

    this.updateValuesForDifficulty()

    return this
  }

  setHeadsUpValues() {
    updateUITextNode(
      this.ui.element('comboMultiplierCounter'),
      this.comboMultiplier,
    )
    updateUITextNode(this.ui.element('levelCounter'), this.level)
    updateUITextNode(
      this.ui.element('scoreCounter'),
      formatWithComma(this.score),
    )

    return this
  }

  setupLevelUpIncrement() {
    this.levelUpCounter = window.setInterval(() => {
      this.updateLevel()
    }, this.levelUpInterval)

    return this
  }

  stopLevelUpIncrement() {
    window.clearInterval(this.levelUpCounter)

    return this
  }

  unload() {
    if (this.playing === true) {
      for (let bubble of Array.from(this.entities)) {
        bubble.destroying = true
      }

      this.playing = false

      return this.stopLevelUpIncrement()
    }
  }

  update() {
    super.update(...arguments)

    this.generateBubble()

    return this
  }

  updateComboMultiplier(targetHit) {
    if (targetHit) {
      this.comboMultiplier += 1
    } else {
      this.comboMultiplier = 0
    }

    this.setHeadsUpValues()

    return this
  }

  updateLevel() {
    this.level += 1

    if (this.level >= this.maxLevel) {
      window.clearInterval(this.levelUpCounter)
    }

    this.setHeadsUpValues()

    this.updateValuesForDifficulty()

    return this
  }

  updateScore(sizeWhenTapped, sizeWhenFullyGrown) {
    // ((defaultScorePerPop + (100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))) * comboMultiplier) * (levelNumber + 1)

    const targetSizeBonus = Math.round(
      100 - sizeWhenTapped / sizeWhenFullyGrown * 100,
    )
    const popPointValue = this.pointsPerPop + targetSizeBonus
    const levelMultiplier = this.level + 1

    this.score += popPointValue * this.comboMultiplier * levelMultiplier

    this.setHeadsUpValues()

    return this
  }

  updateValuesForDifficulty() {
    const levelMulitplier = this.level / this.maxLevel

    for (let propertyName in this.difficultyConfig) {
      const propertyValues = this.difficultyConfig[propertyName]
      const valueDifference = propertyValues.difficult - propertyValues.easy
      const adjustedValue =
        valueDifference * levelMulitplier + propertyValues.easy

      this.difficultyConfig[propertyName].current = adjustedValue
    }

    return this
  }
}
