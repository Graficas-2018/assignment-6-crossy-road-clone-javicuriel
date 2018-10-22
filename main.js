var renderer = null,
    scene = null,
    camera = null,
    root = null,
    orbitControls = null,
    loader = null,
    main_character = {},
    trees = [],
    car = {};

class Element {
  constructor(object) {
    // this.mesh = new THREE.Mesh(geometry,material);
    // this.mesh.position.set(0.5, 1, 2);
    this.object = object;

    this.cubeBoxHelper = new THREE.BoxHelper(this.object, 0x00ff00);
    this.cubeBoxHelper.update();

    this.cubeBBox = new THREE.Box3();
    this.cubeBBox.setFromObject(this.cubeBoxHelper);
    this.cubeBoxHelper.visible = false;

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

function loadCar(callback){
    var loader = new THREE.FBXLoader();
    loader.load( 'objects/car.fbx', function ( object ){
      callback(object);
    });
  }

function run() {
    requestAnimationFrame(function() { run(); });
    renderer.render( scene, camera );
    orbitControls.update();


    car.object.position.x -= 2;


    if(car.object.position.x < -100){
      car.object.position.x = 100;
    }
    car.boxHelper.update();
    car.bBox.setFromObject(car.boxHelper);

    if(main_character.bBox.intersectsBox(trees[0].bBox)){
      bounceBack();
    }
    if(main_character.bBox.intersectsBox(trees[1].bBox)){
      bounceBack();
    }
    if(main_character.bBox.intersectsBox(trees[2].bBox)){
      bounceBack();
    }

    if(main_character.bBox.intersectsBox(car.bBox)){
      main_character.object.position.set(0,0,0);
      main_character.update()
    }
}

function bounceBack(){
  switch (main_character.last) {
    case 'U':
      main_character.movements['D'](10);
      break;
    case 'D':
      main_character.movements['U'](10);
      break;
    case 'R':
      main_character.movements['L'](10);
      break;
    case 'L':
      main_character.movements['R'](10);
      break;
    default:
      break;
  }
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
  camera.position.set(-2, 6, 12);
  scene.add(camera);

  ambientLight = new THREE.AmbientLight ( 0x888888 );
  root = new THREE.Object3D;
  root.add(ambientLight);

  orbitControls = new THREE.OrbitControls( camera );



  var mapUrl = "../images/checker_large.gif";
  var map = new THREE.TextureLoader().load(mapUrl);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);
  var geometry = new THREE.PlaneGeometry(200, 200, 10, 10);
  var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.z = -40;
  root.add( mesh );

  scene.add(root);

  // trees = [];
  loadObj2('objects/Cartoon trees.obj', 'objects/Cartoon trees.mtl', function(object){
    for (var i = 0; i < 3; i++) {
      var tree = {}

      tree.object = object.children[i];

      trees.push(tree);
    }
    var vec = new THREE.Vector3( 0, 0, 0);
    for (var i = 0; i < trees.length; i++) {
      trees[i].object.position.set(0, -12, -200);
      trees[i].object.scale.set(1.5,1.5,1.5);
      scene.add(trees[i].object);


      trees[i].boxHelper = new THREE.BoxHelper(trees[i].object, 0x00ff00);
      trees[i].boxHelper.update();
      trees[i].bBox = new THREE.Box3();
      trees[i].bBox.setFromObject(trees[i].boxHelper);
      trees[i].boxHelper.visible = true;

      scene.add(trees[i].boxHelper);
      // console.log(trees[i]);
    }
    // for (var i = 0; i < 20; i++) {
    //   scene.add(trees[1].clone());
    //   trees[1].scale.set(1.5,1.5,1.5);
    //   trees[1].position.set(10*i, -12, -200);
    //
    // }
  });



  loadObj('objects/pig.obj', 'objects/pig.png', function(pig){
    main_character.object = pig;

    main_character.boxHelper = new THREE.BoxHelper(pig, 0x00ff00);
    main_character.boxHelper.update();
    main_character.bBox = new THREE.Box3();
    main_character.bBox.setFromObject(main_character.boxHelper);
    main_character.boxHelper.visible = true;

    scene.add(pig);
    scene.add(main_character.boxHelper);
  });

  main_character.movements = {
    'L': function(displacement){main_character.object.position.x -= displacement; main_character.last = 'L';main_character.update()},
    'U': function(displacement){main_character.object.position.z -= displacement; main_character.last = 'U';main_character.update()},
    'D': function(displacement){main_character.object.position.z += displacement; main_character.last = 'D';main_character.update()},
    'R': function(displacement){main_character.object.position.x += displacement; main_character.last = 'R';main_character.update()},
  }

  main_character.update = function(){
    main_character.boxHelper.update(); // update the BoxHelper to match the cube's position
    main_character.bBox.setFromObject(main_character.boxHelper);
  }

  loadCar(function(object){
    car.object = object;
    car.object.scale.set(.14,.14,.14);
    car.object.position.x += 100;
    car.object.position.y += 6;
    car.object.position.z -= 100;

    car.boxHelper = new THREE.BoxHelper(car.object, 0x00ff00);
    car.boxHelper.update();
    car.bBox = new THREE.Box3();
    car.bBox.setFromObject(main_character.boxHelper);
    car.boxHelper.visible = true;



    scene.add(car.object);
    scene.add(car.boxHelper);

  });

  document.addEventListener("keydown", onKeyDown, false);

}

function onKeyDown(event){
  var displacement = 10;

  switch(event.keyCode){
    case 65:
      main_character.movements['L'](10);
      break;
    case 87:
      main_character.movements['U'](10);
      break;
    case 83:
      main_character.movements['D'](10);
      break;
    case 68:
      main_character.movements['R'](10);
      break;
  }

}
