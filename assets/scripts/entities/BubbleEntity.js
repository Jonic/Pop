class BubbleEntity extends Entity {
  constructor(parent, configValues) {
    super(...arguments)

    this.parent = parent
    this.configValues = configValues

    this.height = 0
    this.id = `bubble_${Math.random()
      .toString(36)
      .substr(2, 5)}`
    this.position = {
      x: this.device.screen.width / 2,
      y: this.device.screen.height / 2,
    }
    this.velocity = {
      x: random(this.configValues.velocityMin, this.configValues.velocityMax),
      y: random(this.configValues.velocityMin, this.configValues.velocityMax),
    }
    this.width = 0

    this.alpha = 0.75
    this.color = randomColor()
    this.destroying = false
    this.diameter = 1
    this.fillColor = this.color
    this.strokeColor = this.color
    this.finalDiameter = randomInteger(0, configValues.diameterMax)
    this.isTarget = this.determineTargetBubble()
    this.radius = 0.5
    this.shrinkMultiplier = 0.9

    if (this.isTarget) {
      this.alpha = 0.9
      this.fillColor = '240, 240, 240'
      this.finalDiameter = randomInteger(
        this.configValues.minTargetDiameter,
        this.configValues.diameterMax,
      )
      this.lineWidth = this.diameter / 10

      this.velocity.x *= this.configValues.targetVelocityMultiplier
      this.velocity.y *= this.configValues.targetVelocityMultiplier
    }

    return this
  }

  canvasExitCallback() {
    super.canvasExitCallback(...arguments)

    if (this.isTarget) {
      this.parent.gameOver()
    }

    return this
  }

  determineTargetBubble() {
    if (
      this.configValues.targetBubblesCount < this.configValues.maxTargetsAtOnce
    ) {
      return randomPercentage() < this.configValues.chanceBubbleIsTarget
    }

    return false
  }

  render() {
    this.context.lineWidth = this.lineWidth
    this.context.fillStyle = rgba(this.fillColor, this.alpha)
    this.context.strokeStyle = rgba(this.strokeColor, this.alpha)

    this.context.beginPath()
    this.context.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      true,
    )
    this.context.fill()
    if (this.isTarget) {
      this.context.stroke()
    }
    this.context.closePath()

    return this
  }

  tapHandler(targetHit) {
    this.parent.updateComboMultiplier(targetHit)

    if (targetHit) {
      this.parent.updateScore(this.diameter, this.finalDiameter)
      this.destroying = true
      this.parent.decrementTargetBubblesCount()
      this.input.queueEntityForRemoval(this.id)
    }

    return this
  }

  update() {
    super.update(...arguments)

    if (this.destroying) {
      this.diameter *= this.parent.playing ? 0.6 : this.shrinkMultiplier

      if (this.diameter < 1) {
        this.removeSelfFromParent()
      }
    } else if (this.diameter < this.finalDiameter) {
      this.diameter *= this.configValues.bubbleGrowthMultiplier
    }

    this.diameter = clamp(this.diameter, 0, this.finalDiameter)
    if (this.isTarget) {
      this.lineWidth = clamp(
        this.diameter / 10,
        0,
        this.configValues.maxLineWidth,
      )
    }

    this.height = this.diameter
    this.width = this.diameter
    this.radius = this.diameter / 2

    this.position.x += this.animationLoop.correctValue(this.velocity.x)
    this.position.y += this.animationLoop.correctValue(this.velocity.y)

    this.addSelfToRenderQueue()

    return this
  }

  wasTapped() {
    let message
    const { touchData } = this.input

    const tapX = touchData.x
    const tapY = touchData.y
    const distanceX = tapX - this.position.x
    const distanceY = tapY - this.position.y
    const tapped =
      distanceX * distanceX + distanceY * distanceY < this.radius * this.radius

    if (tapped) {
      message = `Bubble#${this.id} tapped at ${tapX}, ${tapY}`
    } else {
      message = 'Combo Broken!'
    }

    debugConsole(message)

    return tapped
  }
}
