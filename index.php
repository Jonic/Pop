<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />

		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-title" content="Pop" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black" />

		<meta name="viewport" content="user-scalable=no, initial-scale=1" />

		<!--link href="assets/splashs/splash_1096.png" rel="apple-touch-startup-image" media="(device-height: 568px)" /-->
		<!--link href="assets/splashs/splash_iphone_2x.png" rel="apple-touch-startup-image" sizes="640x960" media="(device-height: 480px)" /-->

		<link href="assets/images/icon.png" rel="apple-touch-icon" />
		<link href="assets/styles/master.css" rel="stylesheet" />
	</head>

	<body>
		<dl class="headsup hidden">
			<dt class="hu-label hu-label-level">Level</dt>
			<dd class="hu-value hu-value-level"></dd>

			<dt class="hu-label hu-label-score">Score</dt>
			<dd class="hu-value hu-value-score"></dd>

			<dt class="hu-label hu-label-combo">Combo</dt>
			<dd class="hu-value hu-value-combo"></dd>
		</dl>

		<div class="summary hidden">
			<a class="play-again" href="#">Play Again</a>
		</div>

		<script src="assets/vendor/requestAnimationFrame.js"></script>
		<script src="assets/scripts/_application.js"></script>

		<script>
			if (!debug) {
				var _gauges = _gauges || [];
				(function() {
					var t = document.createElement('script');
					t.async = true;
					t.id = 'gauges-tracker';
					t.setAttribute('data-site-id', '511e9c71f5a1f51c4c000020');
					t.src = '//secure.gaug.es/track.js';
					var s = document.getElementsByTagName('script')[0];
					s.parentNode.insertBefore(t, s);
				}());
			}
		</script>
	</body>
</html>