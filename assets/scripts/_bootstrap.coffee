
debug = true

android        = if navigator.userAgent.match(/android/i) then true else false
body           = document.body
canvas         = document.createElement('canvas')
hasTouchEvents = window.hasOwnProperty('ontouchstart') || window.hasOwnProperty('onmsgesturechange')
inputVerb      = if hasTouchEvents then 'touchstart' else 'click'

canvas.className = 'canvas'
canvas.width     = body.clientWidth
canvas.height    = body.clientHeight

body.appendChild(canvas)

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

	canvas.style.width  = oldWidth  + 'px'
	canvas.style.height = oldHeight + 'px'

	context.scale(ratio, ratio)

animationLoop     = new AnimationLoop()
config            = new Config()
game              = new Game()
input             = new Input()
particleGenerator = new ParticleGenerator()
utils             = new Utils()
scenes            = new Scenes()
playState         = new PlayState()
ui                = new UI()

game.init()
