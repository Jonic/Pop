
class UtilsClass

  $: (selector) ->

    return document.body if selector == body
    return document.getElementById(selector) if selector.substr(0, 1) == '#'

    els = document.querySelectorAll(selector)

    return els[0] if els.length == 1

    return els

  console: (content) ->
    console = @$('.console')
    @updateUITextNode(console, content)
    return

  correctValueForDPR: (value, integer = false) ->

    value *= devicePixelRatio

    value = Math.round(value) if integer

    return value

  formatWithComma: (num) ->

    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  random: (min, max) ->

    if min == undefined
      min = 0
      max = 1
    else if max == undefined
      max = min
      min = 0

    return (Math.random() * (max - min)) + min;

  randomColor: (alpha = false) ->

    colors =
      r: this.randomInteger(0, 200)
      g: this.randomInteger(0, 200)
      b: this.randomInteger(0, 200)
      a: if !alpha then this.random(0.75, 1) else alpha

    return 'rgba(' + colors.r + ', ' + colors.g + ', ' + colors.b + ', ' + colors.a + ')'

  randomInteger: (min, max) ->

    if max == undefined
      max = min
      min = 0

    return Math.floor(Math.random() * (max + 1 - min)) + min

  randomPercentage: ->

    return Math.floor(Math.random() * 100)

  updateUITextNode: (element, value) ->

    element.innerHTML = value

    return this
