# 3D Logo Scroll Experience — Design Rules

## 1. Design Philosophy

Build the website as a **premium, cinematic, futuristic 3D experience**.

The 3D logo is the primary visual identity and must remain the visual focus.

The experience should feel:

- Premium
- Minimal
- Cinematic
- Futuristic
- Interactive
- Spatial
- Smooth
- Professional
- Technology-oriented

Avoid generic landing-page aesthetics.

Do not overload the interface with unnecessary cards, gradients, buttons, decorations, or animations.

---

# 2. 3D Logo Is the Hero Element

The provided 3D logo/model is the central visual element.

Always preserve:

- Original geometry
- Materials
- Textures
- Mesh hierarchy
- Relative positioning
- Original scale
- Original rotations

Never permanently modify the model's source transforms.

Store original transforms when the model loads.

```js
{
  position,
  rotation,
  scale
}
```

All animation must be calculated relative to these original transforms.

---

# 3. Model Loading

Use `GLTFLoader` for `.glb` / `.gltf` models.

Recommended model location:

```text
/public/models/logo.glb
```

The model path must be easy to replace.

Do not tightly couple animation logic to a specific model filename.

The implementation should automatically traverse the model hierarchy and identify renderable meshes.

Example:

```js
model.traverse((child) => {
  if (child.isMesh) {
    // register logo part
  }
});
```

Each independent mesh should be treated as a potentially animatable logo part.

---

# 4. Logo Part System

Never create separate animation logic for every individual mesh.

Create a centralized configuration system.

Example:

```js
const partAnimations = {
  partName: {
    xDistance: 5,
    yDistance: 0,
    zDistance: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    stagger: 0
  }
};
```

The system must support:

- X displacement
- Y displacement
- Z displacement
- Rotation
- Stagger
- Per-part intensity

The animation configuration must be easy to modify without rewriting the animation engine.

---

# 5. Primary Disassembly Direction

The dominant animation axis is the **X-axis**.

Logo components should spread primarily:

```text
← X ───────────── X →
```

Some parts move left:

```text
x = -distance
```

Some parts move right:

```text
x = +distance
```

Do not move every component by the same amount.

Use different distances to create a natural exploded-object composition.

Example:

```text
Part 1 → -4
Part 2 → +5
Part 3 → -7
Part 4 → +8
Part 5 → -10
Part 6 → +11
```

---

# 6. Secondary 3D Movement

X-axis movement is dominant, but the animation may include subtle:

- Y-axis movement
- Z-axis movement
- Rotation
- Scale

These secondary transformations exist to reinforce the 3D illusion.

They must remain subtle.

Do not turn the logo into uncontrolled random motion.

The viewer must still understand that all parts originated from one logo.

---

# 7. Exploded-View Composition

The final composition should resemble a professional 3D exploded technical object.

Concept:

```text
                  PART

       PART                 PART


                  LOGO


       PART                 PART

                  PART
```

Maintain visual balance.

Avoid:

- All parts moving left
- All parts moving right
- Parts overlapping excessively
- Parts disappearing outside the viewport
- Completely random positions
- Excessive depth separation

The exploded logo must remain recognizable.

---

# 8. Scroll Is the Animation Controller

The primary animation must be controlled by **scroll progress**.

Do not create an independent autoplay animation for the disassembly.

Concept:

```text
Scroll Position
       ↓
Normalized Progress
       ↓
Animation State
       ↓
Smooth Interpolation
       ↓
Three.js Render
```

Use normalized progress:

```text
0.0 = assembled
0.25 = slightly separated
0.50 = moderately separated
0.75 = heavily separated
1.0 = maximum disassembly
```

Scrolling upward must reverse the animation naturally.

---

# 9. Never Use Raw Scroll Values Directly

Do not directly map raw `window.scrollY` values to mesh transforms.

Bad:

```js
mesh.position.x = window.scrollY;
```

Instead:

```js
const progress = calculateScrollProgress();

targetX = originalX + displacement * progress;

currentX = lerp(
  currentX,
  targetX,
  smoothing
);
```

Use smooth interpolation.

Preferred:

```js
THREE.MathUtils.lerp()
```

or an equivalent interpolation system.

---

# 10. Render Loop

The Three.js render loop is responsible for applying smooth animation.

Architecture:

```text
Scroll Event
     ↓
Update Target Progress
     ↓
requestAnimationFrame
     ↓
Interpolate Current State
     ↓
Update Camera
     ↓
Update Logo Parts
     ↓
Render Scene
```

Do not perform expensive scene calculations directly inside the scroll event.

The scroll listener should primarily update state.

---

# 11. Staggered Disassembly

Logo components should not necessarily move at exactly the same time.

Use subtle stagger.

Example:

```js
effectiveProgress =
  clamp(progress - part.stagger, 0, 1);
```

Stagger should be:

- Small
- Predictable
- Deterministic
- Visually intentional

Do not use uncontrolled random animation.

---

# 12. Animation Easing

Movement must not feel mechanical.

Use easing functions where appropriate.

Preferred characteristics:

- Smooth acceleration
- Smooth deceleration
- No sudden jumps
- No abrupt stops

For example:

```js
smoothProgress = easeInOut(progress);
```

The exact easing function can vary depending on the animation stage.

---

# 13. Animation Stages

The scroll experience should contain multiple visual stages.

## Stage 1 — Assembled

At the top of the page:

```text
[ COMPLETE LOGO ]
```

Requirements:

- Fully assembled
- Centered
- Stable
- Slight cinematic idle movement
- Strong visual presence

---

## Stage 2 — Beginning Disassembly

The first logo components begin separating.

Movement should be subtle.

The logo must still clearly appear assembled.

---

## Stage 3 — Partial Explosion

Parts become visibly separated.

X-axis displacement becomes more noticeable.

Camera begins moving backward.

---

## Stage 4 — Full Exploded View

The logo reaches maximum separation.

The user should be able to clearly identify individual components.

Camera should provide enough distance to see the complete exploded composition.

---

## Stage 5 — Optional Reassembly

If the page continues beyond the exploded section, consider transitioning the logo toward another state.

When scrolling upward, the complete animation must reverse naturally.

---

# 14. Camera Rules

The camera should respond subtly to scroll progress.

At the beginning:

```text
Close / medium framing
```

During disassembly:

```text
Gradually move backward
```

At maximum explosion:

```text
Wide framing
```

Camera movement must be synchronized with the logo.

Avoid:

- Aggressive zooming
- Sudden camera movement
- Excessive rotation
- Disorienting perspective changes

The logo must remain the visual anchor.

---

# 15. Camera Look-At

Maintain a stable visual target.

Prefer looking toward the logo's central origin rather than continuously following individual parts.

Example:

```js
camera.lookAt(sceneCenter);
```

Do not make the camera chase individual logo components.

---

# 16. Background

The background should be dark, minimal, and sophisticated.

Recommended characteristics:

- Dark base
- Subtle gradients
- Soft lighting
- Very subtle particles
- Minimal grid/noise
- Depth

The background must support the logo rather than compete with it.

Avoid excessive:

- Particle density
- Glows
- Neon effects
- Animated backgrounds
- Decorative shapes

---

# 17. Lighting

Lighting should emphasize the 3D form.

Use an appropriate combination of:

- Ambient lighting
- Directional lighting
- Point lighting
- Rim lighting
- Environment lighting

Lighting should create:

- Depth
- Form
- Separation
- Material definition
- Cinematic contrast

Avoid flat lighting.

---

# 18. Materials

Preserve the model's original materials whenever possible.

Do not replace materials without a clear design requirement.

Do not unnecessarily recreate materials.

If material adjustments are required:

- Preserve the original visual identity.
- Maintain physically believable lighting.
- Avoid excessive metallic/glass effects.
- Avoid making every material emissive.

---

# 19. Idle Animation

The logo may have a subtle idle animation when the user is not actively scrolling.

Idle movement must be extremely subtle.

Possible effects:

```text
small rotation
small floating movement
small camera drift
```

Idle animation must never interfere with scroll-controlled positioning.

Scroll animation always has priority.

---

# 20. UI Design

The interface surrounding the 3D scene must remain minimal.

Preferred navigation:

```text
LOGO                         WORK   ABOUT   CONTACT
```

Use:

- Clear typography
- Generous spacing
- Strong hierarchy
- Minimal decoration

The navigation must not visually compete with the 3D logo.

---

# 21. Typography

Typography should feel modern and premium.

Prefer:

- Clean sans-serif
- Strong geometric forms
- Clear hierarchy
- Large hero typography
- Small supporting text

Avoid:

- Excessive font weights
- Decorative fonts
- Too many font families
- Large blocks of text

---

# 22. Hero Content

The hero section should communicate the brand immediately.

Example:

```text
YOUR BRAND

Digital experiences
built in three dimensions.

Scroll to explore
```

Text should remain secondary to the 3D logo.

---

# 23. Full-Screen Composition

The 3D experience should use the viewport effectively.

Preferred:

```css
min-height: 100vh;
```

The Three.js canvas should occupy the intended visual area without creating unnecessary layout shifts.

---

# 24. Responsive Behavior

Desktop should receive the full visual experience.

Tablet and mobile should use reduced complexity.

On mobile:

- Reduce X-axis displacement.
- Reduce Y/Z displacement.
- Reduce particle count.
- Reduce lighting complexity.
- Reduce post-processing.
- Reduce model scale if necessary.
- Maintain recognizable disassembly.

Never simply hide the 3D experience on mobile unless performance makes it absolutely necessary.

---

# 25. Performance Rules

Performance is a first-class requirement.

Target:

```text
~60 FPS on modern desktop devices
```

Avoid:

- Unnecessary allocations inside render loops
- Recreating vectors every frame
- Excessive raycasting
- Excessive post-processing
- Huge particle counts
- Duplicate animation systems
- Unnecessary DOM updates

Reuse objects such as:

```js
THREE.Vector3
THREE.Euler
THREE.Quaternion
```

where possible.

---

# 26. Pixel Ratio

Do not blindly use the device's full pixel ratio.

Use a reasonable limit.

Example:

```js
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);
```

Adjust further for mobile if necessary.

---

# 27. Resize Handling

The Three.js renderer and camera must respond correctly to viewport changes.

Update:

```text
camera.aspect
camera.projectionMatrix
renderer size
canvas size
```

Avoid unnecessary resize calculations.

---

# 28. Resource Cleanup

When components are removed/unmounted:

Dispose of:

- Geometry
- Materials
- Textures
- Render targets
- Post-processing resources
- Renderer resources where appropriate

Avoid WebGL memory leaks.

---

# 29. React Rules

If React is used:

- Keep Three.js logic modular.
- Do not put the entire Three.js implementation into one component.
- Separate model loading from animation control.
- Separate scroll logic from rendering.
- Avoid unnecessary React state updates every frame.

Do not trigger React re-renders for every animation frame.

Prefer refs or external animation state for high-frequency values.

---

# 30. JavaScript Only

Use:

```text
JavaScript
```

Do not introduce TypeScript.

All examples and implementation files should use:

```text
.js
.jsx
```

rather than:

```text
.ts
.tsx
```

---

# 31. Recommended Architecture

Use a modular architecture similar to:

```text
src/
├── components/
│   ├── LogoScene.jsx
│   ├── LogoModel.jsx
│   ├── Navigation.jsx
│   └── Hero.jsx
│
├── three/
│   ├── camera.js
│   ├── lights.js
│   ├── modelLoader.js
│   ├── logoAnimation.js
│   └── renderer.js
│
├── hooks/
│   └── useScrollProgress.js
│
├── config/
│   └── logoAnimationConfig.js
│
├── App.jsx
└── styles.css
```

The exact structure can change if there is a strong architectural reason.

---

# 32. Animation Configuration

Centralize configurable values.

Example:

```js
export const logoAnimationConfig = {
  maxProgress: 1,

  camera: {
    startZ: 6,
    endZ: 11
  },

  parts: {
    defaultXDistance: 5,
    defaultYDistance: 0,
    defaultZDistance: 0
  },

  mobile: {
    displacementMultiplier: 0.5
  }
};
```

Avoid scattering magic numbers throughout the codebase.

---

# 33. Magic Numbers

Do not write unexplained values such as:

```js
mesh.position.x += 7.438;
```

Instead:

```js
const MAX_X_DISPLACEMENT = 7.4;
```

or place the value in a configuration object.

Every important visual parameter should be easy to tune.

---

# 34. Deterministic Motion

If variation is required between parts, use deterministic values.

Do not generate new random values every frame.

Bad:

```js
mesh.position.x += Math.random();
```

Good:

```js
const partConfig = {
  xDistance: 6,
  stagger: 0.08
};
```

The animation must produce the same visual result consistently.

---

# 35. Scroll Progress Calculation

Scroll progress should represent the relevant animation section rather than blindly using the entire document.

Concept:

```js
const sectionTop = section.offsetTop;
const sectionHeight = section.offsetHeight;

const progress =
  (scrollY - sectionTop) / sectionHeight;
```

Clamp the result:

```js
const progress = THREE.MathUtils.clamp(
  rawProgress,
  0,
  1
);
```

---

# 36. Separation Formula

Every part's final position should be based on its original position.

Concept:

```js
targetPosition.x =
  originalPosition.x +
  config.xDistance *
  progress;
```

For a left-moving part:

```js
targetPosition.x =
  originalPosition.x -
  config.xDistance *
  progress;
```

Never accumulate movement:

```js
mesh.position.x += distance;
```

Accumulation can cause animation drift.

---

# 37. Rotation Formula

Rotation should also be relative to the original rotation.

Example:

```js
targetRotation.y =
  originalRotation.y +
  config.rotationY *
  progress;
```

Never repeatedly increment rotation based on the current value unless intentionally creating continuous idle rotation.

---

# 38. Model Hierarchy Safety

Do not assume every child of the GLTF scene is a logo part.

Ignore:

- Cameras
- Lights
- Empty helper nodes
- Non-renderable objects

Only animate actual intended meshes/groups.

If the model hierarchy is ambiguous, create a clear mapping/configuration layer.

---

# 39. Accessibility

The 3D experience should not be the only way to understand the website.

Provide:

- Accessible navigation
- Meaningful text
- Keyboard-accessible controls
- Proper semantic HTML
- Sufficient text contrast

Respect:

```css
prefers-reduced-motion
```

When reduced motion is enabled:

- Disable or significantly reduce continuous animations.
- Keep the logo in a stable state.
- Avoid aggressive camera movement.

---

# 40. Loading Experience

Do not display a blank screen while the GLB is loading.

Use a minimal loading state.

Example:

```text
LOADING EXPERIENCE...
```

The loader should disappear smoothly once the model is ready.

Avoid large intrusive loading screens.

---

# 41. Error Handling

If the GLB fails to load:

- Catch the error.
- Log a useful development message.
- Prevent the entire website from crashing.
- Display a graceful fallback if appropriate.

Example:

```js
try {
  // load model
} catch (error) {
  console.error("Failed to load 3D logo:", error);
}
```

---

# 42. Visual Hierarchy

Always prioritize:

```text
1. 3D Logo
2. Brand message
3. Navigation
4. Background effects
5. Decorative elements
```

Nothing should overpower the logo.

---

# 43. What Claude Code Must Avoid

Do NOT:

- Use TypeScript.
- Replace the 3D model unnecessarily.
- Flatten the model into one mesh.
- Destroy the original transforms.
- Use raw scroll position directly as mesh position.
- Create uncontrolled random movement.
- Animate every part identically.
- Overuse particles.
- Overuse glow effects.
- Make the background brighter than the logo.
- Create unnecessary UI components.
- Put all logic into one giant component.
- Cause React re-renders every animation frame.
- Introduce unnecessary dependencies.
- Use unexplained magic numbers.
- Create animation drift by accumulating transforms.

---

# 44. Implementation Priority

When making implementation decisions, follow this priority:

```text
1. Visual quality
2. Smooth scroll interaction
3. 3D spatial correctness
4. Performance
5. Responsive behavior
6. Accessibility
7. Code maintainability
8. Decorative effects
```

Do not sacrifice smooth interaction for unnecessary visual effects.

---

# 45. Definition of Done

The implementation is considered complete only when:

- [ ] 3D logo loads correctly.
- [ ] Logo starts fully assembled.
- [ ] Individual logo parts can be identified.
- [ ] Parts retain their original transforms.
- [ ] Scroll controls disassembly.
- [ ] X-axis is the dominant movement direction.
- [ ] Parts move in different directions/distances.
- [ ] Subtle Y/Z movement adds depth.
- [ ] Individual parts have subtle rotations.
- [ ] Animation uses smooth interpolation.
- [ ] Scrolling upward reverses the effect.
- [ ] Camera responds smoothly.
- [ ] Background remains visually secondary.
- [ ] Lighting provides strong 3D depth.
- [ ] Mobile behavior is optimized.
- [ ] Reduced-motion behavior exists.
- [ ] No unnecessary React re-renders occur.
- [ ] WebGL resources are properly cleaned up.
- [ ] No unexplained magic numbers remain.
- [ ] Animation configuration is centralized.
- [ ] The implementation remains modular.
- [ ] The final result feels like a premium interactive 3D website.

---

# 46. Claude Code Working Rule

Before modifying the project:

1. Inspect the existing project structure.
2. Identify the framework and build system.
3. Inspect existing Three.js dependencies.
4. Inspect the provided 3D model.
5. Inspect the model hierarchy.
6. Identify all animatable parts.
7. Understand existing styling and layout.
8. Reuse existing architecture where reasonable.
9. Avoid unnecessary rewrites.
10. Implement the smallest clean architectural change that achieves the intended experience.

Before finishing:

1. Test the model loading.
2. Test scroll progress.
3. Test assembled state.
4. Test partial disassembly.
5. Test maximum disassembly.
6. Test reverse scrolling.
7. Test resize behavior.
8. Test mobile behavior.
9. Test reduced-motion behavior.
10. Check for console errors.
11. Check for WebGL/resource leaks.
12. Verify that the logo remains visually balanced.

The final implementation must prioritize a **cinematic, smooth, premium 3D logo disassembly experience controlled by vertical scrolling**.