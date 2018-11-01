var renderer = null,
    scene = null,
    camera = null,
    cameraHelper = null
    cameraSpeed = 0.3,
    root = null,
    orbitControls = null,
    loader = null,
    main_character = {},
    trees = [],
    treeXRange = [{min:-52,max:127},{min:-86,max:92},{min:-119,max:56}],
    treeBoxes = [],
    gridSize = 8,
    car = {},
    cars =[],
    carBoxes = [],
    displacement = Math.abs(treeXRange[0].max - treeXRange[0].min)/gridSize,
    lastPos = 0,
    visible = true,
    score = 0,
    blockWidth = 800
    spotLight = null
    gameEnded = false
    plank = null
    planks = []
    waterBlocks = [];

var blockGeometry = new THREE.BoxGeometry( blockWidth, 10 ,displacement );

class Element {
  constructor(object) {
    // this.mesh = new THREE.Mesh(geometry,material);
    // this.mesh.position.set(0.5, 1, 2);
    this.object = object;

    this.cubeBoxHelper = new THREE.BoxHelper(this.object, 0x00ff00);
    this.cubeBoxHelper.update();

    this.cubeBBox = new THREE.Box3();
    this.cubeBBox.setFromObject(this.cubeBoxHelper);
    this.cubeBoxHelper.visible = visible;

  }
}

function loadObj(obj_url, texture_url, callback){
  if(!loader)
  loader = new THREE.OBJLoader();
  loader.load(obj_url,function ( object ) {
      texture = new THREE.TextureLoader().load(texture_url);
      material = new THREE.MeshPhongMaterial({ map: texture});
      geometry = object.children[0].geometry
      element = new THREE.Mesh(geometry, material);
      callback(element);
    },
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
      console.log( 'An error happened' );

    }
  );
}

function loadPig() {
  loadObj('objects/pig.obj', 'objects/pig.png', function(pig){
    main_character.object = pig;
    pig.position.z = 9.5;

    pig.position.x = treeXRange[0].min;
    main_character.resetPosition = pig.position.clone();

    main_character.farthest = pig.position.z;

    pig.scale.set(1.2,1.2,1.1);
    main_character.boxHelper = new THREE.BoxHelper(pig, 0x00ff00);
    main_character.bBox = new THREE.Box3();
    main_character.boxHelper.update();
    main_character.bBox.setFromObject(main_character.boxHelper);
    main_character.boxHelper.visible = visible;


    cameraHelper = new THREE.Object3D;
    cameraHelper.add(camera);
    cameraHelper.add(spotLight);

    scene.add(cameraHelper);
    scene.add(pig);
    scene.add(main_character.boxHelper);

    // scene.add(camera)



    // main_character.newPos = main_character.object.position.clone();
    // main_character.savedPos = main_character.object.position.clone();

  });
}

function loadObj2(obj_url, mtl_url, callback){
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load( mtl_url, function( materials ) {
      materials.preload();
      var objLoader = new THREE.OBJLoader();
      objLoader.setMaterials( materials );
      objLoader.load( obj_url, function ( object ) {
          callback(object);
        }, null, null  );
  });
}

function loadTrees(callback){
  var obj_url = 'objects/Cartoon trees.obj';
  var mtl_url = 'objects/Cartoon trees.mtl';
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load( mtl_url, function( materials ) {
      materials.preload();
      var objLoader = new THREE.OBJLoader();
      objLoader.setMaterials( materials );
      objLoader.load( obj_url, function ( object ) {
          for (var i = 0; i < 3; i++) {
            var tree = {}
            tree.object = object.children[i];
            trees.push(tree);
          }
          callback();
        }, null, null );
  });
}

function loadPlank(){
  var map = new THREE.TextureLoader().load("objects/plankmaterial.jpg");
    var objLoader = new THREE.OBJLoader();
    objLoader.load( 'objects/plank.obj', function ( object ) {
      plank = new THREE.Mesh(object.children[0].geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
      // variar z = 9
      plank.scale.set(9,10,9);
      plank.rotation.y = -Math.PI / 2;
      // scene.add(plank);
    }, null, null  );

    // var mtlLoader = new THREE.MTLLoader();
    // mtlLoader.load( 'objects/plank.mtl', function( materials ) {
    //     materials.preload();
    //     var objLoader = new THREE.OBJLoader();
    //     objLoader.setMaterials( materials );
    //     objLoader.load( 'objects/plank.obj', function ( object ) {
    //
    //         scene.add(object);
    //       }, null, null  );
    // });
}

function loadCar(callback){
    var loader = new THREE.FBXLoader();
    loader.load( 'objects/car.fbx', function ( object ){
      car.object = object;
      car.object.scale.set(.14,.14,.14);
      car.object.position.x += 120;
      car.object.position.y += 6;
      car.object.position.z += 33;

      callback();


    });
  }

function run() {
    requestAnimationFrame(function() { run(); });
    renderer.render( scene, camera );
    orbitControls.update();

    spotLight.position.z -= 1*cameraSpeed;

    cameraHelper.position.z -= 1*cameraSpeed;
    if(cameraHelper.position.z > main_character.object.position.z){
      cameraSpeed += .025
    }
    else{
      cameraSpeed = 0.3;
    }

    diff = Math.abs(cameraHelper.position.z - main_character.object.position.z);
    if(diff > displacement*7 ){
      cameraSpeed = 0;
      gameEnded = true;

      $("#final_score").html(score);
      $(".menu").show();
    }

    KF.update();
    main_character.boxHelper.update();
    main_character.bBox.setFromObject(main_character.boxHelper);

    // CARS
    for (var i = 0; i < cars.length; i++) {
      cars[i].car.position.x -= cars[i].speed;

      if(cars[i].car.position.x < -120){
        cars[i].car.position.x = cars[i].resetPosition.x;
      }
      cars[i].boxHelper.update();
      cars[i].bBox.setFromObject(cars[i].boxHelper);

      if(main_character.bBox.intersectsBox(cars[i].bBox)){
        gameEnded = true;
        main_character.object.position.set(main_character.resetPosition.x,main_character.resetPosition.y,main_character.resetPosition.z);
        main_character.farthest = main_character.resetPosition.z;
        main_character.update();
      }
    }

    // TREES
    for (var i = 0; i < treeBoxes.length; i++) {
      if(main_character.bBox.intersectsBox(treeBoxes[i])){
        bounceBack();
      }
    }

    for (var i = 0; i < planks.length; i++) {
      planks[i].plank.position.x += planks[i].speed;
      if(planks[i].plank.position.x < -120 || planks[i].plank.position.x > 120){
        planks[i].speed = planks[i].speed*-1;
      }
      planks[i].boxHelper.update();
      planks[i].bBox.setFromObject(planks[i].boxHelper);
    }

    for (var i = 0; i < waterBlocks.length; i++) {
      if(main_character.bBox.intersectsBox(waterBlocks[i])){
        if(!main_character.bBox.intersectsBox(planks[i].bBox)){
          gameEnded = true;
          main_character.object.position.set(main_character.resetPosition.x,main_character.resetPosition.y,main_character.resetPosition.z);
          main_character.farthest = main_character.resetPosition.z;
          main_character.update();
        }
        else{
          main_character.object.position.x += planks[i].speed;
        }
      }
    }
}



/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
 // FROM STACKOVERFLOW
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function createGrassBlock(minTrees, maxTrees) {
  var mapUrl = "objects/grass.jpg";
  var map = new THREE.TextureLoader().load(mapUrl);
  var geometry = new THREE.PlaneGeometry(blockWidth, displacement, 10, 10);
  var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.z = -lastPos;
  root.add(mesh);

  createTree(1, treeXRange[1].max + 4*gridSize);
  createTree(1, treeXRange[1].max + 2*gridSize);

  for (var i = 0; i < 5; i++) {
    createTree(1, treeXRange[2].min - (4*i)*gridSize);
  }


  if(maxTrees>0){
    var treeType = Math.floor(Math.random() * 3) + 0;

    var grid = [];
    var gridBlock = Math.abs(treeXRange[treeType].max - treeXRange[treeType].min)/gridSize

    for (var i = 0; i <= gridSize; i++) {
      grid.push(treeXRange[treeType].min + gridBlock*i);
    }

    var nTrees = Math.floor(Math.random() * maxTrees) + minTrees;
    shuffleArray(grid);
    let selected = grid.slice(0,nTrees);

    for (var i = 0; i < nTrees; i++) {
      createTree(treeType, selected[i]);
    }

  }


  lastPos = lastPos + displacement;

}

function createCarBlock(){
  var geometry = new THREE.PlaneGeometry(blockWidth, displacement, 1, 1);
  var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0x949597, side:THREE.DoubleSide}));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.z = -lastPos;
  lastPos = lastPos + displacement;

  mesh2 = mesh.clone();
  mesh2.position.z = -lastPos;

  root.add(mesh);
  root.add(mesh2);
  lastPos = lastPos + displacement;

  createCar(lastPos);

}

function createCar(pos) {
  var newCar = car.object.clone();

  newCar.position.z -= pos;

  var boxHelper = new THREE.BoxHelper(newCar, 0x00ff00);
  var bBox = new THREE.Box3();
  boxHelper.update();
  bBox.setFromObject(boxHelper);
  boxHelper.visible = visible;

  speed = Math.floor(Math.random() * 5) + 1;

  cars.push({car:newCar, speed:speed, boxHelper: boxHelper, bBox:bBox, resetPosition: newCar.position.clone()});

  scene.add(newCar);
  scene.add(boxHelper);
}


function createTree(type, xPosition){
  var tree = trees[type].object.clone();

  tree.position.set(xPosition, -12, -130.5-lastPos);
  tree.scale.set(1.5,1.5,1.2);


  var boxHelper = new THREE.BoxHelper(tree, 0x00ff00);
  boxHelper.update();
  var bBox = new THREE.Box3();
  bBox.setFromObject(boxHelper);
  boxHelper.visible = visible;

  scene.add(tree);
  scene.add(boxHelper);
  treeBoxes.push(bBox);


}

function createWaterBlock() {
  var mapUrl = "objects/water_texture.jpg";
  var map = new THREE.TextureLoader().load(mapUrl);
  var geometry = new THREE.PlaneGeometry(blockWidth, displacement, 1, 1);
  var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, transparent: true, opacity: 0.3,side:THREE.DoubleSide}));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.z = -lastPos;
  mesh.position.y -= 10;
  root.add(mesh);



  var material = new THREE.MeshBasicMaterial( {color: 0xffffff, map:map ,transparent: true, opacity: 0.6} );
  var cube = new THREE.Mesh( blockGeometry, material );
  cube.position.z = -lastPos;
  cube.position.y -= 5;
  root.add( cube );

  boxHelper = new THREE.BoxHelper(cube, 0x00ff00);
  bBox = new THREE.Box3();
  boxHelper.update();
  bBox.setFromObject(boxHelper);
  boxHelper.visible = visible;

  root.add( boxHelper );

  waterBlocks.push(bBox);

  createPlank();

  lastPos = lastPos + displacement;



}

function createPlank() {
  var newPlank = plank.clone();
  newPlank.position.y -= 5;
  newPlank.position.z = -lastPos;

  var boxHelper = new THREE.BoxHelper(newPlank, 0x00ff00);
  boxHelper.update();
  var bBox = new THREE.Box3();
  bBox.setFromObject(boxHelper);
  boxHelper.visible = visible;

  speed = Math.random() * .8 + .2;
  scene.add(boxHelper);

  planks.push({plank:newPlank,boxHelper: boxHelper, bBox: bBox, speed: speed})
  scene.add(newPlank);
}



function createScene(canvas) {
  // Create the Three.js renderer and attach it to our canvas
  renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
  // Set the viewport size
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Turn on shadows
  renderer.shadowMap.enabled = true;
  // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Create a new Three.js scene
  scene = new THREE.Scene();
  // Add  a camera so we can view the scene
  camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
  camera.position.set(50, 150, 112);


  // var aspect = window.innerWidth / window.innerHeight;
  // var d = 20;
  // camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );
  // camera.position.set(50, 150, 112);
  // camera.lookAt( scene.position );

  ambientLight = new THREE.AmbientLight ( 0xc1bfbf);
  root = new THREE.Object3D;
  root.add(ambientLight);

  orbitControls = new THREE.OrbitControls( camera );

  scene.add(root);


  spotLight = new THREE.SpotLight (0x444343);

  spotLight.position.set(0,150,0);

  spotLight.castShadow = true;





  // var createBlocksAll = [(function(){createGrassBlock(0,4)})(), (function(){createCarBlock()})(), (function(){createWaterBlock()})()];
  var createBlocksAll = [(function(){createGrassBlock(0,4);lastBlockWater = false;}), (function(){createCarBlock();lastBlockWater = false;}), (function(){createWaterBlock();lastBlockWater = true;})];

  for (var i = 0; i < 4; i++) {
    createBlocksAll.push((function(){createGrassBlock(0,4)}));
  }
  for (var i = 0; i < 2; i++) {
    createBlocksAll.push((function(){createWaterBlock()}));
  }
  for (var i = 0; i < 2; i++) {
    createBlocksAll.push((function(){createCarBlock()}));
  }

  loadPig();
  loadTrees(function() {
    loadCar(function() {
      createGrassBlock(0,0);
      createWaterBlock();
      for (var i = 0; i < 20; i++) {
        var randomBlock = Math.floor(Math.random() * 9) + 0;
        createBlocksAll[randomBlock]();
      }
    });
  });

  loadPlank();



  main_character.update = function(direction){
    main_character.newPos = main_character.object.position.clone();
    main_character.lastPos = main_character.object.position.clone();

    // camera.newPos = camera.position.clone();
    // camera.lastPos = camera.position.clone();

    switch (direction) {
      case 'L':
        main_character.newPos.x -= displacement;
        // camera.newPos.x -= displacement;
        // main_character.object.rotation.y += Math.PI/2;
        moveCharacter();
        main_character.last = 'L';
        break;
      case 'U':
        // Goes to negative numbers
        main_character.newPos.z -= displacement;
        if(main_character.farthest > main_character.newPos.z){
          main_character.farthest = main_character.newPos.z;
          score += 1;
          $("#score").html(score);
          var randomBlock = Math.floor(Math.random() * 9) + 0;
          createBlocksAll[randomBlock]();
        }
        // camera.newPos.z -= displacement;
        moveCharacter();
        main_character.last = 'U';
        break;
      case 'D':
        main_character.newPos.z += displacement;
        // camera.newPos.z += displacement;
        moveCharacter();
        main_character.last = 'D';
        break;
      case 'R':
        main_character.newPos.x += displacement;
        // camera.newPos.x += displacement;
        // main_character.object.rotation.y -= Math.PI/2;
        moveCharacter();
        main_character.last = 'R';
        break;
    }

  }




  document.addEventListener("keyup", onKeyUp, false);

}

function moveCharacter() {
  animator = new KF.KeyFrameAnimator;
  animator.init({
    interps:
    [{
        keys:[0,.25,.5,.75 ,1],
        values:[
          {x:main_character.object.position.x ,y:0 ,z:main_character.object.position.z },
          {x:main_character.object.position.x ,y:-2 ,z:main_character.object.position.z },
          {x:main_character.object.position.x ,y:0 ,z:main_character.object.position.z },
          {x:main_character.newPos.x,y:2.2,z:main_character.newPos.z},
          {x:main_character.newPos.x,y:0,z:main_character.newPos.z}
        ],
        target: main_character.object.position
      },
    ],
    loop: false,
    duration:200,
  });
  animator.start();
}

function onKeyUp(event){
  if(gameEnded) return;
  switch(event.keyCode){
    case 65:
      main_character.update('L');
      break;
    case 87:
      main_character.update('U');
      break;
    case 83:
      main_character.update('D');
      break;
    case 68:
      main_character.update('R');
      break;
  }
}

function bounceBack(){
  main_character.object.position.set(main_character.lastPos.x,0,main_character.lastPos.z)
  main_character.boxHelper.update();
  main_character.bBox.setFromObject(main_character.boxHelper);
}

function restartGame() {
  location.reload();
}
