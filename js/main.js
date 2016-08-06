var multiradio_app = angular.module('multiradio-app', []);

multiradio_app.controller('multiradio-stream-controller', function multiradio_stream_controller($scope, $sce, $interval, $http, $document) {
	$scope.update_rate = 5; /* update status every 5 seconds */

	$scope.streams = [
		{
			name: "Soundtrack-Soundscapes",
			source: $sce.trustAsResourceUrl("http://glados.ftp.sh:4121/soundscapes"),
			access_host: "glados.ftp.sh",
			access_port: "6600",
			art_prefix: "/art/",
			description: "Slow-moving electronic and orchestral soundtracks.",
			id: "soundscapes"
		},
		{
			name: "Soundtrack-Epic",
			source: $sce.trustAsResourceUrl("http://glados.ftp.sh:4121/epic"),
			access_host: "glados.ftp.sh",
			access_port: "6601",
			art_prefix: "/art/",
			description: "Intense epic orchestral soundtracks.",
			id: "epic"
		},
		{
			name: "Soundtrack-Melodic/Electronic",
			source: $sce.trustAsResourceUrl("http://glados.ftp.sh:4121/melodic"),
			access_host: "glados.ftp.sh",
			access_port: "6602",
			art_prefix: "/art/",
			description: "Groovy electronic soundtracks with strong melodies.",
			id: "melodic"
		},
		{
			name: "Ambient",
			source: $sce.trustAsResourceUrl("http://glados.ftp.sh:4121/ambient"),
			access_host: "glados.ftp.sh",
			access_port: "6603",
			art_prefix: "/art/",
			description: "Ambient electronic soundscapes.",
			id: "ambient"
		},
		{
			name: "Electronica",
			source: $sce.trustAsResourceUrl("http://glados.ftp.sh:4121/electronica"),
			access_host: "glados.ftp.sh",
			access_port: "6604",
			art_prefix: "/art/",
			description: "Progressive electronic house.",
			id: "electronica"
		}
	];

	$scope.stream_selected = $scope.streams[0];

	$scope.update_stream = function() {
		$http({method: 'GET', url: '/status', params: {host: $scope.stream_selected.access_host, port: $scope.stream_selected.access_port}}).then(function successcb(response) {
			$scope.current.art = $scope.stream_selected.art_prefix + response.data.art;
			$scope.current.blur = $scope.stream_selected.art_prefix + response.data.blur;
			$scope.current.title = response.data.title;
			$scope.current.artist = response.data.artist;
			console.log($scope.current.art);
			console.log($scope.current.blur);
			console.log($scope.current.title);
			console.log($scope.current.artist);
		}, function errorcb(response) {
			console.log("errorcb() called, $http failed");
		});
	}

	$scope.switch_stream = function(stream) {
		$('#stream_' + $scope.stream_selected.id)[0].pause();
		$scope.stream_selected = stream;
		$('#stream_' + stream.id)[0].load();
		$('#stream_' + stream.id)[0].play();
		$scope.update_stream();
	}

	$scope.current = {};
	$scope.current.art = "/art/default_fg.png";
	$scope.current.blur = "/art/default.png";

	var watcher = $interval(function() {
		$scope.update_stream();
	}, $scope.update_rate * 1000);

	$scope.$on('$destroy', function() {
		if (angular.isDefined(watcher)) {
			$interval.cancel(watcher);
		}
	});

	$scope.update_stream();

	$document.ready(function() {
		$scope.switch_stream($scope.stream_selected); /* only play once the view is prepared */
	});
});

multiradio_app.controller('multiradio-art-controller', function multiradio_art_controller($scope, $timeout, $sce) {
	var to;
	var fadeout_delay = 750;

	$scope.display_art = "";
	$scope.display_blur = "";

	$scope.$parent.$watch('current.art', function(value) {
		console.log("art subpath watchdog reports " + value);

		if (angular.isDefined(to)) {
			$timeout.cancel(to);
		}

		/* start switching process .. first set CSS to fade out the other album art */
		$('.art-bg').removeClass('fade-in');
		$('.art-fg').removeClass('fade-in');

		to = $timeout(function() {
			//$scope.display_art = $sce.trustAsResourceUrl($scope.current.art);
			//$scope.display_blur = $sce.trustAsResourceUrl($scope.current.blur);

			$('.art-fg').attr('src', $scope.current.art);
			$('.art-bg').css('background-image', 'url(' + $scope.current.blur + ')');

			$('.art-fg').on('load', function() {
				$('.art-fg').addClass('fade-in');
				$('.art-bg').addClass('fade-in');
			});
		}, fadeout_delay);
	});

	$scope.$on('$destroy', function() {
		if (angular.isDefined(to)) {
			$timeout.cancel(to);
		}
	});
});

multiradio_app.controller('multiradio-info-controller', function multiradio_info_controller($scope, $timeout) {
	$scope.target_title = $scope.current.title;
	$scope.target_artist = $scope.current.artist;

	var to;
	var fadeout_delay = 1000;

	$scope.$parent.$watch('current.title', function(value) {
		/* we can rest assured the artist will have already changed once the title has changed, so we won't worry about choppy animation. */

		if (angular.isDefined(to)) { /* cancel any previous animations */
			$timeout.cancel(to);
		}

		$('.info-upper-song').addClass('fade-out');
		$timeout(function() {
			$scope.target_title = $scope.current.title;
			$scope.target_artist = $scope.current.artist;
			$('.info-upper-song').removeClass('fade-out');
		}, fadeout_delay);
	});

	$scope.$on('$destroy', function() {
		if (angular.isDefined(to)) {
			$timeout.cancel(to);
		}
	});
});

multiradio_app.controller('multiradio-option-controller', function multiradio_option_controller($scope) {
	var speaker_src = "/res/speaker.svg.png", mute_src = "/res/mute.svg.png";
	$scope.is_muted = false;

	$scope.get_mute_src = function() {
		if ($scope.is_muted) {
			return mute_src;
		} else {
			return speaker_src;
		}
	};

	$scope.toggle_mute = function() {
		$scope.is_muted = !$scope.is_muted;
		$('#stream_' + $scope.stream_selected.id).prop('muted', $scope.is_muted);
	}

	$scope.$parent.$watch('stream_selected.id', function(value, old) {
		$('#stream_' + value).prop('muted', $scope.is_muted);
		$('#stream_' + old).prop('muted', false);
	});
});
