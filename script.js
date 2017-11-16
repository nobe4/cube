const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const HEIGHT = canvas.height;
const WIDTH = canvas.width;
const pointSize = 10;
var debug = true;
var step = 0;

// Center of the cube, won't move
const center = {
	x: HEIGHT/2,
	y: WIDTH/2
};

// Three handle points
var handle1 = { x: WIDTH/2, y: 2*HEIGHT/3 };
var handle2 = { x: WIDTH/3, y: HEIGHT/3 };
var handle3 = { x: 2*WIDTH/3, y: HEIGHT/3 };

// Center at the "back" of the cube.
var center2 = {};

// Points used to constructe the cube
var middle1 = {};
var middle2 = {};
var middle3 = {};
var intersection1 = {};
var intersection2 = {};
var intersection3 = {};

// Clear the canvas
function clearCanvas(){
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// Draw a draggable handle
function drawPoint(point){
	ctx.fillStyle = 'black';
	ctx.fillRect(point.x - pointSize/2, point.y - pointSize/2, pointSize, pointSize);
}

// Draw a set of lines
function drawLines(lines, debug){
	if(debug){
		ctx.strokeStyle = 'grey';
		ctx.setLineDash([4, 4]);
		ctx.lineWidth=1;
	} else {
		ctx.strokeStyle = 'black';
		ctx.setLineDash([]);
		ctx.lineWidth=3;
	}
	ctx.beginPath();
	lines.forEach(points => {
		ctx.moveTo(points[0].x, points[0].y);
		ctx.lineTo(points[1].x, points[1].y);
	});
	ctx.stroke();
}

// Compute the middle point.
function computeMiddle(point1, point2){
	return {
		x: point2.x/2 + point1.x/2,
		y: point2.y/2 + point1.y/2,
	};
}

// Compute the x and y fo the intersection point between the segment [point1,
// point2] and the segment [point3, point4].
function computeIntersection(point1, point2, point3, point4){
	let d = (point1.x - point2.x)*(point3.y - point4.y) - (point3.x - point4.x)*(point1.y - point2.y);
	let t = (point1.x*point2.y-point1.y*point2.x)/d;
	let s = (point3.x*point4.y-point3.y*point4.x)/d;

	return {
		x: (point3.x-point4.x)*t-(point1.x-point2.x)*s,
		y: (point3.y-point4.y)*t-(point1.y-point2.y)*s
	};
}

// Compute distance between two points
function distanceTo(x, y, point){
	return (x - point.x)*(x - point.x)+(y - point.y)*(y - point.y)
}

// Proxy an event to use directly the x and y of the mouse on the canvas
function proxyEvent(event, callback){
	canvas[event] = (e) => callback(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
}

// Generate the onmousemove function moving a point around.
function generateMouseMoveHandler(point){
	proxyEvent('onmousemove', function(x, y){
		point.x = x;
		point.y = y;
	});

	// Mouse up clears the mouse move handle.
	canvas.onmouseup = () => canvas.onmousemove = undefined;
}

// On mousedown check if one point is close enought to grab it.
proxyEvent('onmousedown', function(x, y){
	if(distanceTo(x, y, handle1) < 300) {
		generateMouseMoveHandler(handle1);
	} else if(distanceTo(x, y, handle2) < 300) {
		generateMouseMoveHandler(handle2);
	} else if(distanceTo(x, y, handle3) < 300) {
		generateMouseMoveHandler(handle3);
	}
});

// Main render function
function render(){
	clearCanvas();

	// Compute all the dynamic points
	middle1 = computeMiddle(handle1, center)
	middle2 = computeMiddle(handle2, center)
	middle3 = computeMiddle(handle3, center)

	intersection1 = computeIntersection(handle1, middle2, handle2, middle1)
	intersection2 = computeIntersection(handle2, middle3, handle3, middle2)
	intersection3 = computeIntersection(handle1, middle3, handle3, middle1)

	center2 = computeIntersection(handle1, intersection2, handle2, intersection3);

	// Only display the lines if we're debugging
	if(debug){
		drawLines([
			[center, handle1],
			[center, handle2],
			[center, handle3],
		], true);

		if (step > 1){
			drawLines([
				[middle2, handle1],
				[middle3, handle1],
				[middle3, handle2],
				[middle1, handle2],
				[middle1, handle3],
				[middle2, handle3],
			], true);
		}

		if (step > 1){
			drawLines([
				[middle2, handle1],
				[middle3, handle1],
				[middle3, handle2],
				[middle1, handle2],
				[middle1, handle3],
				[middle2, handle3],
			], true);
		}
		if (step > 4){
			drawLines([
				[intersection2, handle1],
				[intersection3, handle2],
				[intersection1, handle3],
			], true);
		}
	}

	if(step > 3){
		drawLines([
			[center, middle1],
			[center, middle2],
			[center, middle3],
			[intersection1, middle1],
			[intersection2, middle2],
			[intersection3, middle3],
			[intersection1, middle2],
			[intersection2, middle3],
			[intersection3, middle1],
		]);
	}

	if(step > 5){
		drawLines([
			[intersection1, center2],
			[intersection2, center2],
			[intersection3, center2],
		]);
	}

	if(step < 6){
		drawPoint(center);
	}

	// draw the handles
	drawPoint(handle1);
	drawPoint(handle2);
	drawPoint(handle3);

	// Draw the points depending on the steps
	if(step > 0 && step < 5){
		drawPoint(middle1);
		drawPoint(middle2);
		drawPoint(middle3);
	}

	if(step > 2 && step < 6){
		drawPoint(intersection1);
		drawPoint(intersection2);
		drawPoint(intersection3);
	}

	if(step > 4 && step < 6){
		drawPoint(center2);
	}
}

// Create and launch the animation frame handler
(function animationFrame() {
	window.requestAnimationFrame(animationFrame);
	render();
})()

// Events handler
changeDebug = e => debug = e.checked;
changeStep  = s => {
	step = s;
	document.getElementsByClassName('displayed')[0].classList.remove('displayed');
	document.getElementById('step'+step).classList.add('displayed');
}
