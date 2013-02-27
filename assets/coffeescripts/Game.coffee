Game = Class.extend

    init: ->

        config.setupDatGui() if debug

        return

    run: ->

        animationLoop.requestAnimationFrame()

        headsUp.setToInitialValues()
        scenes.title()

        return

    reset: ->

        headsUp.reset()

        particleGenerator.reset()

        return

    start: ->

        particleGenerator.start()

        return