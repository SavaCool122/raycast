function fromAngle(angle, length) {
	if (typeof length === 'undefined') {
		length = 1;
	}
	return createVector(length * Math.cos(angle), length * Math.sin(angle));
};

const DEG_TO_RAD = Math.PI / 180

const radians = angle => angle * DEG_TO_RAD;

const createVector = (x, y) => ({x, y})

function random(min) {
	return Math.random() * min
}

function dist(first, second) {
	const a = first.x - second.x;
	const b = first.y - second.y;
	return Math.sqrt( a*a + b*b );
}

function line(x1, y1, x2, y2) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

const createSquare = (w, h)  => {
	let x1 = random(w)
	let x2 = random(w)
	let y1 = random(h)
	let y2 = random(h);
	return [
		new Boundary(x1, y2, x2, y2),
		new Boundary(x1, y1, x2, y1),
		new Boundary(x2, y1, x2, y2),
		new Boundary(x1, y1, x1, y2),
	]
}

const createTriangle = (w, h)  => {
	let x1 = random(w)
	let x2 = random(w)
	let y1 = random(h)
	let y2 = random(h);
	return [
		new Boundary(x1, y1, x2, y2),
		new Boundary(x2, y2, x2, y1),
		new Boundary(x2, y1, x1, y1),
	]
}

class Particle {
	constructor() {
		this.pos = createVector(w / 2, h / 2);
		this.rays = [];
		for (let a = 0; a < 360; a += 10) {
			this.rays.push(new Ray(this.pos, radians(a)));
		}
	}
	
	update(x, y) {
		this.pos.x = x
		this.pos.y = y
	}
	
	look(walls) {
		for (let i = 0; i < this.rays.length; i++) {
			const ray = this.rays[i];
			let closest = null;
			let record = Infinity;
			for (let wall of walls) {
				const pt = ray.cast(wall);
				if (pt) {
					const d = dist(this.pos, pt);
					if (d < record) {
						record = d;
						closest = pt;
					}
				}
			}
			if (closest) {
				ctx.strokeStyle = 'yellow';
				line(this.pos.x, this.pos.y, closest.x, closest.y);
				ctx.strokeStyle = 'green';
			}
		}
	}
}

class Ray {
	constructor(pos, angle) {
		this.pos = pos;
		this.dir = fromAngle(angle);
	}
	
	cast(wall) {
		const x1 = wall.a.x;
		const y1 = wall.a.y;
		const x2 = wall.b.x;
		const y2 = wall.b.y;
		
		const x3 = this.pos.x;
		const y3 = this.pos.y;
		const x4 = this.pos.x + this.dir.x;
		const y4 = this.pos.y + this.dir.y;
		
		const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (den === 0) {
			return;
		}
		
		// https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
		const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
		const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
		if (t > 0 && t < 1 && u > 0) {
			const pt = createVector();
			pt.x = x1 + t * (x2 - x1);
			pt.y = y1 + t * (y2 - y1);
			return pt;
		} else {
			return;
		}
	}
}


class Boundary {
	constructor(x1, y1, x2, y2) {
		this.a = createVector(x1, y1);
		this.b = createVector(x2, y2);
	}
	
	show() {
		ctx.strokeStyle = '';
		line(this.a.x, this.a.y, this.b.x, this.b.y);
	}
}


let walls = [];
let particle;
let mx = 0
let my = 0
let w = 600
let h = 600
let c
let ctx

function setup() {
	c = document.createElement('canvas')
	c.width = w
	c.height = h
	document.body.appendChild(c)
	ctx = c.getContext('2d')
	c.addEventListener('mousemove', e => {
		my = e.clientY
		mx = e.clientX
	})
	for (let i = 0; i < 5; i++) {
		let x1 = random(w);
		let x2 = random(w);
		let y1 = random(h);
		let y2 = random(h);
		walls[i] = new Boundary(x1, y1, x2, y2);
	}
	walls.push(...createSquare(w,h))
	walls.push(...createTriangle(w,h))
	
	walls.push(new Boundary(-1, -1, w, -1));
	walls.push(new Boundary(w, -1, w, h));
	walls.push(new Boundary(w, h, -1, h));
	walls.push(new Boundary(-1, h, -1, -1));
	particle = new Particle();
}

function draw() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, w, h);
	
	for (let wall of walls) {
		wall.show();
	}
	particle.update(mx, my);
	particle.look(walls);
}


function start() {
	draw()
	requestAnimationFrame(start)
}

setup()
start()
