class TitleScene extends Scene

  constructor: ->

    super

    @id = 'title'

    return this

  load: ->

    super

    @input.addEventListener '.game-logo', 'click', =>
      @ui.transitionTo('playing')
      return

    return this

  unload: ->

    super

    return this
