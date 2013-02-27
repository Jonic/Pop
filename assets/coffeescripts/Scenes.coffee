Scenes = Class.extend

    init: ->

        this.splash()

        return

    credits: ->

        return

    gameOver: ->

        alert('GAME OVER')

        animationLoop.cancelAnimationFrame()

        game.reset()

        return

    howToPlay: ->

        return

    installationPrompt: ->

        $('body').empty().text('ADD THIS TO YOUR HOME SCREEN TO PLAY')

        return

    mobilePrompt: ->

        $('body').empty().text('YOU NEED TO RUN THIS ON A MOBILE DEVICE, YOU MUG')

        return

    splash: ->

        return

    title: ->

        return
