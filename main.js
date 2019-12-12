let g_radius = 150;
let g_score = 0;
let start = null;
let finish = null;
let flipflop = true;
let times = [];
let idle = 0;
let cheater = null;
let cheatCheckerInt = null;

$(document).ready(() => {
	if (localStorage.getItem('score')) {
		$('#topScore').show();
		$('#topScore').html(`Top Score: ${localStorage.getItem('score')}`);
	}

	if (localStorage.getItem('speed')) {
		$('#topSpeed').show();
		$('#topSpeed').html(`Reaction Avg: ${localStorage.getItem('speed')}`);
	}

	setInterval(() => {
		idle++;
		if (idle > 10) {
			if (cheater == null) {
				finishGame();
			}
		}
	}, 1000);

	cheatCheckerInt = setInterval(() => {
		cheatCheck();
	}, 300);

	$(this).mousemove(function() {
		idle = 0;
	});

	$(this).keypress(function() {
		idle = 0;
	});

	$('#startBtn').click(function() {
		$(this).hide();
		countDown().then(() => {
			createCircle();
			$('#score').show(1000);
			$('#speed').show(1000);
		});
	});

	$('.circle').click(function() {
		if (cheater == null) {
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
				g_radius -= 5;
			}
			$('#score').html(g_score);
			let average = avg();
			if (average != NaN) {
				$('#speed').html(avg() + 's');
			}
			createCircle();
		}
	});
});

function countDown() {
	return new Promise((resolve, reject) => {
		let time = 3;
		$('#countDown').html(time);
		$('#countDown').show(500);
		let timer = setInterval(() => {
			time--;
			$('#countDown').html(time);
			if (time == 0) {
				$('#countDown').html('Go!');
				clearInterval(timer);
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
		$('#score').css('color', 'white');
		$('#speed').css('color', 'white');
	} else {
		$('body').css('background-color', 'white');
		$('#score').css('color', 'black');
		$('#speed').css('color', 'black');
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

function finishGame() {
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
