// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  ============================ PRE-ART SETUP =================================

const canvas = document.querySelector('canvas');
/** @type {CanvasRenderingContext2D} */
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var mousePosX = 0;
var mousePosY = 0;


window.onload = function() {
    c.fillStyle = "#243642";
    c.fillRect(0,0,innerWidth,innerHeight);
    let A = vec2(300,400);
    let B = vec2(300,500);
    let C = vec2(500,500);
    let D = vec2(600,800);
    let E = vec2(100,700);
    c.fillStyle = "red";
    c.fillRect(A[0],A[1],4,4);
    c.fillStyle = "green";
    c.fillRect(B[0],B[1],4,4);
    c.fillStyle = "purple";
    c.fillRect(C[0],C[1],4,4);
    c.fillStyle = "pink";
    c.fillRect(D[0],D[1],4,4);
    c.fillStyle = "white";
    c.fillRect(E[0],E[1],4,4);
    console.log("B,A: "+angleBetween(vec2(1,1), subtract(A, B)));
    console.log("B,C: "+angleBetween(vec2(1,1), subtract(C, B)));
    console.log("B,D: "+angleBetween(vec2(1,1), subtract(D, B)));
    console.log("B,E: "+angleBetween(vec2(1,1), subtract(E, B)));
    console.log("rotate: " + rotate2d(45, vec2(1,0)));
}

window.addEventListener("mousemove", event => {
	mousePosX = event.clientX - canvas.clientLeft;
	mousePosY = event.clientY - canvas.clientTop;
});

// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// ============================= DEFINE VARIABLES ==============================

const KOI_LENGTH = 6; // Length of koi
const KOI_BODY_SIZES = [40, 40, 40, 40, 40, 40]; // Adjusts Koi body sizes
const KOI_DIRECTION_CHANGE_FREQUENCY = 300; // Higher number is less frequent
const KOI_DEFAULT_SPEED = 3;
const KOI_MAX_ROTATION = 4; // Max degrees of rotation per frame
const INNER_CIRCLE_RADIUS = 8; // for debug
const INNER_STROKE_WIDTH = 4; // for debug
const OUTER_STROKE_WIDTH = 1; // for debug


// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// =========================== CREATING THE KOI FISH ===========================


// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// =========================== CREATING THE KOI FISH ===========================


class Koi {

    points = []; // Holds the verices starting with the head and moving towards the tail
    directions = []; // Directions of each vertex
    speed = KOI_DEFAULT_SPEED; // Speed of fish moving forwards
    desiredRotationAngle; // Total rotation desired until we stop rotating (this number will approach zero as we rotate)
    desiredLocation = vec2(1,1); // vec2 coords of point on screen to travel to

    /**
     * Creates a Koi fish object
     * @param {*} head vec2 - head of the koi
     * @param {*} direction NORMALIZED vec2 - direction to create the body from the head
     */
    constructor(head, direction) {
        this.points.push( vec2(head[0], head[1]) );
        this.directions.push(direction);
        for (let i = 1; i < KOI_LENGTH; i++) {
            let distance = mult(KOI_BODY_SIZES[i-1], negate(direction));
            this.points.push( add(this.points[i-1], distance) );
            this.directions.push(direction);
        }
    }


    setDesiredLocation(newPoint) {
        this.desiredLocation = newPoint
    }


    /**
     * Put the Koi on the canvas
     */
    draw() {
        
        c.strokeStyle = "white";
        for (let i = 0; i < KOI_LENGTH; i++) {

            // Draw the inner circle
            c.beginPath();
            c.arc(this.points[i][0], this.points[i][1], 8, 0, Math.PI * 2);
            c.lineWidth = 4;
            c.stroke();
            c.closePath();
            // Draw the outer circle
            c.beginPath();
            c.arc(this.points[i][0], this.points[i][1], KOI_BODY_SIZES[i], 0, Math.PI * 2)
            c.lineWidth = 1;
            c.stroke();
            c.closePath();
        }
        /*
        // Start drawing the koi fish
        let verticies = []; // Will hold the outline of the koi
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(-90, this.directions[0])))); // These all go around the head of the fish, this is left side
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(-45, this.directions[0])))); // Left corner (45 degrees)
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], this.directions[0])));                // Top of head/ forward facing point
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(45, this.directions[0]))));  // Right corner (45 degrees)
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(90, this.directions[0]))));  // Rightmost side 

        // Go down right side of the fish
        for (let i = 1; i < KOI_LENGTH; i++) {
            verticies.push(add( this.points[i], mult(KOI_BODY_SIZES[i], rotate2d(-90, this.directions[i])))); 
        }

        verticies.push(add( this.points[KOI_LENGTH - 1], mult(KOI_BODY_SIZES[KOI_LENGTH - 1], rotate2d(135, this.directions[KOI_LENGTH-1]))));  // Add the tail, right side
        verticies.push(add( this.points[KOI_LENGTH - 1], mult(KOI_BODY_SIZES[KOI_LENGTH - 1], negate(this.directions[0]))));                    // Backmost point
        verticies.push(add( this.points[KOI_LENGTH - 1], mult(KOI_BODY_SIZES[KOI_LENGTH - 1], rotate2d(-135, this.directions[KOI_LENGTH-1])))); // left side

        // Now go around the tail up left side
        for (let i = KOI_LENGTH - 1; i > 0; i--) {
            verticies.push(add( this.points[i], mult(KOI_BODY_SIZES[i], rotate2d(-90, this.directions[i])))); 
        }

        // Now we need to make the path of the outline
        // We will use the actual points as context points, and move the curve to the midpoint between every two points
        let fxc = (verticies[0][0] + verticies[verticies.length-1][0]) / 2; // center points between first and last vertices
        let fyc = (verticies[0][1] + verticies[verticies.length-1][1]) / 2; // y coord of it

        c.beginPath();
        c.moveTo(fxc, fyc); // Start at that first center point
        for (let i = 0; i < verticies.length - 1; i++) {
            let xc = (verticies[i][0] + verticies[i+1][0]) / 2; // Get the midpoint between the current and next point
            let yc = (verticies[i][1] + verticies[i+1][1]) / 2;
            c.quadraticCurveTo(verticies[i][0], verticies[i][1], xc, yc); // Now move from one midpoint to the next, using current point as context path
        }
        c.quadraticCurveTo(verticies[verticies.length-1][0], verticies[verticies.length-1][1], fxc, fyc); // Draw to the last midpoint
        c.fillStyle = "white";
        c.fill();
        c.closePath();
        */
    }   // End draw function


    turnTowardsGoal() {
        let angle = angleBetween(this.directions[0], subtract(this.desiredLocation, this.points[0])); // Angle between head and destination (radians)
        if (angle > 0.0001) {
            this.directions[0] = rotate2d(Math.min(KOI_MAX_ROTATION, angle), this.directions[0]);
        } else if (angle < 0.0001) {
            this.directions[0] = rotate2d(Math.max(-1 * KOI_MAX_ROTATION, angle), this.directions[0]);
        }
    }

    updateDesiredLocation() {
        this.desiredLocation = vec2(mousePosX, mousePosY);
    }

    updateDirectionByDesiredAngle() {
        if (this.desiredRotationAngle != 0) {
            if (this.desiredRotationAngle > 0) {
                this.directions[0] = rotate2d(this.rotationSpeed, this.directions[0]);
                this.desiredRotationAngle = (this.desiredRotationAngle - this.rotationSpeed < 0) ? 0 : this.desiredRotationAngle - this.rotationSpeed;
            } else {
                this.directions[0] = rotate2d(-1 * this.rotationSpeed, this.directions[0]);
                this.desiredRotationAngle = (this.desiredRotationAngle + this.rotationSpeed > 0) ? 0 : this.desiredRotationAngle + this.rotationSpeed;
            }
        }
    }


    updateDesiredRotation() {
        if (Math.floor(Math.random() * KOI_DIRECTION_CHANGE_FREQUENCY) != 1) return;
        let x = Math.floor(Math.random * innerWidth) - this.points[0][0];
        let y = Math.floor(Math.random * innerHeight) - this.points[0][1];
        let theta = Math.floor(degrees(Math.atan(y/x)));
        if (Math.random() > 0.50) {
            theta = -1 * (360 - theta);
        }
        this.desiredRotationAngle = theta;
    }
    

    moveHeadAndUpdatePoints() {
        if (distance(this.desiredLocation, this.points[0]) < 20) {
            this.speed = 0;
        } else {
            this.speed = KOI_DEFAULT_SPEED;
        }
        this.points[0] = add(this.points[0], mult(this.speed, this.directions[0]));
        for (let i = 1; i < KOI_LENGTH; i++) {
            let newDirection = normalize(subtract(this.points[i-1], this.points[i]));
            this.directions[i] = newDirection;
            this.points[i] = add(this.points[i-1], mult(KOI_BODY_SIZES[i-1], negate(newDirection)));
        }
    }

} // End of Koi class

function initializeFish() {
    let vFP = vec2(Math.floor(innerWidth/2), Math.floor(innerHeight/2));
    let vRP = vec2(Math.floor(Math.random() * innerWidth), Math.floor(Math.random() * innerHeight));
    vRP = normalize(vRP);
    return new Koi(vFP, vRP);
}



// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// =========================== ANIMATING THE PICTURE ===========================

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0,0,innerWidth,innerHeight);
    c.fillStyle = "#243642";
    c.fillRect(0,0,innerWidth,innerHeight);
    koi.updateDesiredLocation();
    koi.turnTowardsGoal();
    koi.moveHeadAndUpdatePoints();
    koi.draw();
}
var koi = initializeFish();
//koi.updateDesiredRotation();
animate();

// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// ========================= FUNCTIONS USED BY PROGRAM =========================

// By subtracting one vector from the other we get the distance between them
// Then normalize it to get just the direction from 1st to 2nd vertice
// Then mult by the 'radius' of the 1st vertice to get a point on that radius in that direction
// Add it to the 1st vertice's vector to get that actual point instead of having it around the origin
// By moving the 1st vertex then calling this function on the 2nd, we can make the 2nd vertex
// 'follow' the 1st at a distance of the radius
function constrainVertex(vFP, vSP, radius) {
    return add(vFP, mult(radius, normalize(subtract(vSP, vFP))));
}

function pickRandomPoint() {
    return vec2(Math.floor(Math.random() * innerWidth), Math.floor(Math.random() * innerHeight));
}