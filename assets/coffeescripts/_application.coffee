###jshint plusplus:false, forin:false, eqeqeq:false ###
###global Class, dat ###

'use strict'

android = if navigator.userAgent.match(/android/i) then true else false
iOS = if navigator.userAgent.match(/(iPad|iPhone|iPod)/i) then true else false
homeScreenApp = iOS and navigator.standalone

debug = true

animationLoopId = null
canvas = document.createElement('canvas')
context = canvas.getContext('2d')

document.body.appendChild(canvas)

canvas.width = document.width
canvas.height = document.height

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
