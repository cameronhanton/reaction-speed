let g_radius = 150;
let g_score = 0;
let start = null;
let finish = null;
let flipflop = true;
let times = [];
let idle = 0;
let cheatCheckerInt = null;
let gameLoop = null;
let gameStarted = false;
let mouseClicks = 0;
let timer = 30;
let accuracy = 0;
let mode = 'regular';
let creepWidth = 40;
let creepDamage = 5;
let numOfCreeps = 5;

$(document).ready(() => {
	if (localStorage.getItem('score')) {
		$('#topScore').html(`Score: ${localStorage.getItem('score')}`);
		$('#topSpeed').html(`Avg Speed: ${localStorage.getItem('speed')}`);
		$('#topAccuracy').html(`Accuracy: ${localStorage.getItem('accuracy')}`);
	}

	mode = localStorage.getItem('mode');

	if (mode === null) {
		if ($('#creep-mode').prop('checked') === true) {
			localStorage.setItem('mode', 'creep');
		} else {
			localStorage.setItem('mode', 'regular');
		}
	}

	if (mode == 'creep') {
		$('#creep-mode').prop('checked', true);
	} else {
		$('#creep-mode').prop('checked', false);
	}

	// cheatCheckerInt = setInterval(() => {
	// 	cheatCheck();
	// }, 300);

	$('#resetBtn').click(function() {
		resetGame();
	});

	$('#startBtn').click(function() {
		$(this).hide();
		$('#top-container').hide(1000);
		$('#setting-modal-open').hide(1000);
		countDown().then(() => {
			startGameLoop();
			gameStarted = true;

			setTimeout(() => {
				$('#score').show(2000);
				$('#speed').show(2000);
				$('#accuracy').show(2000);
			}, 1000);

			if (mode == 'creep') {
				// creep mode
				createCreepCircles();

				$('.creep').click(function() {
					if (gameStarted == true && mode == 'creep') {
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

						let creepID = this.id.slice(6);
						respawnCreep(creepID);
					}
				});
				let damageFlag = true;
				let creepDamageInt = setInterval(() => {
					for (let i = 1; i <= numOfCreeps; i++) {
						let hp = $(`#creep-${i}-hp > span`).width();
						hp = (hp / creepWidth) * 100;
						hp -= creepDamage;
						$(`#creep-${i}-hp > span`).css('width', `${hp}%`);
						if (hp <= 0) {
							respawnCreep(i);
							g_score--;
						}
						if (g_score % 5 == 0 && damageFlag) {
							damageFlag = false;
							if (creepDamage <= 15) {
								creepDamage += 3;
								setTimeout(() => {
									damageFlag = true;
								}, 1000);
							}
						}
					}
				}, 500);
			} else {
				// Regular mode
				createRegularGameCircle();
				$('.circle').show();
			}
			let timerInt = setInterval(() => {
				timer--;
				// let minutes = parseInt(timer / 60, 10);
				let seconds = parseInt(timer % 60, 10);
				// minutes = minutes < 10 ? '0' + minutes : minutes;
				seconds = seconds < 10 ? '0' + seconds : seconds;
				$('#timer').html(seconds);
				if (timer <= 0) {
					clearInterval(timerInt);
					endGame();
				}
			}, 1000);
		});
	});

	// This is for regular mode
	$('.circle').click(function() {
		if (gameStarted && mode == 'regular') {
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

			if (g_radius > 40) {
				g_radius -= 10;
			}

			createRegularGameCircle();
		}
	});

	$(this).mousedown(function() {
		if (gameStarted) {
			mouseClicks++;
			accuracy = (((g_score + 1) / mouseClicks) * 100).toFixed(0);
		}
		if (!$(event.target).closest('#setting-modal').length && !$(event.target).is('#setting-modal')) {
			$('#setting-modal').hide(400);
		}
	});

	$('#setting-modal-open').click(function() {
		if (!gameStarted) {
			$('#setting-modal').show(400);
		}
	});

	$('#creep-mode').click(() => {
		let savedMode = localStorage.getItem('mode');
		if (savedMode == null || savedMode == 'regular') {
			localStorage.setItem('mode', 'creep');
			mode = 'creep';
		} else {
			localStorage.setItem('mode', 'regular');
			mode = 'regular';
		}
	});
});

function startGameLoop() {
	gameLoop = setInterval(() => {
		$('#score').html(g_score);
		$('#accuracy').html(`${accuracy}%`);
		if (avg() != NaN) {
			$('#speed').html(avg() + 's');
		}
	}, 100);
}

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
				setTimeout(() => {
					$('#countDown').hide(500);
				}, 1500);
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

function createRegularGameCircle() {
	$('.circle')
		.css('width', `${g_radius}px`)
		.css('height', `${g_radius}px`)
		.css('background-color', rgb());

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

function createCreepCircles() {
	for (let i = 1; i <= numOfCreeps; i++) {
		$('body').append(`
		<div class='creep' id='creep-${i}'>
			<div class='creep-hp-bar' id='creep-${i}-hp'>
				<span style="width: 100%"></span>
			</div>
		</div>`);
		positionCreepCircle(i);
	}
}

function respawnCreep(creepID) {
	$(`#creep-${creepID}`)
		.find('span')
		.css('width', '100%');
	positionCreepCircle(creepID);
}

function positionCreepCircle(creepID) {
	let wh = '40';

	let x = rn(0, $('body').width() - creepWidth - 20);
	let y = rn(0, $('body').height() - creepWidth - 20);

	$(`#creep-${creepID}`)
		.css('left', x)
		.css('top', y);
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
	location.reload();
}

function cheatCheck() {
	let displayScore = $('#score').html();
	if (displayScore != g_score) {
		console.log('cheater');
		resetGame();
	}

	if (!gameStarted) {
		let scoreboard = $('#sb-score').html();
		scoreboard = scoreboard.slice(7);
		if (scoreboard != g_score) {
			console.log('cheater');
			resetGame();
		}
	}
}

function endGame() {
	gameStarted = false;
	let oldScore = localStorage.getItem('score');

	if (oldScore == null || oldScore < g_score) {
		localStorage.setItem('score', g_score);
		localStorage.setItem('speed', avg() + 's');
		localStorage.setItem('accuracy', accuracy + '%');
	}

	clearInterval(gameLoop);

	$('#score').hide();
	$('#speed').hide();
	$('#accuracy').hide();
	$('.circle').hide();
	$('.creep').hide();
	$('#sb-score').html(`Score: ` + $('#score').html());
	$('#sb-speed').html(`Speed: ` + $('#speed').html());
	$('#sb-accuracy').html(`Accuracy: ` + $('#accuracy').html());
	$('#score-board').show(1000);
	$('#top-container').show();
	$('#setting-modal-open').show();
}
