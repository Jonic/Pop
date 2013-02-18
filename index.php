<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />

		<title>Pop</title>

		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black" />

		<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width" />
		<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no" media="(device-height: 568px)" />

		<!--link href="assets/splashs/splash_1096.png" rel="apple-touch-startup-image" media="(device-height: 568px)" /-->
		<!--link href="assets/splashs/splash_iphone_2x.png" rel="apple-touch-startup-image" sizes="640x960" media="(device-height: 480px)" /-->

		<link href="assets/images/icon.png" rel="apple-touch-icon" />
		<link href="assets/styles/master.css" rel="stylesheet" />
	</head>

	<body>
		<ul class="debug">
			<li>Level: <span class="level"></li>
			<li>Score: <span class="score"></li>
			<li>Combo Multiplier: <span class="combo"></li>
		</ul>

		<script src="assets/vendor/dat.gui.min.js"></script>
		<script src="assets/vendor/ejohn.inheritance.js"></script>
		<script src="assets/vendor/requestAnimationFrame.js"></script>
		<script src="assets/vendor/zepto-1.0rc1.min.js"></script>

		<script src="assets/scripts/Config.js"></script>
		<script src="assets/scripts/Game.js"></script>
		<script src="assets/scripts/HeadsUp.js"></script>
		<script src="assets/scripts/Input.js"></script>
		<script src="assets/scripts/Particle.js"></script>
		<script src="assets/scripts/ParticleGenerator.js"></script>
		<script src="assets/scripts/Screens.js"></script>
		<script src="assets/scripts/Utils.js"></script>

		<script src="assets/scripts/_application.js"></script>

		<script type="text/javascript">
			var _gauges = _gauges || [];
			(function() {
				var t   = document.createElement('script');
				t.type  = 'text/javascript';
				t.async = true;
				t.id    = 'gauges-tracker';
				t.setAttribute('data-site-id', '511e9c71f5a1f51c4c000020');
				t.src = '//secure.gaug.es/track.js';
				var s = document.getElementsByTagName('script')[0];
				s.parentNode.insertBefore(t, s);
			})();
		</script>
	</body>
</html>