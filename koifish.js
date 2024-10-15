/*

NOTES

i think koi length should be ~320-330px not including tail, see saved psd for size
head size from cheek to cheek is 120px, again see psd

order for new features
- resize koi to good size
- add head shape to koi INCLUDING OUTLINE
- add colors
- add side fins near head
- add other side fins
- add tail
- add top fin
- add random motion to koi

/*


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
var boolAnimate = true;

window.onload = function() {
    refreshCanvas();
    koi.draw();
}

function refreshCanvas() {
    c.clearRect(0,0,innerWidth,innerHeight);
    c.fillStyle = BACKGROUND_COLOR;
    c.fillRect(0,0,innerWidth,innerHeight);
}

window.addEventListener("mousemove", event => {
	mousePosX = event.clientX - canvas.clientLeft;
	mousePosY = event.clientY - canvas.clientTop;
});

window.addEventListener("keydown", (event) => {
    if (event.code = 32) {
        boolAnimate = !boolAnimate;
        console.log("space pressed");
    }
});

onkeydown = (event) => {};

// =============================================================================
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// ============================= DEFINE VARIABLES ==============================

const KOI_LENGTH = 9; // Length of koi 
const KOI_BODY_SIZES = [52, 53, 47, 36, 25, 20, 13, 8, 4]; // Adjusts Koi body sizes MAYBE ADD 3 AND 2 TO 2ND AND 3RD POINTS? SEE PHOTO AFTER ADDING HEAD
const KOI_DIRECTION_CHANGE_FREQUENCY = 300; // Higher number is less frequent
const KOI_DEFAULT_SPEED = 4;
const KOI_MAX_ROTATION = radians(4); // Max degrees of rotation per frame
const KOI_BODY_MAX_ANGLE = Math.PI * (5/6); // Max angle 2 vertices can be angled at
const INNER_CIRCLE_RADIUS = 8; // for debug
const INNER_STROKE_WIDTH = 4; // for debug
const OUTER_STROKE_WIDTH = 1; // for debug
const BACKGROUND_COLOR = "#68A7AD";


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

    setDesiredLocation(newPoint) { this.desiredLocation = newPoint; }

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

    update() {
        this.updateDesiredLocation();
        this.moveHeadTowardsGoal();
        this.moveBodyAfterChangeInHead();
        this.draw();
    }


    /**
     * Put the Koi on the canvas
     */
    draw() {
        let debug = false;
        if (debug){
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
        }

        // Start drawing the koi fish
        let verticies = []; // Will hold the outline of the koi
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(Math.PI * (-1/2), this.directions[0])))); // These all go around the head of the fish, this is left side
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(Math.PI * (-1/4), this.directions[0])))); // Left corner (45 degrees)
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], this.directions[0])));                // Top of head/ forward facing point
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(Math.PI/4, this.directions[0]))));  // Right corner (45 degrees)
        verticies.push(add( this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(Math.PI/2, this.directions[0]))));  // Rightmost side 

        // Go down right side of the fish
        for (let i = 1; i < KOI_LENGTH; i++) {
            verticies.push(add( this.points[i], mult(KOI_BODY_SIZES[i], rotate2d(Math.PI * (1/2), this.directions[i])))); 
        }

        // Now around the tail
        verticies.push(add( this.points[KOI_LENGTH - 1], mult(KOI_BODY_SIZES[KOI_LENGTH - 1], rotate2d(Math.PI * (3/4), this.directions[KOI_LENGTH-1]))));  // Add the tail, right side
        verticies.push(add( this.points[KOI_LENGTH - 1], mult(KOI_BODY_SIZES[KOI_LENGTH - 1], negate(this.directions[KOI_LENGTH-1]))));                    // Backmost point
        verticies.push(add( this.points[KOI_LENGTH - 1], mult(KOI_BODY_SIZES[KOI_LENGTH - 1], rotate2d(Math.PI * (-3/4), this.directions[KOI_LENGTH-1])))); // left side

        // Now go up left side
        for (let i = KOI_LENGTH - 1; i > 0; i--) {
            verticies.push(add( this.points[i], mult(KOI_BODY_SIZES[i], rotate2d(Math.PI * (-1/2), this.directions[i])))); 
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
        c.strokeStyle = "black";
        c.lineWidth = 3;
        c.fill();
        c.stroke();
        c.closePath();
        
        if (debug) {
            for (let vert of verticies) {
                c.fillStyle = 'pink';
                c.fillRect(vert[0],vert[1],4,4);
            }
            
        }
        // print points for now
        for (let i =0;i<this.points.length;i++) {
            this.circleAt(this.points[i][0], this.points[i][1], "black");
        }
        /*
        let cheekAngle = 121;
        let cheekDistance = 41;
        let midCheekAngle = 90;
        let midCheekDistance = 61;
        let mouthAngle = 23;
        let mouthDistance = 62;

        let rightCheek = add(this.points[0], mult(cheekDistance, rotate2d(radians(cheekAngle), this.directions[1])));
        let rightMouth = add(this.points[0], mult(mouthDistance, rotate2d(radians(mouthAngle), this.directions[1])));
        let leftCheek = add(this.points[0], mult(cheekDistance, rotate2d(radians(-1 * cheekAngle), this.directions[1])));
        let leftMouth = add(this.points[0], mult(mouthDistance, rotate2d(radians(-1 * mouthAngle), this.directions[1])));
        let midRightCheek = add(this.points[0], mult(midCheekDistance, rotate2d(radians(midCheekAngle), this.directions[1])));

        this.circleAt(rightCheek[0], rightCheek[1], "red");
        this.circleAt(rightMouth[0], rightMouth[1], "red");
        this.circleAt(midRightCheek[-0], midRightCheek[1], "red");

        // top is towards head, bottom towards tail
        let bottomControlDistance = 40;
        let bottomControlAngle = 114;
        let topControlDistance = 50;
        let topControlAngle = 141;
        let midCheekBottomControlDistance = 10;
        let midCheekBottomControlAngle = 0;
        // control points
        let rightCheekControl = add(rightCheek, mult(bottomControlDistance, rotate2d(radians(bottomControlAngle), this.directions[1])));
        let rightMouthControl = add(rightMouth, mult(topControlDistance, rotate2d(radians(topControlAngle), this.directions[1])));
        let temp = mult(midCheekBottomControlDistance, rotate2d(Math.PI/2, normalize(subtract(midRightCheek, this.points[0]))));
        let midRightCheekBottomControl = add(midRightCheek, temp);
        let midRightCheekTopControl = add(midRightCheek, negate(temp));
        let leftCheekBottomControl = add(leftCheek, mult(bottomControlDistance, rotate2d(radians(-1 * bottomControlAngle), this.directions[1])));
        let leftCheekTopControl = add(leftMouth, mult(topControlDistance, rotate2d(radians(-1* topControlAngle), this.directions[1])));
        


        this.circleAt(rightCheekControl[0], rightCheekControl[1], "purple");
        this.circleAt(rightMouthControl[0], rightMouthControl[1], "purple");
        this.circleAt(midRightCheekBottomControl[0], midRightCheekBottomControl[1], "purple");
        this.circleAt(midRightCheekTopControl[0], midRightCheekTopControl[1], "purple");
        


        c.beginPath();
        c.strokeStyle = "purple";
        c.lineWidth = 2;
        c.moveTo(rightCheek[0], rightCheek[1]);
        c.bezierCurveTo(rightCheekControl[0], rightCheekControl[1], midRightCheekBottomControl[0], midRightCheekBottomControl[1], midRightCheek[0], midRightCheek[1]);
        c.bezierCurveTo(midRightCheekTopControl[0], midRightCheekTopControl[1], rightMouthControl[0], rightMouthControl[1], rightMouth[0], rightMouth[1]);
        c.stroke();
        c.closePath();
        */
        /*
        c.beginPath();
        c.strokeStyle = "purple";
        c.lineWidth = 2;
        c.moveTo(leftCheek[0], leftCheek[1]);
        c.bezierCurveTo(leftCheekBottomControl[0], leftCheekBottomControl[1], leftCheekTopControl[0], leftCheekTopControl[1], leftMouth[0], leftMouth[1]);
        c.stroke();
        c.closePath();
        */

        
        // print sides of head
        // get the cheeks and mouth locations
        let leftCheek = add(this.points[0], rotate2d(Math.PI * (-4/7), mult(KOI_BODY_SIZES[0] + 2, this.directions[1])));
        let rightCheek = add(this.points[0], rotate2d(Math.PI * (4/7), mult(KOI_BODY_SIZES[0] + 2, this.directions[1])));
        let mouth = add(this.points[0], mult(KOI_BODY_SIZES[0] + 16, this.directions[1]));
        this.circleAt(leftCheek[0], leftCheek[1], "pink");
        this.circleAt(rightCheek[0], rightCheek[1], "green");
        this.circleAt(mouth[0], mouth[1], "black");

        let headToEllipseCenter = 30;

        // find the center for the ellipses
        let leftCenter = add(this.points[0], rotate2d(Math.PI * (-1/4), mult(headToEllipseCenter, this.directions[1])));
        let rightCenter = add(this.points[0], rotate2d(Math.PI * (1/4), mult(headToEllipseCenter, this.directions[1])));
        this.circleAt(leftCenter[0], leftCenter[1], "red");
        this.circleAt(rightCenter[0], rightCenter[1], "red");

        // variables for next
        let cheekXRadius = 54;
        let cheekYRadius = 22;
        let xAxis = vec2(1,0);
        let ellipseRotation = 3;

        // find the angle of rotation for the ellipses, from x-axis
        let rightRotation = angleBetween(xAxis, subtract(rightCheek, mouth)) - radians(ellipseRotation);
        c.beginPath();
        c.fillStyle = "white";
        c.ellipse(rightCenter[0], rightCenter[1], cheekXRadius, cheekYRadius, rightRotation, 0, Math.PI*2);
        //c.fill();
        c.closePath();
        c.beginPath();
        c.ellipse(rightCenter[0], rightCenter[1], cheekXRadius, cheekYRadius, rightRotation, Math.PI * (5/24), Math.PI, true);
        c.strokeStyle = "black";
        c.lineWidth = 3;
        c.stroke();
        c.closePath();

        let leftRotation = angleBetween(xAxis, subtract(leftCheek, mouth)) + radians(ellipseRotation);
        c.beginPath();
        c.fillStyle="white";
        c.ellipse(leftCenter[0], leftCenter[1], cheekXRadius, cheekYRadius, leftRotation, 0, Math.PI*2);
        //c.fill();
        c.closePath();
        c.beginPath();
        c.ellipse(leftCenter[0], leftCenter[1], cheekXRadius, cheekYRadius, leftRotation, Math.PI * (-5/24), Math.PI);
        c.strokeStyle = "black";
        c.lineWidth = 3;
        c.stroke();
        c.closePath();

        let mouthRotation = Math.PI * (11/16);
        let mouthDistance = 27;
        // Find edges of mouth
        let rightMouth = add(mouth, rotate2d(mouthRotation, mult(mouthDistance, this.directions[1])));
        let leftMouth = add(mouth, rotate2d(-1 * mouthRotation, mult(mouthDistance, this.directions[1])));
        this.circleAt(rightMouth[0], rightMouth[1], "purple");
        this.circleAt(leftMouth[0], leftMouth[1], "purple");
        
        // Now get control points
        let mouthControlRotation = radians(10);
        let mouthControlDistance = 20;
        let rightMouthControl = add(rightMouth, mult(mouthControlDistance, rotate2d(mouthControlRotation, this.directions[1])));
        let leftMouthControl = add(leftMouth, mult(mouthControlDistance, rotate2d(-1 * mouthControlRotation, this.directions[1])))
        this.circleAt(rightMouthControl[0], rightMouthControl[1], 'purple');
        this.circleAt(leftMouthControl[0], leftMouthControl[1], 'purple');

        c.beginPath();
        c.moveTo(rightMouth[0], rightMouth[1]);
        c.bezierCurveTo(rightMouthControl[0], rightMouthControl[1], leftMouthControl[0], leftMouthControl[1], leftMouth[0], leftMouth[1]);
        c.strokeStyle = "black";
        c.lineWidth = 3;
        c.stroke();
        c.closePath();


    }   // End draw function

    //debug function, print circle at x,y
    circleAt(x, y, color) {
        c.beginPath();
        c.arc(x, y, 2, 0, Math.PI * 2)
        c.lineWidth = 1;
        c.strokeStyle = color;
        c.stroke();
        c.closePath();
    }

    draw2() {
        let debug = true;
        c.fillStyle = "pink";

        c.beginPath();
        let h5 = add(this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(Math.PI * (1/2), this.directions[0])));
        c.moveTo(h5[0], h5[1]); // Right side of head

        // Go down right side of fish
        for (let i = 1; i < KOI_LENGTH - 1; i++) {
            let side = add(this.points[i], mult(KOI_BODY_SIZES[i], rotate2d(Math.PI/2, this.directions[i])));
            let cp = add(this.points[i], mult(KOI_BODY_SIZES[i], rotate2d(Math.PI * (-1/2), normalize(subtract(this.points[i+1], this.points[i])))));
            c.fillStyle="green";
            c.fillRect(cp[0], cp[1], 4, 4);
            c.lineTo(side[0], side[1]);
            if (debug) {
                c.fillStyle = "pink";
                c.fillRect(side[0], side[1], 4, 4);
            }
        }

        // Go around tail
        let leftTail = add(this.points[KOI_LENGTH-1], mult(KOI_BODY_SIZES[KOI_LENGTH-1], rotate2d(Math.PI/2, this.directions[KOI_LENGTH-1])));
        let tail = add(this.points[KOI_LENGTH-1], mult(KOI_BODY_SIZES[KOI_LENGTH-1], rotate2d(Math.PI, this.directions[KOI_LENGTH-1])));
        let rightTail = add(this.points[KOI_LENGTH-1], mult(KOI_BODY_SIZES[KOI_LENGTH-1], rotate2d(Math.PI * (-1/2), this.directions[KOI_LENGTH-1])));
        c.lineTo(leftTail[0], leftTail[1]);
        c.lineTo(tail[0], tail[1]);
        c.lineTo(rightTail[0], rightTail[1]);

        // Go up left side
        for (let i = KOI_LENGTH - 2; i > 0; i--) {
            let side = add(this.points[i], mult(KOI_BODY_SIZES[i], rotate2d(Math.PI* (-1/2), this.directions[i])));
            let cp = add(this.points[i], mult(KOI_BODY_SIZES[i], rotate2d(Math.PI * (1/2), normalize(subtract(this.points[i+1], this.points[i])))));
            c.fillStyle="green";
            c.fillRect(cp[0], cp[1], 4, 4);
            c.lineTo(side[0], side[1]);
            if (debug){
                c.fillStyle = "pink";
                c.fillRect(side[0], side[1], 4, 4);
            }
        }

        // Go around head
        let h1 = add(this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(Math.PI * (-1/2), this.directions[0])));
        c.lineTo(h1[0], h1[1]);
        let h2 = add(this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(Math.PI * (-1/4), this.directions[0])));
        c.lineTo(h2[0], h2[1]);
        let h3 = add(this.points[0], mult(KOI_BODY_SIZES[0], this.directions[0]));
        c.lineTo(h3[0], h3[1]);
        let h4 = add(this.points[0], mult(KOI_BODY_SIZES[0], rotate2d(Math.PI * (1/4), this.directions[0])));
        c.lineTo(h4[0], h4[1]);
        c.lineTo(h5[0], h5[1]);

        //c.fillStyle = "red";
        //c.fill();

        if (debug){
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
        }

    }   // End draw function

    updateDesiredLocation() {
        this.desiredLocation = vec2(mousePosX, mousePosY);
    }

    moveHeadTowardsGoal() {
        // Set direction of head
        let angle = angleBetween(this.directions[0], subtract(this.desiredLocation, this.points[0])); // Angle between head and destination (radians)
        if (angle > 0.0001) {
            this.directions[0] = rotate2d(Math.min(KOI_MAX_ROTATION, angle), this.directions[0]);
        } else if (angle < 0.0001) {
            this.directions[0] = rotate2d(Math.max(-1 * KOI_MAX_ROTATION, angle), this.directions[0]);
        }

        // Set speed based on distance to goal
        this.speed = (distance(this.desiredLocation, this.points[0]) < 20) ? 0 : KOI_DEFAULT_SPEED;

        // Update head's location
        this.points[0] = add(this.points[0], mult(this.speed, this.directions[0]));
    }

    moveBodyAfterChangeInHead() {
        
        // Now update the rest of the body from the change in the head
        for (let i = 1; i < KOI_LENGTH; i++) {
            let newDirection = normalize(subtract(this.points[i-1], this.points[i]));
            newDirection = this.constrainAngle(newDirection, this.directions[i-1], KOI_BODY_MAX_ANGLE);
            this.directions[i] = newDirection;
            this.points[i] = add(this.points[i-1], setMagnitude(KOI_BODY_SIZES[i-1], negate(newDirection)));
        }
    }

    // Ensure the distance between vertices = constraint
    constrainDistance(vertex, anchor, constraint) {
        return setMagnitude(constraint, add(anchor, sub(vertex, anchor)));
    }

    // Ensure that the angle of flexion between verticies cannot be too acute
    // Returns a vector adjusted by the proper angle
    constrainAngle(vertex, anchor, constraint) {

        let angle = angleBetween(negate(vertex), anchor);
        if (Math.abs(angle) > constraint) return vertex; // Angle is good so return vector

        if (angle > 0) {
            return negate(rotate2d(-1 * constraint, anchor)); // Angle is bad, rotate by constraint clockwise
        }
        if (angle < 0) {
            return negate(rotate2d(constraint, anchor)); // Angle bad, rotate counter clockwise
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
    if (boolAnimate) {
        refreshCanvas();
        koi.update();
    }
}
var koi = initializeFish(); 
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