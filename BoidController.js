var boidCount = 3
var cohesionEase = 100
var avoidanceEase = 1000
var avoidanceDist = .5

AFRAME.registerComponent('boidcontroller',{
  init: function () {
    var scene = document.querySelector('a-scene')
    this.center = THREE.Vector3()
    this.boids = new Array(boidCount)
    for(var i = 0; i < this.boids.length;i++){
      var boid = BuildBoid(i)
      scene.appendChild(boid)
      this.boids[i] = {id: 'boid' + i}
    }
    
  },
  tick: function () {
    var boids = this.boids
    var centerOfMass = new THREE.Vector3()
    for(var i = 0; i < boids.length; i++){
      centerOfMass.add(document.getElementById(boids[i].id).getAttribute('position'))
    }
    centerOfMass.divideScalar(boidCount);
    // Calculate distance to move
    for(var i = 0; i < boids.length;i++){
      var currentEl = document.getElementById(boids[i].id)
      var currentPos = currentEl.object3D.position
      var move = new THREE.Vector3()
      move.add(cohesion(centerOfMass, currentPos))
      move.add(avoidance(boids[i].id, currentPos))
      // move.add(alignment(boids[i]))
      // Match Velocity
      boids[i].velocity = move
    }
    // Move
    for(var i = 0; i < boids.length;i++){
      var currentBoidEl = document.getElementById(boids[i].id)
      var currentPosition = currentBoidEl.object3D.position
      
      currentBoidEl.setAttribute('position', currentPosition.add(boids[i].velocity))
    }
    // COHESION
    function cohesion(centerOfMass, currentPos) {
      var movementVector = centerOfMass.sub(currentPos)
      return movementVector.divideScalar(cohesionEase)
    }
    // AVOIDANCE / SEPARATION
    function avoidance(currentId, currentPos) {
      var amountToMove = new THREE.Vector3()
      var collisionCount = 0
      for(var i = 0; i < boids.length; i++){
        if(currentId != boids[i].id){
          var otherPos = document.getElementById(boids[i].id).object3D.position
          var distanceToOther = currentPos.distanceTo(otherPos)
          if(distanceToOther < avoidanceDist){
            var scale = avoidanceDist - distanceToOther
            console.log(scale)
            collisionCount++
            amountToMove.sub(otherPos.sub(currentPos)).divideScalar(avoidanceEase)
          }
        }
      }
      amountToMove.divideScalar(collisionCount)
      return amountToMove.divideScalar(avoidanceEase);
    }
    // ALIGNMENT
    function alignment(currentId) {
      var amountToMove = new THREE.Vector3(0,0,0)
      for(var j = 0; j < boids.length; j++) {
        if(currentId != boids[j].id) {
          amountToMove.add(document.getElementById(boids[i].id).getAttribute('velocity'))
        }
      }
      amountToMove.divideScalar(boidCount-1)
      amountToMove.sub(document.getElementById(boids[i].id).getAttribute('velocity'))
      amountToMove.divideScalar(8)
      return amountToMove
    }
  }
});

function BuildBoid(index) {
  var sphere = document.createElement('a-sphere')
  sphere.setAttribute('id', 'boid' + index)
  sphere.setAttribute('color', RandomHexColor())
  sphere.setAttribute('radius', '0.25')
  var randomPosition = new THREE.Vector3(Math.random() * 3 - 1.5,Math.random() * 3 - 1.5,Math.random() * 3 - 1.5)
  var startPositions = [
    new THREE.Vector3(1,0,0),
    new THREE.Vector3(-1,0,0),
    new THREE.Vector3(0, 0, 1)
  ]
  sphere.setAttribute('position', randomPosition)
  return(sphere)
}

function RandomHexColor(){
  var colors = '0123456789ABCDEF'
  var color = '#'
  for(var i = 0; i < 6;i++){
    color += colors.charAt(Math.floor(Math.random()*16))
  }
  return color
}