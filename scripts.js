import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";

class SceneManager {
  constructor() {
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 10;
    this.camera.position.y = -4;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.gltfLoader = new GLTFLoader(); // Initialize GLTFLoader

    // Properties
    this.posY = 0; // Set the initial value as needed
    this.breatheDirection = 1; // Set the initial value as needed
    this.colorChangeTimer = 0; // Set the initial value as needed

    this.setupLights();
    this.setupSkybox();
    this.setupGround();
    this.setupTree();
    this.setupChristmasBalls();
    this.setupChristmasGifts();
    this.setupSnowman();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.enableZoom = true;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1;

    window.addEventListener("resize", () => this.handleResize());
  }

  loadModel(url) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          if (gltf.scene) {
            resolve(gltf.scene);
          } else {
            reject(new Error("Loaded model has no scene."));
          }
        },
        undefined,
        reject
      );
    });
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(0, 1, 0.5);
    this.scene.add(directionalLight);
  }

  setupSkybox() {
    const textureLoader = new THREE.TextureLoader();

    // Load skybox textures
    const skyboxTextureRt = textureLoader.load("./background/posx.jpg"); // Right
    const skyboxTextureLf = textureLoader.load("./background/negx.jpg"); // Left
    const skyboxTextureUp = textureLoader.load("./background/posy.jpg"); // Up
    const skyboxTextureDn = textureLoader.load("./background/negy.jpg"); // Down
    const skyboxTextureFt = textureLoader.load("./background/posz.jpg"); // Front
    const skyboxTextureBk = textureLoader.load("./background/negz.jpg"); // Back

    const skyboxMaterials = [
      new THREE.MeshBasicMaterial({
        map: skyboxTextureRt,
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: skyboxTextureLf,
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: skyboxTextureUp,
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: skyboxTextureDn,
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: skyboxTextureFt,
        side: THREE.BackSide,
      }),
      new THREE.MeshBasicMaterial({
        map: skyboxTextureBk,
        side: THREE.BackSide,
      }),
    ];

    const skyboxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(100, 100, 100),
      skyboxMaterials
    );
    skyboxMesh.name = "skybox";
    skyboxMesh.position.y = 10; // Adjust the position as needed
    this.scene.add(skyboxMesh);

    this.skyboxMesh = skyboxMesh;
  }

  setupGround() {
    const textureLoader = new THREE.TextureLoader();

    // Load snow textures
    const snowDiffuseTexture = textureLoader.load("./textures/snow_diff.jpg");
    const snowDispTexture = textureLoader.load("./textures/snow_disp.jpg");
    const snowRoughTexture = textureLoader.load("./textures/snow_rough.jpg");
    const snowTranslucentTexture = textureLoader.load(
      "./textures/snow_translucent.png"
    );
    const snowNormalTexture = textureLoader.load("./textures/snow_nor.jpg");

    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: snowDiffuseTexture,
      displacementMap: snowDispTexture,
      roughnessMap: snowRoughTexture,
      alphaMap: snowTranslucentTexture,
      normalMap: snowNormalTexture,
      transparent: true,
      displacementScale: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate the ground to be horizontal
    ground.position.y = -0.75; // Adjust ground position
    this.scene.add(ground);

    this.ground = ground;
  }

  setupTree() {
    // Create a group to hold all tree parts
    const treeGroup = new THREE.Group();
  
    // Create trunk material with textures
    const woodDiffuseTexture = new THREE.TextureLoader().load(
      "./wood/wood_diff.jpg"
    );
    const woodBumpTexture = new THREE.TextureLoader().load("./wood/wood_bump.jpg");
    const woodNormalTexture = new THREE.TextureLoader().load(
      "./wood/wood_normal.jpg"
    );
  
    const trunkMaterial = new THREE.MeshStandardMaterial({
      map: woodDiffuseTexture,
      bumpMap: woodBumpTexture,
      normalMap: woodNormalTexture,
    });
  
    // Create tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.5, 3.5, 32);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.15; // Positioning the trunk above the ground
    treeGroup.add(trunk);
  
    // Function to create a tree leaf layer with Christmas light balls
    function createTreeLeafLayer(height, radius, positionY) {
      const geometry = new THREE.ConeGeometry(radius, height, 32);
      const material = new THREE.MeshLambertMaterial({ color: 0x4d7541 }); // Green color
      const cone = new THREE.Mesh(geometry, material);
  
      // Create Christmas light balls
      const numLights = 10;
      const lightColor = 0xff0000; // Red color for lights
  
      for (let i = 0; i < numLights; i++) {
        const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const lightMaterial = new THREE.MeshBasicMaterial({ color: lightColor });
        const lightBall = new THREE.Mesh(lightGeometry, lightMaterial);
  
        // Position the light ball randomly on the cone surface
        const angle = (i / numLights) * Math.PI * 2;
        const lightRadius = radius * Math.random() + 0.5;
        const lightHeight = height * Math.random() - 1.5;
        lightBall.position.set(
          lightRadius * Math.cos(angle),
          lightHeight,
          lightRadius * Math.sin(angle)
        );
  
        cone.add(lightBall);
      }
  
      cone.position.y = positionY;
      return cone;
    }
  
    const layerHeights = [2.3, 2.2, 1.8]; // Heights of each layer
    const layerRadii = [2.2, 1.8, 1.2]; // Radii of each layer
    let posY = 1; // Adjust starting position for the first layer
  
    // Create and add each layer to the tree group
    layerHeights.forEach((height, index) => {
      const layer = createTreeLeafLayer(
        height,
        layerRadii[index],
        posY + height / 1.8
      );
      posY += height - 0.8;
      treeGroup.add(layer);
    });
  
    treeGroup.scale.set(1.2, 1.2, 1.2); // Scale down the entire tree
    this.scene.add(treeGroup);
  
    this.treeGroup = treeGroup;
  }

  setupChristmasBalls() {
    // Function to load and set up the Christmas Ball Model
    const loadChristmasBall = () => {
      this.gltfLoader.load("./christmas-ball/scene.gltf", (gltf) => {
        const christmasBallModel = gltf.scene;

        christmasBallModel.scale.set(4, 4, 4);
        const numBallsList = [10, 8, 4];
        const yPoses = [1.1, 3, 4.8];

        // Add Christmas balls to the second, third, and fourth layers of the tree
        for (let i = 1; i <= 3; i++) {
          const layer = this.treeGroup.children[i];
          const layerRadius = layer.geometry.parameters.radius;
          const numBalls = numBallsList[i - 1];
          const yPos = yPoses[i - 1];

          for (let j = 0; j < numBalls; j++) {
            const angle = (j / numBalls) * Math.PI * 2;
            const ballClone = christmasBallModel.clone();

            // Position the Christmas ball
            ballClone.position.set(
              layerRadius * Math.cos(angle),
              yPos,
              layerRadius * Math.sin(angle)
            );

            const ballLight = new THREE.PointLight(0x130044, 1, 2);
            ballClone.add(ballLight);

            this.scene.add(ballClone);
          }
        }
      });
    };

    // Call the loadChristmasBall function to set up the Christmas balls
    loadChristmasBall();
  }

  setupChristmasGifts() {
    // Define the number of gifts and their radius of rotation
    const numGifts = 3;
    const rotationRadius = 2; // Adjust the radius as needed

    // Function to generate a random scaling factor within a range
    const getRandomScale = () => {
      const minScale = 2.3; // Adjust the minimum scale as needed
      const maxScale = 3; // Adjust the maximum scale as needed
      const scale = Math.random() * (maxScale - minScale) + minScale;
      return new THREE.Vector3(scale, scale, scale);
    };

    // Function to load and set up Christmas gifts
    const loadChristmasGifts = () => {
      // Iterate over each gift
      for (let i = 0; i < numGifts; i++) {
        const angle = (i / numGifts) * Math.PI * 2;
        const x = rotationRadius * Math.cos(angle);
        const z = rotationRadius * Math.sin(angle);

        this.gltfLoader.load("./christmas-gift/scene.gltf", (gltf) => {
          const christmasGiftModel = gltf.scene;

          // Set the color of the PointLight
          const giftLight = new THREE.PointLight(0xe8c166, 3.0, 0.5); // Set the color here
          giftLight.position.copy(christmasGiftModel.position);
          this.scene.add(giftLight);

          // Generate a random scaling factor
          const randomScale = getRandomScale();
          christmasGiftModel.scale.copy(randomScale);

          // Position the Christmas gift model
          christmasGiftModel.position.set(x, -0.7, z); // Adjust the y-position as needed

          this.scene.add(christmasGiftModel);
        });
      }
    };

    // Call the loadChristmasGifts function to set up the Christmas gifts
    loadChristmasGifts();
  }

  setupSnowman() {
    const loadSnowmanModel = () => {
      const snowmanModelPath = "./snowman/scene.gltf";

      // Load your custom snowman model
      this.gltfLoader.load(snowmanModelPath, (gltf) => {
        const snowmanModel = gltf.scene;

        snowmanModel.scale.copy(new THREE.Vector3(1, 1, 1));
        snowmanModel.position.set(2.5, -0.7, 3); // Adjust the y-position as needed

        this.scene.add(snowmanModel);
      });
    };

    // Call the loadSnowmanModel function to set up the snowman
    loadSnowmanModel();
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}

const sceneManager = new SceneManager();
sceneManager.animate();
