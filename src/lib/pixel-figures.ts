/**
 * Animated 1-bit pixel figures (one per service), drawn without any library.
 *
 * One hidden WebGL canvas renders every figure on the page at its grid size (one
 * fragment = one chunky cell); the result is copied 1:1 into the figure's own 2D canvas,
 * which CSS scales up by a whole number of device pixels (`image-rendering: pixelated`),
 * so every cell is the same size and as crisp as vector at any zoom.
 *
 * Each figure is a few layered forms (bars, discs, boxes, gears). A form is opaque and
 * filled with a dither pattern (solid, Bayer 4x4 by tone, checker, lines, diagonal, dots).
 * The pattern is fixed to the cell grid and the forms move underneath it, so it never
 * swims. Time is stepped (`FPS`) for the 8-bit feel.
 *
 * The ink takes the canvas's CSS `color`.
 * Figures run on the clock, whatever the scroll position. The first time a figure is on
 * screen it builds up once from the bottom, cell by cell through the Bayer matrix
 * (`BUILD` seconds); off screen it keeps its time but is not drawn. A canvas with
 * `data-figure-replay` builds up again every time it comes back (the phone menu).
 * `data-figure-cycle="a,b"` makes a figure dissolve to others in turn (the Home hero),
 * and `data-figure-ripple` lets a click or tap send a ripple through it.
 * `data-figure-video="<url>"` dithers real footage live in place of the drawn figure as
 * soon as the clip has a frame; nothing is drawn while it loads, and the drawn figure is
 * the fallback only if the clip fails to load.
 * `?t=<seconds>` freezes time (screenshots). Reduced motion: one still frame.
 */

/** Order = the shader's `uFig` index. The last three are page backgrounds. */
export const FIGURES = ["web", "ai", "automation", "dataviz", "hero", "waves", "rings", "tubes", "focus", "video"] as const;
export type FigureId = (typeof FIGURES)[number];
/** Cells along the short side of a figure. */
const CELLS = 96;
const FPS = 12;
/** Seconds a figure takes to build up the first time it is on screen. */
const BUILD = 1.6;
/** Cycling figures: seconds one is held, and seconds the dissolve to the next takes. */
const HOLD = 8;
const FADE = 1.4;
/** Seconds a ripple lives. */
const RIPPLE = 4;

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0., 1.); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uT;
uniform float uFig;
uniform float uReveal;
uniform float uFigB;
uniform float uMix;
uniform vec3 uRipple;
uniform sampler2D uVideo;
uniform vec2 uVideoSize;
const float TAU = 6.2831853;

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2. + a.y * a.y * .75); }
float bayer4(vec2 a) { return bayer2(.5 * a) * .25 + bayer2(a); }
float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

// Ink (0 or 1) at cell c of a surface filled with pattern pat; tone 0..1 only matters for Bayer.
float ink(float pat, float tone, vec2 c) {
  if (pat < .5) return 1.;                                                // 0 solid
  if (pat < 1.5) return step(bayer4(c) + .03, tone);                      // 1 Bayer 4x4
  if (pat < 2.5) return step(mod(c.x + c.y, 2.), .5);                     // 2 checker
  if (pat < 3.5) return step(mod(c.x, 2.), .5);                           // 3 vertical lines
  if (pat < 4.5) return step(mod(c.y, 2.), .5);                           // 4 horizontal lines
  if (pat < 5.5) return step(mod(c.x + c.y, 4.), 1.5);                    // 5 diagonal
  return step(mod(c.x, 2.), .5) * step(mod(c.y, 2.), .5);                 // 6 dots
}

// Round-topped bar: centre x, half-width w, from y0 up to y1. Negative inside.
float arch(vec2 p, float x, float w, float y0, float y1) {
  float top = max(y1 - w, y0);
  float d = p.y > top ? length(p - vec2(x, top)) - w : abs(p.x - x) - w;
  return max(d, y0 - p.y);
}
float box(vec2 p, vec2 ctr, vec2 ext) {
  vec2 d = abs(p - ctr) - ext;
  return max(d.x, d.y);
}
// Inside (1) a gear of radius R with n teeth, turned by rot.
float gear(vec2 p, float R, float n, float rot) {
  float teeth = step(0., sin(n * (atan(p.y, p.x) + rot)));
  return step(length(p), R * (1. + .17 * teeth));
}

// Web: a browser window with a page scrolling inside it.
float figWeb(vec2 p, vec2 c, float t) {
  vec2 win = vec2(.84, .9);
  float frame = box(p, vec2(0.), win);
  if (frame > 0.) return 0.;
  float col = 0.;
  vec2 q = vec2(p.x, mod(p.y - t * .2, 2.4) - 1.2);
  if (arch(q, 0., .66, .22, 1.08) < 0.) col = ink(1., .2 + .8 * (q.x + .66) / 1.32, c);
  if (box(q, vec2(-.36, -.2), vec2(.3, .3)) < 0.) col = ink(2., 1., c);
  if (box(q, vec2(.36, -.2), vec2(.3, .3)) < 0.) col = ink(3., 1., c);
  if (box(q, vec2(0., -.72), vec2(.66, .045)) < 0.) col = 1.;
  if (box(q, vec2(-.2, -.9), vec2(.46, .045)) < 0.) col = 1.;
  if (box(q, vec2(-.3, -1.08), vec2(.36, .045)) < 0.) col = ink(6., 1., c);
  // Chrome: title bar with three holes, and the border.
  if (p.y > win.y - .24) {
    col = 1.;
    for (int i = 0; i < 3; i++) {
      if (length(p - vec2(-.66 + float(i) * .17, win.y - .12)) < .055) col = 0.;
    }
  }
  if (frame > -.05) col = 1.;
  return col;
}

// AI: one thick tube that undulates, its shading travelling along it.
float figAi(vec2 p, vec2 c, float t) {
  float col = 0.;
  for (int i = 0; i < 64; i++) {
    float s = float(i) / 63.;
    vec2 q = vec2(.56 * sin(TAU * 1.55 * s + t * .7), .74 - 1.48 * s + .1 * sin(TAU * 3.1 * s + t * .7));
    if (length(p - q) < .2) {
      float tone = .5 + .5 * sin(TAU * (s * 1.3 - t * .12));
      col = ink(1., .3 + .7 * tone, c);
    }
  }
  return col;
}

// Automation: two meshed gears turning each other.
float figAuto(vec2 p, vec2 c, float t) {
  float col = 0.;
  float w = t * .35;
  vec2 a = p - vec2(-.2, .2);
  float ra = length(a);
  if (gear(a, .58, 10., w) > .5) col = ink(2., 1., c);
  if (ra < .36) col = 0.;
  if (ra < .28) col = mod(atan(a.y, a.x) - t * .6, TAU) < TAU * .7 ? 1. : ink(3., 1., c);
  if (ra < .1) col = 0.;
  vec2 b = p - vec2(.5, -.52);
  float rb = length(b);
  if (gear(b, .29, 5., -2. * w + .3) > .5) col = ink(1., .35 + .65 * (b.y + .34) / .68, c);
  if (rb < .1) col = 0.;
  return col;
}

// Data visualization: two rows of round-topped bars rising and falling.
float figData(vec2 p, vec2 c, float t) {
  float col = 0.;
  for (int j = 0; j < 2; j++) {
    float row = float(j);
    for (int i = 0; i < 5; i++) {
      if (j == 0 && i == 4) continue;
      float fi = float(i);
      float x = (j == 0 ? -.54 : -.72) + fi * .36;
      float k = t / 2.4 + fi * .17 + row * .5;
      float seed = fi * 7.3 + row * 31.;
      float h = mix(hash(seed + floor(k)), hash(seed + floor(k) + 1.), smoothstep(0., .45, fract(k)));
      float y0 = -.88;
      float y1 = j == 0 ? mix(-.05, .88, h) : mix(-.6, .4, h);
      if (arch(p, x, .17, y0, y1) < 0.) {
        float pat = mod(fi * 2. + (j == 0 ? 5. : 0.), 7.);
        col = ink(pat, 1. - .85 * (p.y - y0) / (y1 - y0), c);
      }
    }
  }
  return col;
}

// Hero: three rows of round-topped arches marching sideways at different speeds.
float figHero(vec2 p, vec2 c, float t) {
  float col = 0.;
  for (int j = 0; j < 3; j++) {
    float row = float(j);
    float w = .27 - row * .045;
    float x = p.x + t * (.05 + row * .05) + row * .37;
    float n = floor(x / (2. * w));
    float lx = x - (n + .5) * 2. * w;
    float seed = n * 3.7 + row * 17.;
    float h = hash(seed);
    float y1 = mix(.85, -.25, row * .5) - h * .7 + .1 * sin(t * .6 + seed);
    if (h > .22 && arch(vec2(lx, p.y), 0., w, -1.3, y1) < 0.) {
      col = ink(mod(n + row * 3., 7.), 1. - .8 * (p.y + 1.1) / (y1 + 1.1), c);
    }
  }
  return col;
}

// Waves (page background): four rolling hills, back to front, each its own pattern.
float figWaves(vec2 p, vec2 c, float t) {
  float col = 0.;
  for (int j = 0; j < 4; j++) {
    float f = float(j);
    float y = .55 - f * .38 + (.2 - f * .03) * sin(p.x * (1.1 + f * .45) + t * (.25 + f * .12) + f * 1.9);
    if (p.y < y) col = ink(j == 0 ? 6. : j == 1 ? 5. : j == 2 ? 2. : 4., 1., c);
  }
  return col;
}

// Rings (page background): bands spreading from the bottom edge like ripples, thinning out with distance.
float figRings(vec2 p, vec2 c, float t) {
  vec2 ext = .5 * uRes / (.46 * min(uRes.x, uRes.y));
  float r = length(p - vec2(ext.x * .45, -ext.y - .2));
  float k = floor(r / .24 - t * .22);
  if (mod(k, 2.) > .5) return 0.;
  return ink(mod(k * .5, 7.), 1., c) * step(bayer4(c) + .03, 1.25 - r / (ext.x * .9));
}

// Tubes (page background): three long tubes undulating across the page, shading travelling along them.
float figTubes(vec2 p, vec2 c, float t) {
  float col = 0.;
  for (int j = 0; j < 3; j++) {
    float f = float(j);
    float y = .5 - f * .55 + .2 * sin(p.x * (1.3 + f * .2) + t * .45 + f * 2.1);
    if (abs(p.y - y) < .2) col = ink(1., .25 + .75 * (.5 + .5 * sin(p.x * 1.1 - t * .5 + f * 1.7)), c);
  }
  return col;
}

// ---- Coder, side view (Home hero): me at the desk, flat graphic ----
// A limb or any thick line from a to b. Negative inside.
float cap(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a, ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0., 1.)) - r;
}
// Paint a part over what is there with a thin clear outline around it (PART), or flush (FLAT).
#define PART(d, v) if ((d) < .03) col = (d) < 0. ? (v) : 0.;
#define FLAT(d, v) if ((d) < 0.) col = (v);

// Ink (1) of the code on the screen at s (screen-centred, about +-.59 x +-.37).
float codeInk(vec2 s, vec2 c, float t) {
  const float LINES = 9.;
  float row = floor((.33 - s.y) / .075);
  float inrow = fract((.33 - s.y) / .075);
  float typed = mod(t * .9, LINES + 2.); // lines written so far; two beats of rest, then a new file
  float seed = row * 13.7 + floor(t * .9 / (LINES + 2.)) * 71.;
  float x = s.x - (-.53 + floor(hash(seed) * 3.) * .09);
  float len = .25 + hash(seed + 1.) * .7;
  float shown = row < floor(typed) ? len : row == floor(typed) ? len * fract(typed) : 0.;
  if (row < 0. || row >= LINES || inrow < .25 || inrow > .7 || x < 0.) return 0.;
  // Characters with gaps between words; some lines are comments (checker).
  if (x < shown && hash(floor(x / .03) * 3.1 + seed) > .18) return hash(seed + 2.) > .75 ? ink(2., 1., c) : 1.;
  // Blinking cursor at the end of the line being written.
  return row == floor(typed) && x >= shown && x < shown + .03 && fract(t * 1.5) < .6 ? 1. : 0.;
}

// Clear with a black rim (bare skin), or a rim with a pattern inside (cloth).
#define RIM(d, v) ((d) > -.02 ? 1. : (v))

// One arm: overshirt sleeve rolled to the elbow, bare forearm, a hand that travels over
// the keys and three fingers that tap them.
void coderArm(inout float col, vec2 q, vec2 c, vec2 sh, float ph, float t) {
  vec2 wr = vec2(.14 + .05 * sin(t * 1.1 + ph), -.1 + .01 * sin(t * 12. + ph));
  vec2 el = sh + vec2(.27, -.4);
  PART(cap(q, sh, el, .095), ink(2., 1., c))
  PART(length(q - el) - .1, 1.) // the rolled cuff
  float fo = cap(q, el + vec2(.06, .01), wr, .058);
  PART(fo, RIM(fo, 0.))
  float hd = length(q - wr - vec2(.05, -.005)) - .062;
  PART(hd, RIM(hd, 0.))
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float tap = step(.3, sin(t * 14. + fi * 2.1 + ph * 3.)) * .022;
    FLAT(cap(q, wr + vec2(.06 + fi * .03, -.03), vec2(wr.x + .1 + fi * .035, -.168 + tap), .017), 1.)
  }
}

// The scene, about 2.7 wide and 2.4 tall around the origin, drawn after my portrait:
// short dark curly hair, a short beard, a broad build, a dark overshirt with rolled
// sleeves open over a black T-shirt, light trousers. I sit on an office chair on the
// left, facing right, typing; on the desk a keyboard, a monitor turned towards me with
// code typing itself, and a steaming mug; above it a shelf of books with my camera on
// it, as in the portrait; a ukulele stands on the floor behind the chair. My head nods
// and a foot taps to a beat.
float figCoder(vec2 q, vec2 c, float t) {
  float col = 0.;
  float beat = t * 4.;
  FLAT(box(q, vec2(0., -1.075), vec2(1.75, .008)), 1.) // floor

  // Ukulele on its stand, behind the chair.
  vec2 u = vec2(-1.55, -.84);
  PART(min(length(q - u) - .13, length(q - u - vec2(0., .17)) - .1), 1.)
  if (length(q - u - vec2(0., .06)) < .04) col = 0.;
  PART(cap(q, u + vec2(0., .25), u + vec2(0., .6), .024), 1.)
  PART(box(q, u + vec2(0., .67), vec2(.045, .05)), ink(2., 1., c))
  FLAT(box(q, u + vec2(0., -.19), vec2(.14, .012)), 1.)

  // Shelf of books, one leaning, and the camera.
  FLAT(box(q, vec2(.9, .93), vec2(.52, .014)), 1.)
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    float h = .13 + .1 * hash(fi * 5.3 + 1.);
    float w = .028 + .018 * hash(fi * 2.1);
    float d = box(q, vec2(.44 + fi * .085, .945 + h), vec2(w, h));
    float pat = mod(fi, 4.);
    FLAT(d - .004, d > -.014 ? 1. : pat < .5 ? 1. : pat < 1.5 ? 0. : pat < 2.5 ? ink(4., 1., c) : ink(2., 1., c))
  }
  FLAT(cap(q, vec2(1.12, .97), vec2(1.18, 1.2), .028), 1.)
  vec2 k = vec2(1.31, 1.005);
  FLAT(min(box(q, k, vec2(.09, .06)), box(q, k + vec2(-.035, .07), vec2(.03, .012))), 1.)
  float lens = length(q - k - vec2(.012, 0.)) - .042;
  if (lens < 0.) col = lens > -.013 ? 0. : 1.;

  // Chair.
  PART(cap(q, vec2(-1.1, -.42), vec2(-1.2, .3), .04), 1.)
  PART(box(q, vec2(-.78, -.57), vec2(.32, .035)), 1.)
  FLAT(box(q, vec2(-.78, -.79), vec2(.025, .2)), 1.)
  FLAT(box(q, vec2(-.78, -.99), vec2(.3, .022)), 1.)
  FLAT(length(q - vec2(-1.05, -1.025)) - .045, 1.)
  FLAT(length(q - vec2(-.51, -1.025)) - .045, 1.)

  // Desk, and what stands on it.
  PART(box(q, vec2(.78, -.24), vec2(.72, .025)), 1.)
  PART(box(q, vec2(1.38, -.66), vec2(.03, .4)), 1.)
  FLAT(box(q, vec2(.3, -.195), vec2(.2, .018)), ink(2., 1., c)) // keyboard
  FLAT(box(q, vec2(.98, -.2), vec2(.16, .015)), 1.) // monitor: foot, neck, screen
  FLAT(box(q, vec2(.98, -.1), vec2(.03, .1)), 1.)
  vec2 m = q - vec2(.95, .36);
  m.y -= .2 * m.x; // turned towards me
  float fr = box(m, vec2(0.), vec2(.33, .3));
  PART(fr, fr > -.035 ? 1. : codeInk(m * vec2(2., 1.4), c, t))
  vec2 g = vec2(.68, -.135); // mug with steam
  FLAT(abs(length(q - g - vec2(.08, 0.)) - .045) - .014, 1.)
  float mug = box(q, g, vec2(.06, .08));
  FLAT(mug, RIM(mug, ink(3., 1., c)))
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float y = q.y - (g.y + .1);
    float sx = g.x + (fi - .5) * .06 + .02 * sin(y * 16. - t * 2. + fi * 2.);
    if (y > 0. && y < .26 && abs(q.x - sx) < .01 && bayer4(c) < 1. - y / .26) col = 1.;
  }

  // Me. Far arm first, then legs, torso, head, near arm.
  vec2 hip = vec2(-.82, -.4);
  vec2 sh = vec2(-.72, .27 + .012 * sin(beat));
  vec2 knee = vec2(-.2, -.43);
  vec2 ankle = vec2(-.14, -.9);
  coderArm(col, q, c, sh + vec2(.08, -.02), 1.7, t);
  // Light trousers, dark shoe (the foot taps).
  float th = cap(q, hip, knee, .125);
  PART(th, RIM(th, ink(6., 1., c)))
  float shin = cap(q, knee + vec2(.02, -.06), ankle, .095);
  PART(shin, RIM(shin, ink(6., 1., c)))
  PART(cap(q, ankle + vec2(0., -.11), ankle + vec2(.24, -.11 + .035 * max(0., sin(beat))), .052), 1.)
  // Broad torso: overshirt, open at the front over the black T-shirt.
  float torso = min(cap(q, hip + vec2(-.02, .1), sh + vec2(-.03, -.14), .22), length(q - vec2(-.68, -.16)) - .23);
  PART(torso, q.x > -.66 + .12 * q.y ? 1. : ink(2., 1., c))
  // Neck and head: face with nose, beard, eye and brow, ear, curly hair.
  vec2 hd = sh + vec2(.11 + .01 * sin(beat), .4);
  float nk = cap(q, sh + vec2(.03, .1), hd, .085);
  PART(nk, RIM(nk, 0.))
  vec2 e = (q - hd) / 1.3; // head-local, so the head can be sized in one place
  float dh = length(e) - .15;
  float face = min(dh, length(e - vec2(.148, -.02)) - .036);
  PART(face, RIM(face, e.y < -.045 + .15 * e.x ? ink(2., 1., c) : 0.))
  if (box(e, vec2(.105, -.08), vec2(.03, .007)) < 0.) col = 0.; // mouth
  if (length(e - vec2(.085, .02)) < .016) col = 1.;
  FLAT(box(e, vec2(.085, .056), vec2(.036, .009)), 1.)
  float ear = length(e - vec2(-.03, -.012)) - .032;
  FLAT(ear, RIM(ear * 1.6, 0.))
  float hair = dh < 0. && dot(e, vec2(-.5, .87)) > .07 ? -1. : 1.;
  for (int i = 0; i < 7; i++) {
    float an = 1.05 + float(i) * .4;
    hair = min(hair, length(e - .128 * vec2(cos(an), sin(an))) - .055);
  }
  PART(hair, 1.)
  coderArm(col, q, c, sh, 0., t);
  return col;
}

// Focus (Home hero, "I bring it into focus"): the coder scene, placed for the box (lower
// right on a wide one, where the quote is on the left; along the bottom of a tall one),
// gathering out of cells scattered all over the screen while it builds up.
float figFocus(vec2 p, vec2 c, float t) {
  vec2 bx = uRes / (.46 * min(uRes.x, uRes.y));
  bool wide = bx.x > bx.y * 1.2;
  vec2 q = (p - (wide ? vec2(bx.x * .222, -.32) : vec2(-.13, -bx.y * .265))) * (wide ? 1.5 : 1.3);
  float blur = 1. - uReveal;
  q += (vec2(hash(dot(c, vec2(1., 57.))), hash(dot(c, vec2(113., 7.)) + 3.)) - .5) * blur * blur * bx * 1.1;
  return figCoder(q, c, t);
}

// Video (Home hero, when a clip is present): real footage, dithered live. The frame sits
// in the lower right of a wide box (the quote is on the left) or along the bottom of a
// tall one; light areas drop out to the page, dark ones become ink through the Bayer
// matrix, sharp changes of brightness are inked as outlines, and the frame's top and
// sides fade out so it has no hard border. Like the focus figure,
// it gathers out of cells scattered over the screen while it builds up.
float figVideo(vec2 p, vec2 c, float t) {
  vec2 bx = uRes / (.46 * min(uRes.x, uRes.y));
  float asp = uVideoSize.x / uVideoSize.y;
  bool wide = bx.x > bx.y * 1.2;
  // As tall as fits beside the quote on a wide box; the full width of a tall one (the
  // text above it sits on plates).
  float w = wide ? min(bx.x * .56, bx.y * .82 * asp) : bx.x;
  vec2 size = vec2(w, w / asp);
  vec2 ctr = vec2(wide ? .5 * (bx.x - size.x) : 0., .5 * (size.y - bx.y));
  vec2 uv = (p - ctr) / size + .5;
  float blur = 1. - uReveal;
  uv += (vec2(hash(dot(c, vec2(1., 57.))), hash(dot(c, vec2(113., 7.)) + 3.)) - .5) * blur * blur * 1.6;
  if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) return 0.;
  float lum = texture2D(uVideo, uv).g;
  // Outlines: where brightness changes sharply (a pale shirt against a pale wall, folds,
  // fingers) the cell is inked too, so light things keep their shape.
  vec2 px = 1.5 / uVideoSize;
  float grad = length(vec2(
    texture2D(uVideo, uv + vec2(px.x, 0.)).g - texture2D(uVideo, uv - vec2(px.x, 0.)).g,
    texture2D(uVideo, uv + vec2(0., px.y)).g - texture2D(uVideo, uv - vec2(0., px.y)).g));
  float dark = max(1. - smoothstep(.1, .8, lum), smoothstep(.05, .13, grad));
  // Fade out at the top, and at the sides too unless the frame spans the whole box.
  float edge = smoothstep(0., .12, 1. - uv.y);
  if (wide) edge *= smoothstep(0., .1, uv.x) * smoothstep(0., .1, 1. - uv.x);
  return step(bayer4(c) + .03, dark * edge);
}

float fig(float id, vec2 p, vec2 c, float t) {
  return id < .5 ? figWeb(p, c, t) : id < 1.5 ? figAi(p, c, t) : id < 2.5 ? figAuto(p, c, t) : id < 3.5 ? figData(p, c, t)
    : id < 4.5 ? figHero(p, c, t) : id < 5.5 ? figWaves(p, c, t) : id < 6.5 ? figRings(p, c, t) : id < 7.5 ? figTubes(p, c, t) : id < 8.5 ? figFocus(p, c, t) : figVideo(p, c, t);
}

void main() {
  vec2 c = floor(gl_FragCoord.xy);
  vec2 p = (c + .5 - .5 * uRes) / (.46 * min(uRes.x, uRes.y));
  // Ripple (xy = centre, z = age in seconds, negative = none): a ring spreads from the
  // point, pushing the forms about as it passes and inverting the ink on its front.
  float ring = 0.;
  if (uRipple.z >= 0.) {
    vec2 d = p - uRipple.xy;
    float r = length(d) + .0001;
    float front = uRipple.z * 1.5;
    float fade = exp(-uRipple.z * 1.1);
    p += d / r * sin((r - front) * 16.) * .07 * fade * smoothstep(.45, 0., abs(r - front));
    ring = step(abs(r - front), .03) * step(bayer4(c) + .03, fade);
  }
  // Dissolve between two figures: each cell switches over at its Bayer threshold.
  float col = fig(uMix > bayer4(c + 2.) ? uFigB : uFig, p, c, uT);
  col = mix(col, 1. - col, ring);
  // Build-up: rises from the bottom, each cell switching on at its Bayer threshold.
  col *= step(bayer4(c) + .03, clamp(uReveal * 2. - c.y / uRes.y, 0., 1.));
  gl_FragColor = vec4(0., 0., 0., col);
}
`;

type Figure = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  index: number;
  /** Cells along the short side (data-figure-cells, default CELLS). */
  cells: number;
  cols: number;
  rows: number;
  time: number;
  /** Figures it cycles through (shader indices); one entry = no cycling. */
  cycle: number[];
  /** Latest ripple: centre in figure space and the figure time it started (-1 = none). */
  ripple: { x: number; y: number; at: number };
  /** Frame timestamp of the first time it was on screen (-1 = not yet); starts the build-up. */
  shownAt: number;
  /** 0..1 build-up; 1 = whole figure. */
  reveal: number;
  /** What was last drawn, to skip identical frames. */
  drawn: string;
  visible: boolean;
  /** Footage to dither instead of the drawn figure, once it has a frame (data-figure-video). */
  video?: HTMLVideoElement;
};

export function initFigures(canvases: HTMLCanvasElement[]) {
  const glCanvas = document.createElement("canvas");
  const gl = glCanvas.getContext("webgl", { antialias: false, depth: false, stencil: false });
  if (!gl) return;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const attr = gl.getAttribLocation(program, "a");
  gl.enableVertexAttribArray(attr);
  gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(program, "uRes");
  const uT = gl.getUniformLocation(program, "uT");
  const uFig = gl.getUniformLocation(program, "uFig");
  const uReveal = gl.getUniformLocation(program, "uReveal");
  const uFigB = gl.getUniformLocation(program, "uFigB");
  const uMix = gl.getUniformLocation(program, "uMix");
  const uRipple = gl.getUniformLocation(program, "uRipple");
  const uVideoSize = gl.getUniformLocation(program, "uVideoSize");
  const VIDEO = FIGURES.indexOf("video");
  // One texture for the footage (only one figure uses it); not a power of two, so clamp and no mipmaps.
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frozen = new URLSearchParams(location.search).get("t");
  const still = reduced || frozen !== null;
  const startTime = frozen !== null ? Number(frozen) || 0 : 8;

  const figures: Figure[] = [];
  for (const canvas of canvases) {
    const index = (FIGURES as readonly string[]).indexOf(canvas.dataset.figure ?? "");
    const ctx = canvas.getContext("2d");
    if (index < 0 || !ctx) continue;
    // data-figure-cycle="waves,…": further figures it dissolves to, in turn.
    const cycle = [index, ...(canvas.dataset.figureCycle ?? "").split(",").map((id) => (FIGURES as readonly string[]).indexOf(id))].filter((i) => i >= 0);
    figures.push({ canvas, ctx, index, cells: Number(canvas.dataset.figureCells) || CELLS, cols: 0, rows: 0, time: startTime, cycle, ripple: { x: 0, y: 0, at: -1 }, shownAt: -1, reveal: still ? 1 : 0, drawn: "", visible: false });
  }
  if (!figures.length) return;

  const draw = (f: Figure) => {
    if (!f.cols || !f.rows) return;
    gl.viewport(0, 0, f.cols, f.rows);
    gl.uniform2f(uRes, f.cols, f.rows);
    const t = Math.floor(f.time * FPS) / FPS;
    // Cycling: hold a figure for HOLD seconds, then dissolve to the next over FADE.
    // (A frozen `?t=` counts from 8 like a live page, so a dissolve can be inspected.)
    const turn = Math.max(0, t - (frozen !== null ? 8 : startTime)) / (HOLD + FADE);
    const k = reduced ? 0 : Math.floor(turn);
    const mix = reduced ? 0 : Math.max(0, ((turn - k) * (HOLD + FADE) - HOLD) / FADE);
    const age = f.ripple.at < 0 ? -1 : t - f.ripple.at;
    gl.uniform1f(uT, t);
    // Footage, once it has a frame, replaces the drawn figure (which stays as the fallback).
    const filmed = f.video && f.video.readyState >= 2 && f.video.videoWidth > 0;
    // While the clip is still loading, draw nothing, so the drawn figure does not flash first.
    if (f.video && !filmed && !f.video.error) return;
    if (filmed && f.video) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, f.video);
      gl.uniform2f(uVideoSize, f.video.videoWidth, f.video.videoHeight);
    }
    gl.uniform1f(uFig, filmed ? VIDEO : f.cycle[k % f.cycle.length]);
    gl.uniform1f(uFigB, f.cycle[(k + 1) % f.cycle.length]);
    gl.uniform1f(uMix, filmed ? 0 : mix);
    gl.uniform3f(uRipple, f.ripple.x, f.ripple.y, age >= 0 && age < RIPPLE ? age : -1);
    gl.uniform1f(uReveal, f.reveal);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // Copy the alpha mask, then flood it with the canvas's CSS colour.
    f.ctx.globalCompositeOperation = "copy";
    f.ctx.drawImage(glCanvas, 0, glCanvas.height - f.rows, f.cols, f.rows, 0, 0, f.cols, f.rows);
    f.ctx.globalCompositeOperation = "source-in";
    f.ctx.fillStyle = getComputedStyle(f.canvas).color;
    f.ctx.fillRect(0, 0, f.cols, f.rows);
    f.canvas.dataset.ready = "";
  };

  /** Size a figure's grid to its box: square cells of a whole number of device pixels. */
  const fit = (f: Figure) => {
    const host = f.canvas.parentElement;
    if (!host) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(host.clientWidth * dpr);
    const h = Math.floor(host.clientHeight * dpr);
    if (w < 8 || h < 8) return;
    // At least 3 CSS px per cell, so small boxes (card bands) keep visible pixels; a figure
    // that asks for a finer grain than the default (the hero footage) may go down to 2.
    const cell = Math.max(1, Math.round((f.cells > CELLS ? 2 : 3) * dpr), Math.round(Math.min(w, h) / f.cells));
    f.cols = Math.floor(w / cell);
    f.rows = Math.floor(h / cell);
    f.canvas.width = f.cols;
    f.canvas.height = f.rows;
    const style = f.canvas.style;
    style.width = `${(f.cols * cell) / dpr}px`;
    style.height = `${(f.rows * cell) / dpr}px`;
    style.left = `${Math.floor((w - f.cols * cell) / 2) / dpr}px`;
    style.top = `${Math.floor((h - f.rows * cell) / 2) / dpr}px`;
    glCanvas.width = Math.max(glCanvas.width, f.cols);
    glCanvas.height = Math.max(glCanvas.height, f.rows);
  };
  const fitAll = () => {
    figures.forEach(fit);
    figures.forEach(draw);
  };

  const resize = new ResizeObserver(fitAll);
  const seen = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const figure = figures.find((f) => f.canvas === entry.target);
      if (!figure) continue;
      figure.visible = entry.isIntersecting;
      // Footage plays only while it is on screen (and never with reduced motion).
      if (figure.video && !still) {
        if (entry.isIntersecting) figure.video.play().catch(() => {});
        else figure.video.pause();
      }
      // Replaying figures (the phone menu) build up again each time they come back.
      if (!entry.isIntersecting && !still && "figureReplay" in figure.canvas.dataset) {
        figure.shownAt = -1;
        figure.reveal = 0;
        figure.drawn = "";
        figure.ctx.clearRect(0, 0, figure.cols, figure.rows);
      }
    }
  });
  for (const f of figures) {
    if (f.canvas.parentElement) resize.observe(f.canvas.parentElement);
    seen.observe(f.canvas);
    // data-figure-video="<url>": muted, looping footage to dither. Still frames redraw when it arrives.
    const src = f.canvas.dataset.figureVideo;
    if (src) {
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      // The build-up starts when the clip (or, if it fails, the drawn fallback) can be shown.
      const arrived = () => {
        f.shownAt = -1;
        f.drawn = "";
        requestAnimationFrame(() => draw(f));
      };
      video.addEventListener("loadeddata", arrived);
      video.addEventListener("error", arrived);
      video.src = src;
      video.load();
      f.video = video;
    }
    // Still frames (reduced motion) are not redrawn on their own: redraw when the host's
    // hover or focus may have changed the ink colour.
    const host = f.canvas.closest<HTMLElement>("[data-figure-host]");
    if (host && still) {
      const redraw = () => requestAnimationFrame(() => draw(f));
      for (const type of ["pointerenter", "pointerleave", "focusin", "focusout"]) host.addEventListener(type, redraw);
    }
    // data-figure-ripple: a click or tap on the figure's box starts a ripple there.
    const box = f.canvas.parentElement;
    if (box && !still && "figureRipple" in f.canvas.dataset) {
      box.addEventListener("pointerdown", (event) => {
        const rect = f.canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const cx = ((event.clientX - rect.left) / rect.width) * f.cols;
        const cy = (1 - (event.clientY - rect.top) / rect.height) * f.rows;
        const unit = 0.46 * Math.min(f.cols, f.rows);
        f.ripple = { x: (cx - f.cols / 2) / unit, y: (cy - f.rows / 2) / unit, at: Math.floor(f.time * FPS) / FPS };
      });
    }
  }
  window.addEventListener("resize", fitAll);
  fitAll();
  if (still) return;

  let last = performance.now();
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    const dt = Math.min(now - last, 250) / 1000;
    last = now;
    for (const f of figures) {
      f.time += dt;
      if (!f.visible) continue;
      // The build-up starts the first time the figure is on screen, then runs on the clock.
      if (f.shownAt < 0) f.shownAt = now;
      f.reveal = Math.min(1, (now - f.shownAt) / 1000 / BUILD);
      const state = `${Math.floor(f.time * FPS)}|${f.reveal.toFixed(2)}|${f.cols}x${f.rows}`;
      if (state === f.drawn) continue;
      f.drawn = state;
      draw(f);
    }
  };
  requestAnimationFrame(frame);
}
