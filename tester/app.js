// Main Application: 3D Romantic RPG World, Mini-Game Controller & Confession Finale for Elica

(function () {
  // Game States: 'INTRO' | 'PLAYING' | 'TRANSITION' | 'CONFESSION' | 'VICTORY'
  let gameState = 'INTRO';
  const TARGET_HEARTS = 10;
  let collectedHearts = 0;

  // DOM Elements
  const canvas = document.getElementById('webgl-canvas');
  const introScreen = document.getElementById('intro-screen');
  const confessionScreen = document.getElementById('confession-screen');
  const gameHud = document.getElementById('game-hud');
  const controlsBar = document.getElementById('controls-bar');
  const victoryBanner = document.getElementById('victory-banner');
  const heartCountText = document.getElementById('heart-count-text');
  const progressFill = document.getElementById('progress-fill');
  const princessCheerText = document.getElementById('princess-cheer-text');
  const floatingPopups = document.getElementById('floating-popups');

  const btnStartGame = document.getElementById('btn-start-game');
  const btnAutoCollect = document.getElementById('btn-auto-collect');
  const btnAudioToggle = document.getElementById('btn-audio-toggle');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const dodgeMsg = document.getElementById('dodge-status-msg');
  const btnMoreFireworks = document.getElementById('btn-more-fireworks');
  const btnReopenLetter = document.getElementById('btn-reopen-letter');
  const btnReplayGame = document.getElementById('btn-replay-game');

  // Three.js Core Setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x120624, 0.025);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    150
  );
  camera.position.set(0, 7, 13);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffb8e0, 0.75);
  scene.add(ambientLight);

  const mainDirLight = new THREE.DirectionalLight(0xfff1d6, 1.25);
  mainDirLight.position.set(8, 16, 10);
  mainDirLight.castShadow = true;
  mainDirLight.shadow.mapSize.width = 1024;
  mainDirLight.shadow.mapSize.height = 1024;
  scene.add(mainDirLight);

  const pinkPointLight = new THREE.PointLight(0xff2e7e, 1.8, 22);
  pinkPointLight.position.set(-5, 4, -2);
  scene.add(pinkPointLight);

  const goldPointLight = new THREE.PointLight(0xffd166, 1.6, 20);
  goldPointLight.position.set(5, 5, -4);
  scene.add(goldPointLight);

  // Build Environment & Characters
  const arena = window.CharacterBuilder.createEnchantedArena(scene);
  const knight = window.CharacterBuilder.createKnightCharacter();
  knight.root.position.set(0, 0, 2.5);
  scene.add(knight.root);

  const princess = window.CharacterBuilder.createPrincessElica();
  princess.root.position.set(0, 0.7, -6.5);
  scene.add(princess.root);

  // Ambient Floating Starlight & Cherry Blossom Particles
  const starCount = 260;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  const palette = [
    new THREE.Color(0xff4d94),
    new THREE.Color(0xffd166),
    new THREE.Color(0xffffff),
    new THREE.Color(0xc77dff)
  ];

  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 36;
    starPositions[i * 3 + 1] = Math.random() * 16 + 0.5;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 36;

    const c = palette[i % palette.length];
    starColors[i * 3] = c.r;
    starColors[i * 3 + 1] = c.g;
    starColors[i * 3 + 2] = c.b;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 0.22,
    vertexColors: true,
    transparent: true,
    opacity: 0.85
  });
  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  // Collectible 3D Hearts Pool
  const heartGeo = window.CharacterBuilder.createHeartGeometry(0.38, 0.25);
  const rubyHeartMat = new THREE.MeshStandardMaterial({
    color: 0xff2a7a,
    emissive: 0xff1e68,
    emissiveIntensity: 0.85,
    metalness: 0.35,
    roughness: 0.12
  });
  const goldHeartMat = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    emissive: 0xff9e00,
    emissiveIntensity: 0.9,
    metalness: 0.75,
    roughness: 0.1
  });

  const activeHearts = [];
  const MAX_SIMULTANEOUS_HEARTS = 5;

  function spawnCollectibleHeart() {
    const isGolden = Math.random() < 0.28;
    const group = new THREE.Group();

    const mesh = new THREE.Mesh(heartGeo, isGolden ? goldHeartMat : rubyHeartMat);
    mesh.position.y = 1.05;
    mesh.castShadow = true;
    group.add(mesh);

    // Glowing ring marker on floor below heart
    const ringGeo = new THREE.RingGeometry(0.35, 0.48, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isGolden ? 0xffd166 : 0xff4d94,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    group.add(ring);

    // Random position inside the playable courtyard ring
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.8 + Math.random() * 5.2;
    const x = Math.cos(angle) * radius;
    // Keep away from Princess podium at z = -6.5
    const z = Math.max(-3.6, Math.min(6.4, Math.sin(angle) * radius + 1.2));

    group.position.set(x, 0, z);
    scene.add(group);

    activeHearts.push({
      group,
      mesh,
      ring,
      isGolden,
      points: isGolden ? 2 : 1,
      phase: Math.random() * Math.PI * 2,
      spawnScale: 0.01
    });
  }

  // Particle Bursts (on heart pickup & 3D fireworks)
  const bursts = [];

  function create3DBurst(position, colorHex = 0xff4d94, count = 26, speedMultiplier = 1) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = (1.5 + Math.random() * 3.5) * speedMultiplier;

      velocities.push({
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.cos(phi) * speed + 1.5 * speedMultiplier,
        vz: Math.sin(phi) * Math.sin(theta) * speed
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: colorHex,
      size: 0.28 * speedMultiplier,
      transparent: true,
      opacity: 1
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    bursts.push({ points, velocities, age: 0, maxAge: 1.15 });
  }

  function launchCelebrationFireworks() {
    window.audioEngine.playFireworkBurst();
    const colors = [0xff2e7e, 0xffd166, 0xc77dff, 0x5ce1e6, 0xff85b3];
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const pos = new THREE.Vector3(
          (Math.random() - 0.5) * 9,
          3.5 + Math.random() * 3.8,
          -3.5 + (Math.random() - 0.5) * 5
        );
        const col = colors[Math.floor(Math.random() * colors.length)];
        create3DBurst(pos, col, 45, 1.45);
      }, i * 240);
    }
  }

  // Movement & Input Controller
  const keys = { up: false, down: false, left: false, right: false };
  let pointerTarget = null;
  let isPointerDown = false;
  let autoPilotMode = false;
  let knightVelocity = new THREE.Vector3();
  let princessCheerTimer = 0;

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') keys.up = true;
    if (k === 's' || k === 'arrowdown') keys.down = true;
    if (k === 'a' || k === 'arrowleft') keys.left = true;
    if (k === 'd' || k === 'arrowright') keys.right = true;
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
      pointerTarget = null;
      autoPilotMode = false;
    }
  });

  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') keys.up = false;
    if (k === 's' || k === 'arrowdown') keys.down = false;
    if (k === 'a' || k === 'arrowleft') keys.left = false;
    if (k === 'd' || k === 'arrowright') keys.right = false;
  });

  // On-screen D-Pad buttons
  function bindDpadButton(id, dirKey) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const activate = (ev) => {
      ev.preventDefault();
      keys[dirKey] = true;
      pointerTarget = null;
      autoPilotMode = false;
      btn.classList.add('active');
    };
    const deactivate = (ev) => {
      ev.preventDefault();
      keys[dirKey] = false;
      btn.classList.remove('active');
    };
    btn.addEventListener('mousedown', activate);
    btn.addEventListener('mouseup', deactivate);
    btn.addEventListener('mouseleave', deactivate);
    btn.addEventListener('touchstart', activate, { passive: false });
    btn.addEventListener('touchend', deactivate, { passive: false });
  }

  bindDpadButton('ctrl-up', 'up');
  bindDpadButton('ctrl-down', 'down');
  bindDpadButton('ctrl-left', 'left');
  bindDpadButton('ctrl-right', 'right');

  // Raycaster for clicking/tapping on the arena floor to move the Knight
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  function updatePointerTarget(clientX, clientY) {
    if (gameState !== 'PLAYING') return;
    mouseNDC.x = (clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseNDC, camera);
    const hitPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(floorPlane, hitPoint)) {
      // Clamp within arena
      hitPoint.x = Math.max(-7.5, Math.min(7.5, hitPoint.x));
      hitPoint.z = Math.max(-3.8, Math.min(7.0, hitPoint.z));
      pointerTarget = hitPoint;
      autoPilotMode = false;
    }
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (gameState !== 'PLAYING') return;
    isPointerDown = true;
    updatePointerTarget(e.clientX, e.clientY);
  });

  window.addEventListener('pointermove', (e) => {
    if (isPointerDown && gameState === 'PLAYING') {
      updatePointerTarget(e.clientX, e.clientY);
    }
  });

  window.addEventListener('pointerup', () => {
    isPointerDown = false;
  });

  // Floating "+1 Heart" HTML popup projected from 3D world position
  function spawnFloatingScorePopup(worldPos, text) {
    const projected = worldPos.clone().project(camera);
    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(projected.y * 0.5) + 0.5) * window.innerHeight;

    const el = document.createElement('div');
    el.className = 'heart-popup';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.textContent = text;
    floatingPopups.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 1100);
  }

  // Cheer messages from Princess Elica during gameplay
  const cheerMessages = [
    'Putri Elica: "Semangat Ksatriaku! Kumpulkan kristal cintanya~" ✨',
    'Putri Elica: "Wah, gerakanmu lincah sekali! Aku terpukau~" 💖',
    'Putri Elica: "Hati emas itu bersinar seindah perasaanmu!" 🌟',
    'Putri Elica: "Sedikit lagi! Aku sudah tidak sabar membaca suratmu~" 💌',
    'Putri Elica: "Satu lagi! Datanglah ke hadapanku, Ksatriaku!" 👑'
  ];

  function updateHUD() {
    const clamped = Math.min(TARGET_HEARTS, collectedHearts);
    heartCountText.textContent = `${clamped} / ${TARGET_HEARTS} ❤️`;
    const pct = (clamped / TARGET_HEARTS) * 100;
    progressFill.style.width = `${pct}%`;

    const msgIdx = Math.min(
      cheerMessages.length - 1,
      Math.floor((clamped / TARGET_HEARTS) * cheerMessages.length)
    );
    princessCheerText.textContent = cheerMessages[msgIdx];
  }

  // Start Mini-Game
  function startMiniGame() {
    window.audioEngine.startBGM();
    window.audioEngine.playHeartCollect(true);

    collectedHearts = 0;
    autoPilotMode = false;
    pointerTarget = null;
    knight.proposalHeart.visible = false;
    knight.bodyRig.position.y = 0;
    knight.root.position.set(0, 0, 2.5);
    knight.root.rotation.y = Math.PI;

    // Immediately align camera behind the Knight so mobile & desktop follow starts cleanly
    const isPortrait = window.innerWidth < window.innerHeight;
    camera.position.set(
      knight.root.position.x,
      isPortrait ? 9.6 : 7.8,
      knight.root.position.z + (isPortrait ? 10.5 : 8.4)
    );
    currentLookAt.set(
      knight.root.position.x,
      1.15,
      knight.root.position.z + (isPortrait ? 0.6 : -0.8)
    );
    camera.lookAt(currentLookAt);

    // Clear old hearts and spawn fresh ones
    while (activeHearts.length > 0) {
      const h = activeHearts.pop();
      scene.remove(h.group);
    }
    for (let i = 0; i < MAX_SIMULTANEOUS_HEARTS; i++) {
      spawnCollectibleHeart();
    }

    updateHUD();
    introScreen.classList.add('hidden');
    confessionScreen.classList.add('hidden');
    victoryBanner.classList.add('hidden');
    gameHud.classList.remove('hidden');
    controlsBar.classList.remove('hidden');

    gameState = 'PLAYING';
  }

  // Trigger Quest Complete -> Cinematic Proposal Transition
  function triggerQuestComplete() {
    gameState = 'TRANSITION';
    window.audioEngine.playQuestComplete();
    gameHud.classList.add('hidden');
    controlsBar.classList.add('hidden');

    // Remove remaining arena hearts
    while (activeHearts.length > 0) {
      const h = activeHearts.pop();
      create3DBurst(h.group.position, 0xffd166, 15, 0.8);
      scene.remove(h.group);
    }

    // Show confession card after the Knight reaches Princess Elica & kneels
    setTimeout(() => {
      if (gameState === 'TRANSITION') {
        gameState = 'CONFESSION';
        confessionScreen.classList.remove('hidden');
      }
    }, 2400);
  }

  // Button Events
  btnStartGame.addEventListener('click', startMiniGame);

  btnAutoCollect.addEventListener('click', () => {
    if (gameState === 'PLAYING') {
      autoPilotMode = true;
      princessCheerText.textContent = 'Putri Elica: "Kekuatan Cinta menuntun langkah Ksatria secara otomatis!" ✨';
    }
  });

  btnAudioToggle.addEventListener('click', () => {
    const muted = window.audioEngine.toggleMute();
    btnAudioToggle.innerHTML = muted
      ? '<span>🔇</span><span>Musik: Off</span>'
      : '<span>🎵</span><span>Musik: On</span>';
  });

  // Playful Dodging "Enggak" Button in Confession Modal
  const funnyDodgeLines = [
    'Eits! Perisai Cinta Ksatria memantulkan tombol "Enggak"~ 🛡️✨',
    'Tombol "Enggak"-nya malu dan kabur saat didekati Elica! 🙈💖',
    'Kata Putri Elica: "Jangan pencet yang itu dong, Ksatrianya udah berjuang lho~" 👑',
    'Sihir Romantis aktif! Pilihan "Enggak" sedang tidak tersedia di kerajaan ini~ 🌟',
    'Lihat deh, tombol "Mau!" makin bersinar memanggil Elica! 💘'
  ];
  let dodgeCount = 0;
  let yesButtonScale = 1;

  function dodgeNoButton(e) {
    if (e) e.preventDefault();
    window.audioEngine.playDodge();

    const maxOffsetX = Math.min(150, window.innerWidth * 0.26);
    const maxOffsetY = 85;

    const randX = (Math.random() - 0.5) * 2 * maxOffsetX;
    const randY = (Math.random() - 0.5) * 2 * maxOffsetY;

    btnNo.style.transform = `translate(${randX}px, ${randY}px) rotate(${(Math.random() - 0.5) * 18}deg)`;

    // Grow the Yes button subtly to make it funnier & more irresistible
    yesButtonScale = Math.min(1.32, yesButtonScale + 0.055);
    btnYes.style.transform = `scale(${yesButtonScale})`;

    dodgeMsg.textContent = funnyDodgeLines[dodgeCount % funnyDodgeLines.length];
    dodgeCount++;
  }

  btnNo.addEventListener('mouseenter', dodgeNoButton);
  btnNo.addEventListener('touchstart', dodgeNoButton, { passive: false });
  btnNo.addEventListener('click', dodgeNoButton);

  // "Yes / Aku Mau!" Button -> 3D Fireworks Finale & Celebration Dance!
  let fireworkInterval = null;

  btnYes.addEventListener('click', () => {
    gameState = 'VICTORY';
    confessionScreen.classList.add('hidden');
    victoryBanner.classList.remove('hidden');

    launchCelebrationFireworks();
    if (fireworkInterval) clearInterval(fireworkInterval);
    fireworkInterval = setInterval(() => {
      if (gameState === 'VICTORY') {
        launchCelebrationFireworks();
      } else {
        clearInterval(fireworkInterval);
      }
    }, 2800);
  });

  btnMoreFireworks.addEventListener('click', () => {
    launchCelebrationFireworks();
  });

  btnReopenLetter.addEventListener('click', () => {
    victoryBanner.classList.add('hidden');
    confessionScreen.classList.remove('hidden');
  });

  btnReplayGame.addEventListener('click', () => {
    if (fireworkInterval) clearInterval(fireworkInterval);
    startMiniGame();
  });

  // Main Animation Loop
  const clock = new THREE.Clock();
  const desiredCamPos = new THREE.Vector3();
  const desiredLookAt = new THREE.Vector3();
  const currentLookAt = new THREE.Vector3(0, 1.5, -2);

  function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.1);
    const elapsed = clock.getElapsedTime();

    // 1. Animate Environment Crystals & Magic Rings
    arena.outerRing.rotation.z = elapsed * 0.12;
    arena.midRing.rotation.z = -elapsed * 0.2;
    arena.floatingCrystals.forEach((c) => {
      c.mesh.position.y = c.baseY + Math.sin(elapsed * 2.2 + c.phase) * 0.22;
      c.mesh.rotation.y = elapsed * 1.4 + c.phase;
    });

    // Slowly rotate ambient starfield
    starField.rotation.y = elapsed * 0.03;

    // 2. Animate Princess Elica
    princess.haloHeart.rotation.y = elapsed * 2.2;
    princess.haloHeart.position.y = 2.85 + Math.sin(elapsed * 3) * 0.1;
    princess.scepterHeart.rotation.y = -elapsed * 2.5;

    if (gameState === 'VICTORY') {
      // Princess Elica joyful jump & dance
      princess.bodyGroup.position.y = Math.abs(Math.sin(elapsed * 6.5)) * 0.38;
      princess.bodyGroup.rotation.y = Math.sin(elapsed * 3.2) * 0.35;
      princess.leftArmPivot.rotation.z = 2.3 + Math.sin(elapsed * 10) * 0.3;
      princess.rightArmPivot.rotation.z = -2.3 - Math.sin(elapsed * 10) * 0.3;
    } else if (princessCheerTimer > 0) {
      princessCheerTimer -= dt;
      princess.bodyGroup.position.y = Math.abs(Math.sin(elapsed * 9)) * 0.28;
      princess.rightArmPivot.rotation.x = -0.9 + Math.sin(elapsed * 14) * 0.4;
      princess.leftArmPivot.rotation.x = -0.9 - Math.sin(elapsed * 14) * 0.4;
    } else {
      // Gentle royal breathing & scepter wave
      princess.bodyGroup.position.y = Math.sin(elapsed * 2.2) * 0.05;
      princess.bodyGroup.rotation.y = Math.sin(elapsed * 1.1) * 0.12;
      princess.rightArmPivot.rotation.x = -0.3 + Math.sin(elapsed * 2.5) * 0.15;
      princess.leftArmPivot.rotation.x = Math.sin(elapsed * 2.0) * 0.08;
      princess.leftArmPivot.rotation.z = 0.18;
      princess.rightArmPivot.rotation.z = -0.18;
    }

    // 3. State-Specific Knight & Camera Choreography
    if (gameState === 'INTRO') {
      // Orbit camera gently around the enchanted courtyard
      const camAngle = elapsed * 0.22;
      desiredCamPos.set(Math.sin(camAngle) * 11.5, 5.8, Math.cos(camAngle) * 11.5);
      desiredLookAt.set(0, 1.6, -2.0);

      // Knight heroic idle pose
      knight.torsoGroup.position.y = 1.05 + Math.sin(elapsed * 2.8) * 0.04;
      knight.capePivot.rotation.x = 0.18 + Math.sin(elapsed * 3.5) * 0.12;
    } else if (gameState === 'PLAYING') {
      // Determine movement vector
      let moveX = 0;
      let moveZ = 0;

      if (keys.left) moveX -= 1;
      if (keys.right) moveX += 1;
      if (keys.up) moveZ -= 1;
      if (keys.down) moveZ += 1;

      // Auto-pilot mode finds closest heart
      if (autoPilotMode && activeHearts.length > 0) {
        let closest = activeHearts[0];
        let minDist = knight.root.position.distanceTo(closest.group.position);
        for (let i = 1; i < activeHearts.length; i++) {
          const d = knight.root.position.distanceTo(activeHearts[i].group.position);
          if (d < minDist) {
            minDist = d;
            closest = activeHearts[i];
          }
        }
        pointerTarget = closest.group.position.clone();
      }

      if (moveX === 0 && moveZ === 0 && pointerTarget) {
        const dx = pointerTarget.x - knight.root.position.x;
        const dz = pointerTarget.z - knight.root.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.22) {
          moveX = dx / dist;
          moveZ = dz / dist;
        } else {
          pointerTarget = null;
        }
      }

      const moveLen = Math.hypot(moveX, moveZ);
      const speed = 6.2;

      if (moveLen > 0.01) {
        const nx = moveX / moveLen;
        const nz = moveZ / moveLen;

        knight.root.position.x += nx * speed * dt;
        knight.root.position.z += nz * speed * dt;

        // Clamp within courtyard bounds
        knight.root.position.x = Math.max(-7.6, Math.min(7.6, knight.root.position.x));
        knight.root.position.z = Math.max(-3.8, Math.min(7.2, knight.root.position.z));

        // Smoothly rotate Knight toward movement direction
        const targetAngle = Math.atan2(nx, nz);
        let angleDiff = targetAngle - knight.root.rotation.y;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        knight.root.rotation.y += angleDiff * Math.min(1, dt * 14);

        // Running animation cycle
        const runCycle = elapsed * 14;
        knight.leftLegPivot.rotation.x = Math.sin(runCycle) * 0.75;
        knight.rightLegPivot.rotation.x = -Math.sin(runCycle) * 0.75;
        knight.leftArmPivot.rotation.x = -Math.sin(runCycle) * 0.65;
        knight.rightArmPivot.rotation.x = Math.sin(runCycle) * 0.55;
        knight.torsoGroup.position.y = 1.05 + Math.abs(Math.sin(runCycle)) * 0.14;
        knight.capePivot.rotation.x = 0.55 + Math.sin(runCycle * 1.5) * 0.18;
        knight.plumeGroup.rotation.x = -0.25 + Math.sin(runCycle) * 0.15;
      } else {
        // Idle breathing animation
        knight.leftLegPivot.rotation.x *= 0.85;
        knight.rightLegPivot.rotation.x *= 0.85;
        knight.leftArmPivot.rotation.x = Math.sin(elapsed * 2.5) * 0.1;
        knight.rightArmPivot.rotation.x = -Math.sin(elapsed * 2.5) * 0.1;
        knight.torsoGroup.position.y = 1.05 + Math.sin(elapsed * 3) * 0.04;
        knight.capePivot.rotation.x = 0.18 + Math.sin(elapsed * 3) * 0.1;
      }

      // Pulse Knight's ground aura ring
      knight.auraRing.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.06);

      // Update & check collision with Collectible Hearts
      for (let i = activeHearts.length - 1; i >= 0; i--) {
        const h = activeHearts[i];
        h.spawnScale = Math.min(1, h.spawnScale + dt * 3.5);
        h.group.scale.setScalar(h.spawnScale);

        h.mesh.rotation.y = elapsed * 2.4 + h.phase;
        h.mesh.position.y = 1.05 + Math.sin(elapsed * 3.2 + h.phase) * 0.22;
        h.ring.scale.setScalar(0.85 + Math.sin(elapsed * 4 + h.phase) * 0.15);

        const distToKnight = Math.hypot(
          knight.root.position.x - h.group.position.x,
          knight.root.position.z - h.group.position.z
        );

        if (distToKnight < 1.18) {
          // Collected!
          collectedHearts += h.points;
          princessCheerTimer = 1.1;
          window.audioEngine.playHeartCollect(h.isGolden);

          create3DBurst(
            new THREE.Vector3(h.group.position.x, 1.1, h.group.position.z),
            h.isGolden ? 0xffd166 : 0xff2e7e,
            28,
            1.0
          );

          spawnFloatingScorePopup(
            new THREE.Vector3(h.group.position.x, 1.8, h.group.position.z),
            h.isGolden ? '+2 Hati Emas ✨' : '+1 Cinta ❤️'
          );

          scene.remove(h.group);
          activeHearts.splice(i, 1);
          updateHUD();

          if (collectedHearts >= TARGET_HEARTS) {
            triggerQuestComplete();
            break;
          } else {
            spawnCollectibleHeart();
          }
        }
      }

      // Dynamic 1:1 Character Follow Camera (Responsive for Mobile Portrait & Desktop)
      const isPortrait = window.innerWidth < window.innerHeight;
      const camHeight = isPortrait ? 9.6 : 7.8;
      const camDistanceZ = isPortrait ? 10.5 : 8.4;
      // Offset lookAt slightly forward (-Z) on mobile so the Knight sits above the bottom D-Pad
      const lookOffsetZ = isPortrait ? 0.6 : -0.8;

      desiredCamPos.set(
        knight.root.position.x,
        camHeight,
        knight.root.position.z + camDistanceZ
      );
      desiredLookAt.set(
        knight.root.position.x,
        1.15,
        knight.root.position.z + lookOffsetZ
      );
    } else if (gameState === 'TRANSITION' || gameState === 'CONFESSION') {
      // Move Knight smoothly to the Royal Proposal spot in front of Princess Elica
      const targetSpot = new THREE.Vector3(0, 0, -3.5);
      knight.root.position.lerp(targetSpot, dt * 3.2);

      // Face Princess Elica (facing -Z means rotation.y = Math.PI)
      let angleDiff = Math.PI - knight.root.rotation.y;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      knight.root.rotation.y += angleDiff * dt * 6;

      // Kneeling Proposal Pose & holding up the glowing Heart Crystal
      knight.bodyRig.position.y = THREE.MathUtils.lerp(knight.bodyRig.position.y, -0.32, dt * 4);
      knight.leftLegPivot.rotation.x = THREE.MathUtils.lerp(knight.leftLegPivot.rotation.x, -1.1, dt * 5);
      knight.rightLegPivot.rotation.x = THREE.MathUtils.lerp(knight.rightLegPivot.rotation.x, 0.85, dt * 5);
      knight.leftArmPivot.rotation.x = THREE.MathUtils.lerp(knight.leftArmPivot.rotation.x, -1.25, dt * 5);
      knight.rightArmPivot.rotation.x = THREE.MathUtils.lerp(knight.rightArmPivot.rotation.x, -1.25, dt * 5);

      knight.proposalHeart.visible = true;
      knight.proposalHeart.rotation.y = elapsed * 2.6;
      knight.proposalHeart.position.y = 1.65 + Math.sin(elapsed * 3.5) * 0.12;

      // Romantic Cinematic Camera angle framing both Knight & Princess Elica
      const isPortrait = window.innerWidth < window.innerHeight;
      if (isPortrait) {
        desiredCamPos.set(2.2, 3.8, 0.8);
        desiredLookAt.set(0, 1.65, -5.0);
      } else {
        desiredCamPos.set(3.4, 3.2, -1.2);
        desiredLookAt.set(0, 1.75, -5.0);
      }
    } else if (gameState === 'VICTORY') {
      // Knight stands up & does joyful celebration jump dance with Princess Elica!
      knight.bodyRig.position.y = Math.abs(Math.sin(elapsed * 6.5)) * 0.45;
      knight.root.rotation.y = elapsed * 2.8;
      knight.leftLegPivot.rotation.x = Math.sin(elapsed * 10) * 0.4;
      knight.rightLegPivot.rotation.x = -Math.sin(elapsed * 10) * 0.4;
      knight.leftArmPivot.rotation.x = -2.4;
      knight.rightArmPivot.rotation.x = -2.4;

      knight.proposalHeart.visible = true;
      knight.proposalHeart.position.y = 2.45 + Math.sin(elapsed * 5) * 0.18;
      knight.proposalHeart.rotation.y = elapsed * 4;

      const isPortrait = window.innerWidth < window.innerHeight;
      const orbitRadius = isPortrait ? 3.8 : 5.2;
      const camZ = isPortrait ? 1.2 : -0.5;
      desiredCamPos.set(Math.sin(elapsed * 0.4) * orbitRadius, 4.0, camZ);
      desiredLookAt.set(0, 2.0, -5.0);
    }

    // Smooth & Responsive Camera Interpolation (faster follow during gameplay)
    const camLerpSpeed = gameState === 'PLAYING' ? 8.5 : 3.5;
    const lookLerpSpeed = gameState === 'PLAYING' ? 12.0 : 4.5;
    camera.position.lerp(desiredCamPos, Math.min(1, dt * camLerpSpeed));
    currentLookAt.lerp(desiredLookAt, Math.min(1, dt * lookLerpSpeed));
    camera.lookAt(currentLookAt);

    // 4. Update Active 3D Particle Bursts / Fireworks
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.age += dt;
      if (b.age >= b.maxAge) {
        scene.remove(b.points);
        b.points.geometry.dispose();
        b.points.material.dispose();
        bursts.splice(i, 1);
        continue;
      }

      const posAttr = b.points.geometry.getAttribute('position');
      for (let j = 0; j < b.velocities.length; j++) {
        const v = b.velocities[j];
        v.vy -= 4.8 * dt; // gentle gravity
        posAttr.array[j * 3] += v.vx * dt;
        posAttr.array[j * 3 + 1] += v.vy * dt;
        posAttr.array[j * 3 + 2] += v.vz * dt;
      }
      posAttr.needsUpdate = true;
      b.points.material.opacity = 1 - b.age / b.maxAge;
    }

    renderer.render(scene, camera);
  }

  // Responsive Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
})();
