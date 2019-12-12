let g_radius = 150;
let g_score = 0;
let start = null;
let finish = null;
let flipflop = true;
let times = [];
let idle = 0;
let cheater = null;
let cheatCheckerInt = null;
let gameStarted = false;
let mouseClicks = 0;
let timer = 10;

$(document).ready(() => {
	if (localStorage.getItem('score')) {
		$('#topScore').show();
		$('#topScore').html(`Top Score: ${localStorage.getItem('score')}`);
	}

	if (localStorage.getItem('speed')) {
		$('#topSpeed').show();
		$('#topSpeed').html(`Reaction Avg: ${localStorage.getItem('speed')}`);
	}

	cheatCheckerInt = setInterval(() => {
		cheatCheck();
	}, 300);

	$('#startBtn').click(function() {
		$(this).hide();
		countDown().then(() => {
			gameStarted = true;
			createCircle();
			$('#score').show(1000);
			$('#speed').show(1000);
			$('#accuracy').show(1000);
			let timerInt = setInterval(() => {
				if (timer <= 0) {
					clearInterval(timerInt);
					endGame();
				}
				timer--;
				let minutes = parseInt(timer / 60, 10);
				let seconds = parseInt(timer % 60, 10);
				minutes = minutes < 10 ? '0' + minutes : minutes;
				seconds = seconds < 10 ? '0' + seconds : seconds;
				$('#timer').html(minutes + ':' + seconds);
			}, 1000);
		});
	});

	$('.circle').click(function() {
		if (cheater == null && gameStarted == true) {
			if (flipflop) {
				start = Date.now();
				flipflop = false;
			} else {
				finish = Date.now();
				flipflop = true;
			}
			if (flipflop) {
				times.push(finish - start);
			}
			g_score++;

			if (g_radius > 30) {
				g_radius -= 10;
			}
			$('#score').html(g_score);
			let average = avg();
			if (average != NaN) {
				$('#speed').html(avg() + 's');
			}
			createCircle();
		}
	});

	$(this).mousedown(function() {
		if (gameStarted) {
			mouseClicks++;
			$('#accuracy').html(`${(((g_score + 1) / mouseClicks) * 100).toFixed(0)}%`);
		}
	});
});

function countDown() {
	return new Promise((resolve, reject) => {
		let time = 3;
		$('#countDown').html(time);
		$('#countDown').show(500);
		let count = setInterval(() => {
			time--;
			$('#countDown').html(time);
			if (time == 0) {
				$('#countDown').html('Go!');
				clearInterval(count);
				$('#countDown').hide(1500);
				resolve();
			}
		}, 1000);
	});
}

function rn(min, max) {
	return Math.random() * (max - min) + min;
}

function rgb() {
	return `rgb(${rn(50, 150)}, ${rn(50, 200)}, ${rn(50, 175)})`;
}

function createCircle() {
	$('.circle').css('width', `${g_radius}px`);
	$('.circle').css('height', `${g_radius}px`);
	$('.circle').css('background-color', rgb());

	let x = rn(0, $('body').width() - g_radius);
	let y = rn(0, $('body').height() - g_radius);

	$('.circle').css('left', x);
	$('.circle').css('top', y);

	let pct = rn(0, 100);
	if (pct <= 5) {
		$('body').css('background-color', 'black');
	} else {
		$('body').css('background-color', 'white');
	}
}

function avg() {
	let total = 0;
	times.forEach((num) => {
		total += num;
	});
	if (times.length > 2) {
		return (total / times.length / 1000).toFixed(3);
	}
	return 0;
}

function resetGame() {
	let oldScore = localStorage.getItem('score');
	let oldSpeed = localStorage.getItem('speed');

	if (oldScore == null || oldScore < g_score) {
		localStorage.setItem('score', g_score);
	}

	if (oldSpeed == null || oldSpeed > avg()) {
		localStorage.setItem('speed', avg() + 's');
	}
	location.reload();
}

function cheatCheck() {
	let displayScore = $('#score').html();
	if (displayScore != g_score) {
		$('#score').html('CHEATER');
		cheater = true;
		clearInterval(cheatCheckerInt);
	}
}

function endGame() {
	gameStarted = false;
	$('#score').hide();
	$('#speed').hide();
	$('#accuracy').hide();
	$('#sb-score').html(`Score: ` + $('#score').html());
	$('#sb-speed').html(`Speed: ` + $('#speed').html());
	$('#sb-accuracy').html(`Accuracy: ` + $('#accuracy').html());
	$('#score-board').show(1000);
}
