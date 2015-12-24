class DeviceHelper

  constructor: ->

    @screen =
      height: document.body.clientHeight
      width:  document.body.clientWidth

    @android        = if navigator.userAgent.match(/android/i) then true else false
    @ios            = !@android
    @hasTouchEvents = window.hasOwnProperty('ontouchstart') || window.hasOwnProperty('onmsgesturechange')
    @pixelRatio     = window.devicePixelRatio || 1

    return this
