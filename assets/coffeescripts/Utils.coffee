class Utils

	correctValueForDPR: (value, integer = false) ->

		if integer
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

	randomColor: (alpha = false) ->

		colors =
			r: this.randomInteger(0, 200)
			g: this.randomInteger(0, 200)
			b: this.randomInteger(0, 200)
			a: if !alpha then this.random(0.75, 1) else alpha

		'rgba(' + colors.r + ', ' + colors.g + ', ' + colors.b + ', ' + colors.a + ')'

	randomInteger: (min, max) ->

		if max == undefined
			max = min
			min = 0

		Math.floor(Math.random() * (max + 1 - min)) + min

	randomPercentage: ->

		Math.floor(Math.random() * 100)

	updateUITextNode: (selector, value) ->

		element = document.querySelector(selector)
		element.innerHTML = value

		@