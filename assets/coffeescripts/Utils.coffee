
Utils = Class.extend

	init: ->

		return

	correctValueForDPR: (value, int = false) ->

		if int
			Math.round(value * devicePixelRatio)
		else
			value * devicePixelRatio

	random: (min, max) ->

		if min == undefined
			min = 0
			max = 1
		else if max == undefined
			max = min
			min = 0

		(Math.random() * (max - min)) + min;

	randomInteger: (min, max) ->

		if max == undefined
			max = min
			min = 0

		Math.floor(Math.random() * (max + 1 - min)) + min

	randomPercentage: ->

		Math.floor(Math.random() * 101)

	updateUITextNode: (selector, value) ->

		element = document.querySelector(selector)
		element.innerHTML = value

		return
