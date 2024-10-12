// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  ============================ PRE-ART SETUP =================================

const canvas = document.querySelector('canvas');
/** @type {CanvasRenderingContext2D} */
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


window.onload = function() {
    c.fillStyle = "#243642";
    c.fillRect(0,0,innerWidth,innerHeight);
    drawSomething();
}

// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// ============================= DEFINE VARIABLES ==============================

const KOI_LENGTH = 5;
const KOI_BODY_SIZES = [60, 35, 45, 30, 20];
const INNER_CIRCLE_RADIUS = 8;
const INNER_STROKE_WIDTH = 4;
const OUTER_STROKE_WIDTH = 1;


// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// =========================== CREATING THE KOI FISH ===========================

function drawSomething() {
    //koi.moveHeadAndUpdatePoints();
    koi.draw();
    koi.updateDirection();
}

// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// =========================== CREATING THE KOI FISH ===========================


class Koi {

    // Array of vectors that represent the vertices of the Koi
    points = [];
    directions = [];


    speed = 2;
    direction;

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

        let verticies = [];
        // Draw the outline
        // start at the head's radius' leftmost vertex, work around the head, down the right side of the body and back up
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(-90, this.directions[0])))); 
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(-45, this.directions[0])))); 
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], this.directions[0])));
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(45, this.directions[0])))); 
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(90, this.directions[0]))));

        // Go down right side
        for (let i = 1; i < KOI_LENGTH; i++) {
            verticies.push(add( this.points[i], mult(KOI_BODY_SIZES[i], rotate2d(90, this.directions[i])))); 
        }

        verticies.push(add( this.points[KOI_LENGTH - 1], mult(KOI_BODY_SIZES[KOI_LENGTH - 1], rotate2d(135, this.directions[KOI_LENGTH-1]))));
        verticies.push(add( this.points[KOI_LENGTH - 1], mult(KOI_BODY_SIZES[KOI_LENGTH - 1], negate(this.directions[0])))); 
        verticies.push(add( this.points[KOI_LENGTH - 1], mult(KOI_BODY_SIZES[KOI_LENGTH - 1], rotate2d(-135, this.directions[KOI_LENGTH-1]))));  

        // Now go around the tail up left side
        for (let i = KOI_LENGTH - 1; i > 0; i--) {
            verticies.push(add( this.points[i], mult(KOI_BODY_SIZES[i], rotate2d(-90, this.directions[i])))); 
        }

        /*
        c.moveTo(verticies[0][0], verticies[0][1]);
        c.beginPath();
        for (let vertex of verticies) {
            c.lineTo(vertex[0], vertex[1]);
        }
        c.strokeStyle = "red";
        c.lineWidth = 4;
        c.stroke();
        */

        let fxc = (verticies[0][0] + verticies[verticies.length-1][0]) / 2;
        let fyc = (verticies[0][1] + verticies[verticies.length-1][1]) / 2;
        c.fillStyle = "green";
        c.fillRect(fxc, fyc, 4, 4);
        c.beginPath();
        c.moveTo(fxc, fyc);
        for (let i = 0; i < verticies.length - 1; i++) {
            let xc = (verticies[i][0] + verticies[i+1][0]) / 2;
            let yc = (verticies[i][1] + verticies[i+1][1]) / 2;
            c.quadraticCurveTo(verticies[i][0], verticies[i][1], xc, yc);
        }
        c.quadraticCurveTo(verticies[verticies.length-1][0], verticies[verticies.length-1][1], fxc, fyc);
        c.strokeStyle = "red";
        c.lineWidth = 3;
        c.stroke();
    }   

    updateDirection() {
        let rot = rotate2d(-90, this.directions[0]);
        rot = add(mult(80, rot), this.points[0]);
        c.strokeStyle = "white";
        c.beginPath();
        c.arc(rot[0], rot[1], 8, 0, Math.PI * 2);
        c.lineWidth = 4;
        c.stroke();
        c.closePath();
    }

    moveHeadAndUpdatePoints() {
        this.points[0] = add(this.points[0], mult(this.speed, this.directions[0]));
        for (let i = 1; i < KOI_LENGTH; i++) {
            let newDirection = normalize(subtract(this.points[i], this.points[i-1]));
            this.directions[i] = newDirection;
            this.points[i] = add(this.points[i-1], mult(KOI_BODY_SIZES[i-1], newDirection))
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
    koi.moveHeadAndUpdatePoints();
    koi.draw();
}
var koi = initializeFish();
//animate();

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