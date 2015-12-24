class IdentScene extends Scene

  constructor: ->

    super

    @id = 'ident'

    return this

  load: ->

    super

    window.setTimeout =>
      @ui.transitionTo('title')
    , 2500

    return this
