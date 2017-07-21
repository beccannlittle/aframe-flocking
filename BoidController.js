// Psuedocode: http://www.kfish.org/boids/pseudocode.html

var boidCount = 5
var terminalVelocity = 0.025
var cohesionEase = 1000
var avoidanceDist = 1
var avoidanceEase = 1500
var alignmentEase = 8

AFRAME.registerSystem('boidcontroller', {
  schema: {
    boids: {default: []}
  },
  init: function() {
    var scene = document.querySelector('a-scene')
    for(var i = 0; i < boidCount;i++){
      var boid = BuildBoid(i)
      scene.appendChild(boid)
      this.data.boids[i] = {
        id: 'boid' + i,
        velocity: null
      }
    }
  }
})

AFRAME.registerComponent('boidcontroller',{
  tick: function () {
    //MAIN
    var boids = this.system.data.boids

    var cohesionVector, avoidVector, alignVector = new THREE.Vector3()
    
    for(var i = 0; i < boids.length;i++){
      
      var currentId = boids[i].id
      var currentEl = document.getElementById(currentId)
      
      var currentPos = currentEl.object3D.position
      var currentVel = boids[i].velocity || new THREE.Vector3(0,0,0)

      
      //Generate Vectors
      cohesionVector = this.cohesion(boids, currentPos,currentId)
      avoidVector = this.avoidance(boids,currentPos, currentId, currentEl)
      alignVector = this.alignment(boids,currentPos, currentId)
      
      //Combine Velocities
      var newVelocity = currentVel
      newVelocity.add(cohesionVector)
      newVelocity.add(avoidVector)
      //newVelocity.add(alignVector)
      
      newVelocity.clampLength(0,terminalVelocity)
        
      
      boids[i].velocity = newVelocity

      //Update Position
      var newPosition = currentPos.add(newVelocity)
      var posString = newPosition.x + ' ' + newPosition.y + ' ' + newPosition.z
      currentEl.setAttribute('position', posString)
      
    }
    //END OF MAIN
  },
  cohesion: function(boids, currentPos, currentId) {
    var movement = new THREE.Vector3()
    for(var i = 0; i < boids.length;i++){
      if(currentId != boids[i].id) {
        var otherBoidEl = document.getElementById(boids[i].id)
        var otherBoidPos = otherBoidEl.object3D.position
        movement.add(otherBoidPos)
      }
    }
    movement = movement.divideScalar(boidCount-1)
    return (movement.sub(currentPos)).divideScalar(cohesionEase)
  },
  avoidance: function (boids, currentPos, currentId, currentEl){
    var movement = new THREE.Vector3(0,0,0)
    for(var i = 0; i < boids.length;i++){
      if(currentId != boids[i].id) {
        var otherBoidEl = document.getElementById(boids[i].id)
        var otherBoidPos = otherBoidEl.object3D.position
        var combinedRadius = parseFloat(currentEl.getAttribute('radius')) + parseFloat(otherBoidEl.getAttribute('radius'))
        if(otherBoidPos.distanceTo(currentPos) < (avoidanceDist + combinedRadius)){
          movement.sub(otherBoidPos).sub(currentPos)
        }
      }
    }
    
    return movement.divideScalar(avoidanceEase)
    
    
  },
  alignment: function (boids,currentPos, currentId){
    // var movement = new THREE.Vector3()
    // for(var i = 0; i < boids.length;i++){
    //   if(currentId != boids[i].id) {
    //     var otherBoidVel = boids[i].velocity
    //     movement.add(otherBoidVel)
    //   }
    // }
    // movement = movement.divideScalar(boidCount-1)
    // return (movement.sub(currentPos)).divideScalar(alignmentEase)
  }
});

function BuildBoid(index) {
  var sphere = document.createElement('a-sphere')
  sphere.setAttribute('id', 'boid' + index)
  sphere.setAttribute('color', RandomHexColor())
  sphere.setAttribute('radius', '0.25')
  var randomPosition = RandomPosition()
  var startPositions = [
    new THREE.Vector3(1,0,0),
    new THREE.Vector3(-1,0,0),
    new THREE.Vector3(0, 0, 1)
  ]
  sphere.setAttribute('position', randomPosition)
  //console.log('Starting Pos='+randomPosition.x+'.'+randomPosition.y+'.'+randomPosition.z)
  // sphere.setAttribute('position', startPositions[index])
  
  //console.log('Starting Pos='+startPositions[index].x+'.'+startPositions[index].y+'.'+startPositions[index].z)
  return(sphere)
}

function RandomPosition(){
  return new THREE.Vector3(Math.random() * 3 - 1.5,Math.random() * 3 - 1.5,Math.random() * 3 - 1.5)
}

function RandomHexColor(){
  var colors = '0123456789ABCDEF'
  var color = '#'
  for(var i = 0; i < 6;i++){
    color += colors.charAt(Math.floor(Math.random()*16))
  }
  return color
}