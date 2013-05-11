'use strict'

android = if navigator.userAgent.match(/android/i) then true else false
iOS = if navigator.userAgent.match(/(iPad|iPhone|iPod)/i) then true else false
homeScreenApp = iOS and navigator.standalone
hasTouchEvents = 'ontouchstart' in window
inputVerb = if hasTouchEvents then 'touchstart' else 'click'

debug = true

animationLoopId = null

canvas = document.createElement('canvas')

document.body.appendChild(canvas)

canvas.width = document.body.clientWidth
canvas.height = document.body.clientHeight

context = canvas.getContext('2d')
context.globalCompositeOperation = 'source-atop';

devicePixelRatio = window.devicePixelRatio || 1
backingStoreRatio = context.webkitBackingStorePixelRatio || context.backingStorePixelRatio || 1
ratio = devicePixelRatio / backingStoreRatio

if devicePixelRatio != backingStoreRatio
	oldWidth = canvas.width
	oldHeight = canvas.height

	canvas.width = oldWidth * ratio
	canvas.height = oldHeight * ratio

	canvas.style.width = oldWidth + 'px'
	canvas.style.height = oldHeight + 'px'

	context.scale(ratio, ratio)