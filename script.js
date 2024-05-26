// CONST -------------------------------------------------------------------------------------------

const WORLD = {
	BUG_COUNT: 2000,
	CLOSE_TO_POINT_DISTANCE: 20,
	NEXT_POINT_DISTANCE: 100,
	COLOR: [
		"#000000BB",
		"#0F001aBB",
		"#11011FBB",
		"#02092eBB",
		"#032130BB",
		"#000000"
  ],
  COLOR_INIT_LOCATIONS: [
    0,
    .1,
    .2,
    .3,
    .5,
    .5
  ],
  HILLS: [
    { x: .5, y: -.1, xr: .3, yr: .15, color: "#000B" },
    { x: .2, y: 0, xr: .3, yr: .1, color: "#000" },
    { x: .8, y: 0, xr: .35, yr: .1, color: "#000" }
  ]
}

const BUG = {
	VELOCITY_MIN: .2,
	VELOCITY_MAX: .8,
	BLINK_TIMEOUT_MIN: 600,
	BLINK_TIMEOUT_MAX: 2000,
	BLINK_DURATION_MIN: 80,
	BLINK_DURATION_MAX: 120,
	BIG_CHANCE: 0.96,
}

Math.HALF_PI = Math.PI / 2;
Math.TWO_PI = Math.PI * 2;

// GLOBAL ------------------------------------------------------------------------------------------

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function randomDec(min, max) {
	return Math.random() * (max - min) + min;
}

function randomBool() {
	return randomOdds(0.5);
}

function randomOdds(likelihood) {
	return Math.random() < likelihood;
}

function randomColor() {
	var r = Math.round(Math.random() * 255);
	var g = Math.round(Math.random() * 255);
	var b = Math.round(Math.random() * 255);
	var a = 1; // (Math.random()*.3)+.4;
	return `rgba(${r}, ${g}, ${b}, ${a})`
}

function distance(a, b) {
	return Math.sqrt(
		Math.pow(a.x - b.x, 2) +
		Math.pow(a.y - b.y, 2) +
		Math.pow(a.z - b.z, 2)
	);
}

// WORLD -------------------------------------------------------------------------------------------

class World {
	constructor(ctx, width, height) {
		this.ctx = ctx;
		this.W = width;
		this.H = height;
		this.D = (width + height) / 2;
		this.Wp100 = this.W + 100;
		this.Hp100 = this.H + 100;
    this.Dp100 = this.D + 100;
    this.HALF_H = this.H / 2;
		this.bugs = [];
		this.max = distance({ x: this.W, y: this.H, z: this.D }, { x: 0, y: 0, z: 0 });

		this.initBackground();
		this.drawBackground();
		this.initBugs();
		this.drawBugs();
	}

	// INIT

	initBackground() {
		this.color = WORLD.COLOR_INIT_LOCATIONS;
		this.toColor = [];
		for (let i = 1; i < this.color.length - 2; ++i) {
			this.toColor[i - 1] = this.color[i] + randomDec(-WORLD.COLOR_VARIATION, WORLD.COLOR_VARIATION);
		}
		this.setGradient();
	}

	setGradient() {
		this.grd = this.ctx.createLinearGradient(0, 0, 0, this.H);
		for (let i = 0; i < this.color.length; ++i) {
			this.grd.addColorStop(this.color[i], WORLD.COLOR[i]);
		}
	}

	initBugs() {
		for (var i = 0; i < WORLD.BUG_COUNT; i++) {
			this.bugs.push(new Bug(this, i));
		}
	}

	// ANIMATE

	run() {
		window.requestAnimationFrame(this.animate.bind(this));
	}

	animate() {
		this.drawBackground();
		this.drawBugs();
		window.requestAnimationFrame(this.animate.bind(this));
	}

	stop() {
		clearInterval(this.interval);
	}

	// DRAW

	drawBackground() {
		this.ctx.rect(0, 0, this.W, this.H);
		this.ctx.fillStyle = this.grd;
    this.ctx.fill();
    
    for(let i = 0; i < WORLD.HILLS.length; ++i) {
      const { x, y, xr, yr, color } = WORLD.HILLS[i]
      this.ctx.beginPath();
      this.ctx.moveTo(100, this.HALF_H);
      this.ctx.ellipse(this.W * x, this.HALF_H - this.HALF_H * y, this.W * xr, this.H * yr, 0, Math.TWO_PI, false);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.closePath();
    }
	}

	drawBugs() {
		for (let i = WORLD.BUG_COUNT - 1; i >= 0; i--) {
			const bug = this.bugs[i];
			bug.draw();
			bug.move(Date.now());
		}
	}

	// HELPER

	getRandomCoords() {
		return {
			x: randomInt(-100, this.Wp100),
			y: randomInt(-100, this.Hp100),
			z: randomInt(-100, this.Dp100)
		};
	}

	isCloseToEdge({ x, y, z }) {
		return (
			x < -100 || x > this.Wp100 ||
			y < -100 || y > this.Hp100 ||
			z < -100 || z > this.Dp100
		)
	}

	zScale(z) {
		return (.5 * (z / this.D)) + .5;
	}

	getMax() {
		return this.max;
	}

	getCtx() {
		return this.ctx;
	}
}

// BUG ---------------------------------------------------------------------------------------------

class Bug {
	constructor(world, i) {
		this.world = world;
		this.ctx = this.world.getCtx();
		this.i = i;

		this.pos = this.world.getRandomCoords();
		this.chooseNewPoint();

    this.on = randomOdds(.2);
    this.color = {}
		this.blink(Date.now());
	}

	setNextBlinkTime(date) {
		const zScale = this.zScale();
		if (this.on) {
			if (zScale > BUG.BIG_CHANCE) {
				this.nextBlinkTime = date + randomDec(BUG.BLINK_DURATION_MIN * 3, BUG.BLINK_DURATION_MAX * 4);

			} else {
				this.nextBlinkTime = date + randomDec(BUG.BLINK_DURATION_MIN, BUG.BLINK_DURATION_MAX);
			}
		} else {
			this.nextBlinkTime = date + randomDec(BUG.BLINK_TIMEOUT_MIN, BUG.BLINK_TIMEOUT_MAX);
		}
	}

	blink(date) {
		this.on = !this.on;
    this.setNextBlinkTime(date);
    this.setColor();
	}

	isCloseToEdge() {
		return this.world.isCloseToEdge(this.pos);
	}

	move(date) {
		if (this.isCloseToPoint()) {
			this.chooseNewPoint();
		} else if (this.isCloseToEdge()) {
			this.pos = this.world.getRandomCoords();
			this.chooseNewPoint();
		}

		if (date > this.nextBlinkTime) {
			this.blink(date);
		}

		const vx = Math.cos(this.aXY) * this.v;
		const vy = Math.sin(this.aXY) * this.v;
		const vz = Math.cos(this.aZ) * this.v;

		this.pos = {
			x: this.pos.x - vx,
			y: this.pos.y - vy,
			z: this.pos.z - vz
		}
	}

	draw() {
		const zScale = this.zScale();
		const radius = (zScale > BUG.BIG_CHANCE) ? 2 : 1.2 * zScale;
		this.ctx.beginPath();
		this.ctx.moveTo(this.pos.x, this.pos.y);
		this.ctx.arc(this.pos.x, this.pos.y, radius, 0, Math.TWO_PI, false);
		this.ctx.fillStyle = this.color.body;
		this.ctx.fill();
		this.ctx.closePath();
		if (this.on && zScale > BUG.BIG_CHANCE) {
			const glowRadius = 6 + (zScale - BUG.BIG_CHANCE) * 10;
			this.ctx.beginPath();
			this.ctx.moveTo(this.pos.x, this.pos.y);
			this.ctx.arc(this.pos.x, this.pos.y, glowRadius, 0, Math.TWO_PI, false);
			this.ctx.fillStyle = this.color.glow;
			this.ctx.fill();
			this.ctx.closePath();
		}
  }
  
  zScale() {
    return this.world.zScale(this.pos.z);
  }

	setColor() {
		if (this.on) {
      this.color.body = `rgb(255, 255, ${ 255 * randomDec(.4, 1) })`;
      this.color.glow = `rgba(254, 255, 207, ${randomDec(0.02, 0.08)})`;
		} else {
      this.color.body = `rgba(0, 0, 0, ${this.zScale()})`;
      this.color.glow = '#0000';
    }
	}

	isCloseToPoint() {
		return distance(this.pos, this.to) < WORLD.CLOSE_TO_POINT_DISTANCE;
	}

	chooseNewPoint() {
		this.to = this.world.getRandomCoords();
		const { aXY, aZ } = this.getAngleTo();
		this.aXY = aXY;
		this.aZ = aZ;
		this.v = randomDec(BUG.VELOCITY_MIN, BUG.VELOCITY_MAX);
	}

	getAngleTo() {
		const to = this.to;
		const pos = this.pos;
		const dx = pos.x - to.x,
			dy = pos.y - to.y,
			dz = pos.z - to.z;
		return {
			aXY: -1.0 * Math.atan2(dx, dy) + Math.HALF_PI,
			aZ: 1.0 * Math.atan2(dx, dz) + Math.HALF_PI
		};
	}

	print(statement) {
		if (this.i === 0) {
			console.log(statement);
		}
	}

}

// MAIN --------------------------------------------------------------------------------------------

window.onload = function () {

	const canvas = document.getElementById("pix");
	const ctx = canvas.getContext("2d");

	const W = window.innerWidth, H = window.innerHeight;
	canvas.width = W;
	canvas.height = H;

	const world = new World(ctx, W, H);
	world.run();
}