
debug = true

android        = if navigator.userAgent.match(/android/i) then true else false
body           = document.body
canvas         = document.querySelector('.canvas')
hasTouchEvents = window.hasOwnProperty('ontouchstart') || window.hasOwnProperty('onmsgesturechange')
inputVerb      = if hasTouchEvents then 'touchstart' else 'click'

canvas.className = 'canvas'
canvas.width     = body.clientWidth
canvas.height    = body.clientHeight

context = canvas.getContext('2d')

context.globalCompositeOperation = 'source-atop'

devicePixelRatio  = window.devicePixelRatio || 1
backingStoreRatio = context.webkitBackingStorePixelRatio || context.backingStorePixelRatio || 1
ratio             = devicePixelRatio / backingStoreRatio

if devicePixelRatio != backingStoreRatio
  oldWidth  = canvas.width
  oldHeight = canvas.height

  canvas.width  = oldWidth  * ratio
  canvas.height = oldHeight * ratio

  canvas.style.width  = "#{oldWidth}px"
  canvas.style.height = "#{oldHeight}px"

  context.scale(ratio, ratio)

# Set environment and base config etc
Device          = new DeviceClass()
Utils           = new UtilsClass()
Config          = new ConfigClass()
Input           = new InputClass()

# Load the game logic and all that
BubbleGenerator = new BubbleGeneratorClass()
PlayState       = new PlayStateClass()
UI              = new UIClass()
Scenes          = new ScenesClass()

# Set off the canvas animation loop
AnimationLoop   = new AnimationLoopClass()

# Start the actual game
Game            = new GameClass()
