HeadsUp = Class.extend

    init: ->

        this.levelCounter = '.level'
        this.scoreCounter = '.score'
        this.comboMultiplierCounter = '.combo'

        this.tapX = '.tapX'
        this.tapY = '.tapY'

        return

    reset: ->

        window.clearInterval this.levelUpCounter

        return

    setToInitialValues: ->

        self = this

        this.level = 1
        this.score = 0
        this.comboMultiplier = 1

        utils.updateUITextNode(this.levelCounter, this.level)
        utils.updateUITextNode(this.scoreCounter, this.score)
        utils.updateUITextNode(this.comboMultiplierCounter, this.comboMultiplier)

        this.levelUpCounter = window.setInterval ->
            self.updateLevel()
            return
        , config.levelUpInterval * 1000

        return

    updateComboMultiplierCounter: (comboMultiplier) ->

        headsUp.comboMultiplier = comboMultiplier

        utils.updateUITextNode(this.comboMultiplierCounter, this.comboMultiplier)

        return

    updateLevel: ->

        this.level += 1

        utils.updateUITextNode(this.levelCounter, this.level)

        if this.level >= config.maxLevel
            window.clearInterval this.levelUpCounter

        return

    updateScore: (sizeWhenTapped, sizeWhenFullyGrown) ->

        #((defaultScorePerPop + (100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))) * comboMultiplier) * (levelNumber + 1)

        targetSizeBonus = Math.round(100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))
        popPointValue = config.pointsPerPop + targetSizeBonus
        levelMultiplier = this.level + 1

        this.score += (popPointValue * this.comboMultiplier) * (levelMultiplier)

        utils.updateUITextNode(this.scoreCounter, this.score)

        return