// 3D Procedural RPG Characters (Knight & Princess Elica) + Heart Crystals & Environment
// Built with Three.js PBR Materials

function createHeartShape(scale = 1) {
  const x = 0, y = 0;
  const heartShape = new THREE.Shape();
  heartShape.moveTo(x, y + 0.25 * scale);
  heartShape.bezierCurveTo(x, y + 0.25 * scale, x - 0.2 * scale, y + 0.65 * scale, x - 0.55 * scale, y + 0.65 * scale);
  heartShape.bezierCurveTo(x - 1.1 * scale, y + 0.65 * scale, x - 1.1 * scale, y + 0.05 * scale, x - 1.1 * scale, y + 0.05 * scale);
  heartShape.bezierCurveTo(x - 1.1 * scale, y - 0.45 * scale, x - 0.55 * scale, y - 0.85 * scale, x, y - 1.2 * scale);
  heartShape.bezierCurveTo(x + 0.55 * scale, y - 0.85 * scale, x + 1.1 * scale, y - 0.45 * scale, x + 1.1 * scale, y + 0.05 * scale);
  heartShape.bezierCurveTo(x + 1.1 * scale, y + 0.05 * scale, x + 1.1 * scale, y + 0.65 * scale, x + 0.55 * scale, y + 0.65 * scale);
  heartShape.bezierCurveTo(x + 0.2 * scale, y + 0.65 * scale, x, y + 0.25 * scale, x, y + 0.25 * scale);
  return heartShape;
}

function createHeartGeometry(scale = 0.45, depth = 0.18) {
  const shape = createHeartShape(scale);
  const extrudeSettings = {
    steps: 1,
    depth: depth * scale,
    bevelEnabled: true,
    bevelThickness: 0.14 * scale,
    bevelSize: 0.12 * scale,
    bevelOffset: 0,
    bevelSegments: 5
  };
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

// Create the Heroic RPG Knight (Ksatria Cinta)
function createKnightCharacter() {
  const root = new THREE.Group();

  // Materials
  const silverArmorMat = new THREE.MeshStandardMaterial({
    color: 0xe6ecf5,
    metalness: 0.78,
    roughness: 0.22
  });
  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x2b3248,
    metalness: 0.65,
    roughness: 0.35
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    metalness: 0.85,
    roughness: 0.18,
    emissive: 0x3a2400,
    emissiveIntensity: 0.25
  });
  const roseCrimsonMat = new THREE.MeshStandardMaterial({
    color: 0xe01e68,
    metalness: 0.2,
    roughness: 0.45,
    emissive: 0x45051f,
    emissiveIntensity: 0.3
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffe0cc,
    roughness: 0.55,
    metalness: 0.05
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a0b2e });
  const eyeSparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const blushMat = new THREE.MeshBasicMaterial({
    color: 0xff6b9d,
    transparent: true,
    opacity: 0.55
  });
  const glowingHeartMat = new THREE.MeshStandardMaterial({
    color: 0xff2e7e,
    emissive: 0xff2e7e,
    emissiveIntensity: 0.85,
    metalness: 0.3,
    roughness: 0.15
  });

  // Ground shadow / magic aura ring under Knight
  const auraGeo = new THREE.RingGeometry(0.55, 0.72, 32);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0xff5e9e,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.45
  });
  const auraRing = new THREE.Mesh(auraGeo, auraMat);
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.03;
  root.add(auraRing);

  const bodyRig = new THREE.Group();
  root.add(bodyRig);

  // Torso / Cuirass
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 1.05;
  bodyRig.add(torsoGroup);

  const chestMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.34, 0.76, 16),
    silverArmorMat
  );
  chestMesh.castShadow = true;
  torsoGroup.add(chestMesh);

  // Gold belt & royal sash
  const beltMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.37, 0.39, 0.14, 16),
    goldTrimMat
  );
  beltMesh.position.y = -0.32;
  torsoGroup.add(beltMesh);

  // Glowing Heart Emblem on chest plate
  const chestHeart = new THREE.Mesh(createHeartGeometry(0.14, 0.25), glowingHeartMat);
  chestHeart.position.set(0, 0.06, 0.41);
  torsoGroup.add(chestHeart);

  // Pauldrons (Shoulder Armor)
  const leftPauldron = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
    silverArmorMat
  );
  leftPauldron.position.set(-0.5, 0.25, 0);
  leftPauldron.rotation.z = 0.35;
  torsoGroup.add(leftPauldron);

  const rightPauldron = leftPauldron.clone();
  rightPauldron.position.set(0.5, 0.25, 0);
  rightPauldron.rotation.z = -0.35;
  torsoGroup.add(rightPauldron);

  // Flowing Heroic Cape
  const capePivot = new THREE.Group();
  capePivot.position.set(0, 0.32, -0.34);
  torsoGroup.add(capePivot);

  const capeGeo = new THREE.BoxGeometry(0.82, 1.08, 0.06, 6, 8, 1);
  const capeMesh = new THREE.Mesh(capeGeo, roseCrimsonMat);
  capeMesh.position.set(0, -0.5, -0.08);
  capeMesh.castShadow = true;
  capePivot.add(capeMesh);

  // Head & Knight Helmet
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.68, 0);
  torsoGroup.add(headGroup);

  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), skinMat);
  headSphere.castShadow = true;
  headGroup.add(headSphere);

  // Expressive Eyes
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 12), eyeMat);
  leftEye.position.set(-0.14, -0.02, 0.38);
  leftEye.scale.set(1, 1.25, 0.6);
  headGroup.add(leftEye);

  const rightEye = leftEye.clone();
  rightEye.position.set(0.14, -0.02, 0.38);
  headGroup.add(rightEye);

  // Eye Sparkles
  const leftSparkle = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eyeSparkleMat);
  leftSparkle.position.set(-0.12, 0.01, 0.42);
  headGroup.add(leftSparkle);

  const rightSparkle = leftSparkle.clone();
  rightSparkle.position.set(0.16, 0.01, 0.42);
  headGroup.add(rightSparkle);

  // Cute Blush
  const leftBlush = new THREE.Mesh(new THREE.CircleGeometry(0.065, 12), blushMat);
  leftBlush.position.set(-0.23, -0.1, 0.37);
  leftBlush.rotation.y = -0.35;
  headGroup.add(leftBlush);

  const rightBlush = new THREE.Mesh(new THREE.CircleGeometry(0.065, 12), blushMat);
  rightBlush.position.set(0.23, -0.1, 0.37);
  rightBlush.rotation.y = 0.35;
  headGroup.add(rightBlush);

  // Helmet Dome & Raised Visor
  const helmetDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.455, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.62),
    silverArmorMat
  );
  helmetDome.rotation.x = -0.18;
  helmetDome.castShadow = true;
  headGroup.add(helmetDome);

  // Golden Crown/Visor Crest on Helmet
  const visorBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.43, 0.045, 10, 28, Math.PI * 1.1),
    goldTrimMat
  );
  visorBand.position.set(0, 0.12, 0.05);
  visorBand.rotation.x = Math.PI * 0.42;
  visorBand.rotation.z = -Math.PI * 0.05;
  headGroup.add(visorBand);

  // Heroic Plume Feather on top of Helmet
  const plumeGroup = new THREE.Group();
  plumeGroup.position.set(0, 0.45, -0.05);
  headGroup.add(plumeGroup);

  const plumeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.14, 12), goldTrimMat);
  plumeGroup.add(plumeBase);

  const plumeFeather = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.52, 12),
    roseCrimsonMat
  );
  plumeFeather.position.set(0, 0.22, -0.12);
  plumeFeather.rotation.x = -0.55;
  plumeGroup.add(plumeFeather);

  // Left Arm & Enchanted Sword
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.54, 0.2, 0);
  torsoGroup.add(leftArmPivot);

  const leftArmMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.1, 0.52, 12),
    silverArmorMat
  );
  leftArmMesh.position.y = -0.22;
  leftArmPivot.add(leftArmMesh);

  // Enchanted Rose-Gold Sword in Left Hand
  const swordGroup = new THREE.Group();
  swordGroup.position.set(0, -0.46, 0.18);
  swordGroup.rotation.x = Math.PI * 0.35;
  leftArmPivot.add(swordGroup);

  const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.24, 10), darkSteelMat);
  swordGroup.add(hilt);

  const crossguard = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.09), goldTrimMat);
  crossguard.position.y = 0.13;
  swordGroup.add(crossguard);

  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x5ce1e6,
    emissiveIntensity: 0.45,
    metalness: 0.9,
    roughness: 0.1
  });
  const blade = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.85, 4), bladeMat);
  blade.position.y = 0.56;
  blade.scale.set(1, 1, 0.35);
  swordGroup.add(blade);

  // Right Arm & Royal Heart Shield
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.54, 0.2, 0);
  torsoGroup.add(rightArmPivot);

  const rightArmMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.1, 0.52, 12),
    silverArmorMat
  );
  rightArmMesh.position.y = -0.22;
  rightArmPivot.add(rightArmMesh);

  const shieldGroup = new THREE.Group();
  shieldGroup.position.set(0.14, -0.32, 0.22);
  shieldGroup.rotation.y = 0.35;
  rightArmPivot.add(shieldGroup);

  const shieldBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.22, 0.08, 6),
    silverArmorMat
  );
  shieldBody.rotation.x = Math.PI / 2;
  shieldGroup.add(shieldBody);

  const shieldTrim = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.032, 8, 6),
    goldTrimMat
  );
  shieldTrim.position.z = 0.03;
  shieldGroup.add(shieldTrim);

  const shieldHeart = new THREE.Mesh(createHeartGeometry(0.13, 0.2), glowingHeartMat);
  shieldHeart.position.z = 0.06;
  shieldGroup.add(shieldHeart);

  // Legs
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.18, 0.62, 0);
  bodyRig.add(leftLegPivot);

  const leftLegMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.11, 0.58, 12),
    darkSteelMat
  );
  leftLegMesh.position.y = -0.28;
  leftLegPivot.add(leftLegMesh);

  const leftBoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.16, 0.32),
    silverArmorMat
  );
  leftBoot.position.set(0, -0.54, 0.05);
  leftLegPivot.add(leftBoot);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.18, 0.62, 0);
  bodyRig.add(rightLegPivot);

  const rightLegMesh = leftLegMesh.clone();
  rightLegPivot.add(rightLegMesh);

  const rightBoot = leftBoot.clone();
  rightLegPivot.add(rightBoot);

  // Proposal Giant Glowing Heart Crystal (hidden until Quest Complete!)
  const proposalHeart = new THREE.Mesh(
    createHeartGeometry(0.36, 0.3),
    new THREE.MeshStandardMaterial({
      color: 0xff2a7a,
      emissive: 0xff2a7a,
      emissiveIntensity: 1.1,
      metalness: 0.4,
      roughness: 0.1
    })
  );
  proposalHeart.position.set(0, 1.65, 0.72);
  proposalHeart.visible = false;
  root.add(proposalHeart);

  return {
    root,
    bodyRig,
    torsoGroup,
    headGroup,
    capePivot,
    plumeGroup,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    auraRing,
    proposalHeart
  };
}

// Create Princess Elica (Putri Elica)
function createPrincessElica() {
  const root = new THREE.Group();

  const dressTopMat = new THREE.MeshStandardMaterial({
    color: 0xff4d94,
    roughness: 0.32,
    metalness: 0.18,
    emissive: 0x420622,
    emissiveIntensity: 0.25
  });
  const dressSkirtMat = new THREE.MeshStandardMaterial({
    color: 0x9d4edd,
    roughness: 0.35,
    metalness: 0.22,
    emissive: 0x240742,
    emissiveIntensity: 0.3
  });
  const silkOverskirtMat = new THREE.MeshStandardMaterial({
    color: 0xff85b3,
    roughness: 0.28,
    metalness: 0.15
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    metalness: 0.88,
    roughness: 0.16,
    emissive: 0x422a00,
    emissiveIntensity: 0.3
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffe4d4,
    roughness: 0.5,
    metalness: 0.05
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x2c1638,
    roughness: 0.42,
    metalness: 0.15
  });
  const rubyHeartMat = new THREE.MeshStandardMaterial({
    color: 0xff1e6e,
    emissive: 0xff1e6e,
    emissiveIntensity: 1.0,
    metalness: 0.4,
    roughness: 0.1
  });

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // Royal Gown Skirt
  const skirtOuter = new THREE.Mesh(
    new THREE.ConeGeometry(0.75, 1.25, 24, 1, false),
    dressSkirtMat
  );
  skirtOuter.position.y = 0.62;
  skirtOuter.castShadow = true;
  bodyGroup.add(skirtOuter);

  const skirtLayer = new THREE.Mesh(
    new THREE.ConeGeometry(0.68, 1.05, 20),
    silkOverskirtMat
  );
  skirtLayer.position.y = 0.72;
  bodyGroup.add(skirtLayer);

  // Golden Hem Trim
  const skirtHem = new THREE.Mesh(
    new THREE.TorusGeometry(0.73, 0.035, 10, 32),
    goldMat
  );
  skirtHem.rotation.x = Math.PI / 2;
  skirtHem.position.y = 0.04;
  bodyGroup.add(skirtHem);

  // Bodice / Torso
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.34, 0.62, 16),
    dressTopMat
  );
  torso.position.y = 1.38;
  torso.castShadow = true;
  bodyGroup.add(torso);

  // Golden Belt & Heart Brooch
  const waistBelt = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.035, 10, 24),
    goldMat
  );
  waistBelt.rotation.x = Math.PI / 2;
  waistBelt.position.y = 1.15;
  bodyGroup.add(waistBelt);

  const broochHeart = new THREE.Mesh(createHeartGeometry(0.11, 0.2), rubyHeartMat);
  broochHeart.position.set(0, 1.44, 0.3);
  bodyGroup.add(broochHeart);

  // Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.98, 0);
  bodyGroup.add(headGroup);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.39, 24, 24), skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Eyes & Sparkles
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x240b36 });
  const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const blushMat = new THREE.MeshBasicMaterial({
    color: 0xff5e9e,
    transparent: true,
    opacity: 0.65
  });

  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), eyeMat);
  leftEye.position.set(-0.13, -0.01, 0.35);
  leftEye.scale.set(1, 1.28, 0.6);
  headGroup.add(leftEye);

  const rightEye = leftEye.clone();
  rightEye.position.set(0.13, -0.01, 0.35);
  headGroup.add(rightEye);

  const leftSparkle = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), sparkleMat);
  leftSparkle.position.set(-0.11, 0.02, 0.39);
  headGroup.add(leftSparkle);

  const rightSparkle = leftSparkle.clone();
  rightSparkle.position.set(0.15, 0.02, 0.39);
  headGroup.add(rightSparkle);

  const leftBlush = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), blushMat);
  leftBlush.position.set(-0.22, -0.09, 0.34);
  leftBlush.rotation.y = -0.35;
  headGroup.add(leftBlush);

  const rightBlush = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), blushMat);
  rightBlush.position.set(0.22, -0.09, 0.34);
  rightBlush.rotation.y = 0.35;
  headGroup.add(rightBlush);

  // Royal Hair
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hairMat
  );
  hairCap.rotation.x = -0.25;
  headGroup.add(hairCap);

  // Flowing back hair locks
  const backHair = new THREE.Mesh(
    new THREE.ConeGeometry(0.42, 0.95, 16),
    hairMat
  );
  backHair.position.set(0, -0.28, -0.22);
  backHair.rotation.x = 0.25;
  headGroup.add(backHair);

  // Side hair curls
  const leftCurl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.55, 12), hairMat);
  leftCurl.position.set(-0.34, -0.18, 0.14);
  leftCurl.rotation.z = 0.15;
  headGroup.add(leftCurl);

  const rightCurl = leftCurl.clone();
  rightCurl.position.set(0.34, -0.18, 0.14);
  rightCurl.rotation.z = -0.15;
  headGroup.add(rightCurl);

  // Royal Golden Tiara with Ruby Heart
  const tiaraGroup = new THREE.Group();
  tiaraGroup.position.set(0, 0.36, 0.08);
  headGroup.add(tiaraGroup);

  const tiaraBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.032, 10, 24, Math.PI),
    goldMat
  );
  tiaraBand.rotation.x = Math.PI * 0.35;
  tiaraGroup.add(tiaraBand);

  const tiaraPeak = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 4), goldMat);
  tiaraPeak.position.set(0, 0.12, 0.18);
  tiaraGroup.add(tiaraPeak);

  const tiaraHeart = new THREE.Mesh(createHeartGeometry(0.09, 0.2), rubyHeartMat);
  tiaraHeart.position.set(0, 0.12, 0.24);
  tiaraGroup.add(tiaraHeart);

  // Arms & Starlight Scepter
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.36, 1.56, 0);
  bodyGroup.add(leftArmPivot);

  const puffSleeveL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), silkOverskirtMat);
  leftArmPivot.add(puffSleeveL);

  const armMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.48, 12), skinMat);
  armMeshL.position.y = -0.24;
  leftArmPivot.add(armMeshL);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.36, 1.56, 0);
  bodyGroup.add(rightArmPivot);

  const puffSleeveR = puffSleeveL.clone();
  rightArmPivot.add(puffSleeveR);

  const armMeshR = armMeshL.clone();
  rightArmPivot.add(armMeshR);

  // Enchanted Heart Scepter in Right Hand
  const scepterGroup = new THREE.Group();
  scepterGroup.position.set(0, -0.44, 0.18);
  scepterGroup.rotation.x = Math.PI * 0.25;
  rightArmPivot.add(scepterGroup);

  const scepterRod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 10), goldMat);
  scepterRod.position.y = 0.22;
  scepterGroup.add(scepterRod);

  const scepterHeart = new THREE.Mesh(createHeartGeometry(0.14, 0.22), rubyHeartMat);
  scepterHeart.position.y = 0.72;
  scepterGroup.add(scepterHeart);

  // Floating Heart Halo above Princess Elica
  const haloHeart = new THREE.Mesh(createHeartGeometry(0.22, 0.2), rubyHeartMat);
  haloHeart.position.set(0, 2.85, 0);
  root.add(haloHeart);

  return {
    root,
    bodyGroup,
    headGroup,
    leftArmPivot,
    rightArmPivot,
    scepterGroup,
    scepterHeart,
    haloHeart
  };
}

// Create the Enchanted Starlit Courtyard Arena
function createEnchantedArena(scene) {
  const envGroup = new THREE.Group();
  scene.add(envGroup);

  // Main Courtyard Floor Disc
  const floorGeo = new THREE.CylinderGeometry(11.5, 12.2, 0.6, 64);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x160a2c,
    roughness: 0.4,
    metalness: 0.3
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.y = -0.3;
  floorMesh.receiveShadow = true;
  envGroup.add(floorMesh);

  // Concentric Magic Rune Rings on the floor
  const ringMatGold = new THREE.MeshBasicMaterial({
    color: 0xffd166,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35
  });
  const ringMatRose = new THREE.MeshBasicMaterial({
    color: 0xff3e8a,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });

  const outerRing = new THREE.Mesh(new THREE.RingGeometry(8.8, 9.05, 64), ringMatGold);
  outerRing.rotation.x = -Math.PI / 2;
  outerRing.position.y = 0.015;
  envGroup.add(outerRing);

  const midRing = new THREE.Mesh(new THREE.RingGeometry(5.2, 5.35, 64), ringMatRose);
  midRing.rotation.x = -Math.PI / 2;
  midRing.position.y = 0.015;
  envGroup.add(midRing);

  // Royal Pedestal / Sanctuary Stage for Princess Elica at the north end
  const stageGroup = new THREE.Group();
  stageGroup.position.set(0, 0, -6.5);
  envGroup.add(stageGroup);

  const podiumStep1 = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.9, 0.35, 32),
    new THREE.MeshStandardMaterial({ color: 0x261247, metalness: 0.45, roughness: 0.3 })
  );
  podiumStep1.position.y = 0.175;
  podiumStep1.receiveShadow = true;
  stageGroup.add(podiumStep1);

  const podiumStep2 = new THREE.Mesh(
    new THREE.CylinderGeometry(1.9, 2.1, 0.35, 32),
    new THREE.MeshStandardMaterial({ color: 0x351861, metalness: 0.5, roughness: 0.25 })
  );
  podiumStep2.position.y = 0.52;
  podiumStep2.receiveShadow = true;
  stageGroup.add(podiumStep2);

  const podiumTrim = new THREE.Mesh(
    new THREE.TorusGeometry(1.92, 0.05, 12, 40),
    new THREE.MeshStandardMaterial({
      color: 0xffd166,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x5c3c00,
      emissiveIntensity: 0.4
    })
  );
  podiumTrim.rotation.x = Math.PI / 2;
  podiumTrim.position.y = 0.7;
  stageGroup.add(podiumTrim);

  // Decorative Crystal Pillars around the courtyard perimeter
  const floatingCrystals = [];
  const pillarCount = 8;
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x241242,
    metalness: 0.5,
    roughness: 0.3
  });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xff4d94,
    emissive: 0xff2e7e,
    emissiveIntensity: 0.85,
    metalness: 0.2,
    roughness: 0.1
  });

  for (let i = 0; i < pillarCount; i++) {
    const angle = (i / pillarCount) * Math.PI * 2 + Math.PI / 8;
    const radius = 9.6;
    const px = Math.cos(angle) * radius;
    const pz = Math.sin(angle) * radius;

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 2.4, 8), pillarMat);
    pillar.position.set(px, 1.2, pz);
    pillar.castShadow = true;
    envGroup.add(pillar);

    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), crystalMat);
    crystal.position.set(px, 3.05, pz);
    envGroup.add(crystal);
    floatingCrystals.push({ mesh: crystal, baseY: 3.05, phase: i * 0.9 });
  }

  return {
    envGroup,
    outerRing,
    midRing,
    floatingCrystals,
    stageGroup
  };
}

window.CharacterBuilder = {
  createHeartGeometry,
  createKnightCharacter,
  createPrincessElica,
  createEnchantedArena
};
