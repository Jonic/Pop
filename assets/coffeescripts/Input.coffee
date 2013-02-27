Input = Class.extend

    init: ->

        window.addEventListener('touchmove', (event) ->
            event.preventDefault()
        )

        return