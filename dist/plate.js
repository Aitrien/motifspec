// Specimen plate and backdrop: a contour survey of simplex-noise terrain.
// The build runs contours() once (t = 0) to write the static SVG, so the plate and the backdrop are complete
// without JavaScript.
// In the browser, mount() redraws the same contours: a plate as its terrain drifts through time, a backdrop as it
// settles on arrival and as the pointer warms it. Same code, same seed, so the first animated frame matches the static
// one exactly.
(function (g) {
  'use strict';

  // ------------------------------------------------------------ seeded 3D simplex noise (after Gustavson)
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var GRAD = [1,1,0, -1,1,0, 1,-1,0, -1,-1,0, 1,0,1, -1,0,1, 1,0,-1, -1,0,-1, 0,1,1, 0,-1,1, 0,1,-1, 0,-1,-1];
  var F3 = 1 / 3, G3 = 1 / 6;
  function simplex(seed) {
    var r = rng(seed), p = new Uint8Array(256), perm = new Uint8Array(512), pm = new Uint8Array(512), i;
    for (i = 0; i < 256; i++) p[i] = i;
    for (i = 255; i > 0; i--) { var k = Math.floor(r() * (i + 1)), s = p[i]; p[i] = p[k]; p[k] = s; }
    for (i = 0; i < 512; i++) { perm[i] = p[i & 255]; pm[i] = (perm[i] % 12) * 3; }
    return function (x, y, z) {
      var s = (x + y + z) * F3, i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
      var t = (i + j + k) * G3, x0 = x - i + t, y0 = y - j + t, z0 = z - k + t;
      var i1, j1, k1, i2, j2, k2;
      if (x0 >= y0) {
        if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
        else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
      } else {
        if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
        else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
        else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      }
      var x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
      var x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
      var x3 = x0 - 1 + 0.5, y3 = y0 - 1 + 0.5, z3 = z0 - 1 + 0.5;
      var ii = i & 255, jj = j & 255, kk = k & 255, n = 0, tt, gi;
      tt = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (tt > 0) { gi = pm[ii + perm[jj + perm[kk]]]; tt *= tt; n += tt * tt * (GRAD[gi] * x0 + GRAD[gi + 1] * y0 + GRAD[gi + 2] * z0); }
      tt = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (tt > 0) { gi = pm[ii + i1 + perm[jj + j1 + perm[kk + k1]]]; tt *= tt; n += tt * tt * (GRAD[gi] * x1 + GRAD[gi + 1] * y1 + GRAD[gi + 2] * z1); }
      tt = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (tt > 0) { gi = pm[ii + i2 + perm[jj + j2 + perm[kk + k2]]]; tt *= tt; n += tt * tt * (GRAD[gi] * x2 + GRAD[gi + 1] * y2 + GRAD[gi + 2] * z2); }
      tt = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (tt > 0) { gi = pm[ii + 1 + perm[jj + 1 + perm[kk + 1]]]; tt *= tt; n += tt * tt * (GRAD[gi] * x3 + GRAD[gi + 1] * y3 + GRAD[gi + 2] * z3); }
      return 32 * n; // about -1..1
    };
  }

  // ------------------------------------------------------------ the survey
  var DEFAULTS = {
    seed: 3,        // which terrain
    size: 240,      // viewBox units
    cells: 32,      // marching-squares grid per side
    scale: 1.4,     // noise features across the plate
    octaves: 2,
    massif: 1.1,    // how strongly the terrain rises toward the centre
    levels: 14,     // contour lines
    index: 5,       // every nth line is an index contour
    bump: 0.045     // radius of a hill the pointer warms, in survey widths
  };

  function survey(opts) {
    var o = {}, k;
    for (k in DEFAULTS) o[k] = opts && opts[k] != null ? opts[k] : DEFAULTS[k];
    var noise = simplex(o.seed), N = o.cells, S = o.size, cell = S / N;
    var lo = -0.45, hi = 1.75, step = (hi - lo) / (o.levels + 1);
    var levels = [];
    for (k = 1; k <= o.levels; k++) levels.push(lo + k * step);
    var h = new Float32Array((N + 1) * (N + 1));

    // bumps: soft hills added to the terrain, [{ x, y, a }] in survey widths (0 to 1), each a Gaussian of radius o.bump.
    function height(t, bumps) {
      var nb = bumps ? bumps.length : 0, r2 = o.bump * o.bump;
      for (var j = 0; j <= N; j++) for (var i = 0; i <= N; i++) {
        var x = i / N, y = j / N, f = o.scale, a = 1, v = 0, norm = 0;
        for (var oc = 0; oc < o.octaves; oc++) { v += a * noise(x * f, y * f, t + oc * 13.7); norm += a; a *= 0.35; f *= 2.3; }
        var dx = x - 0.5, dy = y - 0.5, r = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 0.62);
        var add = 0;
        for (var b = 0; b < nb; b++) { var bx = x - bumps[b].x, by = y - bumps[b].y; add += bumps[b].a * Math.exp(-(bx * bx + by * by) / r2); }
        h[j * (N + 1) + i] = v / norm + o.massif * (1 - r * r) + add;
      }
    }

    // Marching squares for one level. Points sit on cell edges and are numbered by edge, so neighbouring cells
    // share them exactly. Horizontal edges come first (N per row, N + 1 rows), then vertical ones.
    var E = 2 * N * (N + 1), px = new Float32Array(E), py = new Float32Array(E), lk = new Int32Array(2 * E), stamp = new Int32Array(E), pass = 0;
    function trace(level) {
      pass++;
      var touched = [];
      function pt(i, j, vert) {
        var id = vert ? N * (N + 1) + j * (N + 1) + i : j * N + i;
        if (stamp[id] !== pass) {
          stamp[id] = pass; lk[2 * id] = -1; lk[2 * id + 1] = -1; touched.push(id);
          var a = h[j * (N + 1) + i], b = vert ? h[(j + 1) * (N + 1) + i] : h[j * (N + 1) + i + 1], u = (level - a) / (b - a);
          px[id] = vert ? i * cell : (i + u) * cell; py[id] = vert ? (j + u) * cell : j * cell;
        }
        return id;
      }
      function link(a, b) { lk[2 * a + (lk[2 * a] === -1 ? 0 : 1)] = b; lk[2 * b + (lk[2 * b] === -1 ? 0 : 1)] = a; }
      for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
        var tl = h[j * (N + 1) + i], tr = h[j * (N + 1) + i + 1], br = h[(j + 1) * (N + 1) + i + 1], bl = h[(j + 1) * (N + 1) + i];
        var c = (tl > level ? 8 : 0) | (tr > level ? 4 : 0) | (br > level ? 2 : 0) | (bl > level ? 1 : 0);
        if (c === 0 || c === 15) continue;
        var centre = (tl + tr + br + bl) / 4 > level;
        switch (c) {
          case 1: case 14: link(pt(i, j, 1), pt(i, j + 1, 0)); break;
          case 2: case 13: link(pt(i, j + 1, 0), pt(i + 1, j, 1)); break;
          case 3: case 12: link(pt(i, j, 1), pt(i + 1, j, 1)); break;
          case 4: case 11: link(pt(i, j, 0), pt(i + 1, j, 1)); break;
          case 6: case 9: link(pt(i, j, 0), pt(i, j + 1, 0)); break;
          case 7: case 8: link(pt(i, j, 1), pt(i, j, 0)); break;
          case 5:
            if (centre) { link(pt(i, j, 1), pt(i, j, 0)); link(pt(i, j + 1, 0), pt(i + 1, j, 1)); }
            else { link(pt(i, j, 1), pt(i, j + 1, 0)); link(pt(i, j, 0), pt(i + 1, j, 1)); }
            break;
          case 10:
            if (centre) { link(pt(i, j, 0), pt(i + 1, j, 1)); link(pt(i, j, 1), pt(i, j + 1, 0)); }
            else { link(pt(i, j, 1), pt(i, j, 0)); link(pt(i, j + 1, 0), pt(i + 1, j, 1)); }
            break;
        }
      }
      // Chain the segments into lines: open lines start at an end (one link), then whatever is left is a loop.
      var lines = [], seen = pass * 2; // reuse stamp: a point is used once stamp[id] === -seen
      function walk(start) {
        var pts = [], prev = -1, cur = start;
        while (cur !== -1 && stamp[cur] !== -seen) {
          stamp[cur] = -seen; pts.push(px[cur], py[cur]);
          var n0 = lk[2 * cur], n1 = lk[2 * cur + 1], next = n0 !== prev && n0 !== -1 && stamp[n0] !== -seen ? n0 : n1 !== prev && n1 !== -1 && stamp[n1] !== -seen ? n1 : -1;
          prev = cur; cur = next;
        }
        var closed = lk[2 * prev] === start || lk[2 * prev + 1] === start;
        return { pts: pts, closed: closed && pts.length > 4 };
      }
      var k, id;
      for (k = 0; k < touched.length; k++) { id = touched[k]; if (stamp[id] === pass && lk[2 * id + 1] === -1) lines.push(walk(id)); }
      for (k = 0; k < touched.length; k++) { id = touched[k]; if (stamp[id] === pass) lines.push(walk(id)); }
      return lines;
    }

    // Clean each traced line before drawing it. Marching squares puts two points almost on top of each other
    // wherever a contour passes close to a grid corner; merging them removes the burrs that flicker as the
    // terrain moves. Loops smaller than two cells, and edge stubs shorter than that, pop in and out, so they are dropped.
    var minGap = cell * 0.4, minLoop = cell * 2;
    function clean(ln) {
      var p = ln.pts, n = p.length / 2, q = [p[0], p[1]], k, dx, dy;
      for (k = 1; k < n; k++) {
        dx = p[2 * k] - q[q.length - 2]; dy = p[2 * k + 1] - q[q.length - 1];
        if (dx * dx + dy * dy >= minGap * minGap) q.push(p[2 * k], p[2 * k + 1]);
        else if (!ln.closed && k === n - 1) { q[q.length - 2] = p[2 * k]; q[q.length - 1] = p[2 * k + 1]; } // keep the true end on the edge
      }
      if (ln.closed) {
        dx = q[0] - q[q.length - 2]; dy = q[1] - q[q.length - 1];
        if (q.length > 2 && dx * dx + dy * dy < minGap * minGap) q.length -= 2;
        var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (k = 0; k < q.length; k += 2) { x0 = Math.min(x0, q[k]); x1 = Math.max(x1, q[k]); y0 = Math.min(y0, q[k + 1]); y1 = Math.max(y1, q[k + 1]); }
        if (q.length < 8 || Math.max(x1 - x0, y1 - y0) < minLoop) return null;
      }
      if (!ln.closed) { // stubs clipped by the plate's edge flicker the same way
        var len = 0;
        for (k = 2; k < q.length; k += 2) len += Math.sqrt((q[k] - q[k - 2]) * (q[k] - q[k - 2]) + (q[k + 1] - q[k - 1]) * (q[k + 1] - q[k - 1]));
        if (len < minLoop) return null;
      }
      return q.length >= 4 ? { pts: q, closed: ln.closed } : null;
    }

    // Centripetal Catmull-Rom through the points (alpha 0.5), written as cubic Béziers rounded to 0.1 units.
    // Unlike the uniform form, it never overshoots into a cusp or a loop when neighbouring points are unevenly spaced.
    function r1(n) { return Math.round(n * 10) / 10; }
    function path(lines) {
      var d = [];
      for (var l = 0; l < lines.length; l++) {
        var ln = clean(lines[l]);
        if (!ln) continue;
        var p = ln.pts, n = p.length / 2, closed = ln.closed;
        d.push('M', r1(p[0]), ' ', r1(p[1]));
        var segs = closed ? n : n - 1;
        for (var k = 0; k < segs; k++) {
          var a = k === 0 ? (closed ? n - 1 : 0) : k - 1, b = k, c = k + 1 < n ? k + 1 : (closed ? 0 : n - 1), e = k + 2 < n ? k + 2 : (closed ? k + 2 - n : n - 1);
          a *= 2; b *= 2; c *= 2; e *= 2;
          var d1 = Math.pow((p[b] - p[a]) * (p[b] - p[a]) + (p[b + 1] - p[a + 1]) * (p[b + 1] - p[a + 1]), 0.25);
          var d2 = Math.pow((p[c] - p[b]) * (p[c] - p[b]) + (p[c + 1] - p[b + 1]) * (p[c + 1] - p[b + 1]), 0.25);
          var d3 = Math.pow((p[e] - p[c]) * (p[e] - p[c]) + (p[e + 1] - p[c + 1]) * (p[e + 1] - p[c + 1]), 0.25);
          var c1x, c1y, c2x, c2y;
          if (d1 < 1e-6) { c1x = p[b] + (p[c] - p[b]) / 3; c1y = p[b + 1] + (p[c + 1] - p[b + 1]) / 3; }
          else {
            var m1 = 3 * d1 * (d1 + d2), w1 = 2 * d1 * d1 + 3 * d1 * d2 + d2 * d2;
            c1x = (d1 * d1 * p[c] - d2 * d2 * p[a] + w1 * p[b]) / m1; c1y = (d1 * d1 * p[c + 1] - d2 * d2 * p[a + 1] + w1 * p[b + 1]) / m1;
          }
          if (d3 < 1e-6) { c2x = p[c] + (p[b] - p[c]) / 3; c2y = p[c + 1] + (p[b + 1] - p[c + 1]) / 3; }
          else {
            var m2 = 3 * d3 * (d3 + d2), w2 = 2 * d3 * d3 + 3 * d3 * d2 + d2 * d2;
            c2x = (d3 * d3 * p[b] - d2 * d2 * p[e] + w2 * p[c]) / m2; c2y = (d3 * d3 * p[b + 1] - d2 * d2 * p[e + 1] + w2 * p[c + 1]) / m2;
          }
          d.push('C', r1(c1x), ' ', r1(c1y), ' ', r1(c2x), ' ', r1(c2y), ' ', r1(p[c]), ' ', r1(p[c + 1]));
        }
        if (closed) d.push('Z');
      }
      return d.join('');
    }

    return {
      options: o,
      levels: levels,
      // Path data for every level at time t (in noise units), with any bumps added.
      contours: function (t, bumps) {
        height(t || 0, bumps);
        return levels.map(function (lv, i) { return { level: i + 1, index: (i + 1) % o.index === 0, d: path(trace(lv)) }; });
      }
    };
  }

  // ------------------------------------------------------------ static markup (used by the build)
  // kind 'head' or 'foot' draws the same survey full-bleed behind a page (docs/components/backdrop.md): sliced to cover
  // its layer instead of fitted into the plate's square, on a finer grid so a warmed hill is round.
  var BACKDROP = { head: { seed: 3, cells: 48 }, foot: { seed: 7, cells: 48 } };
  function markup(opts, kind) {
    var bg = kind === 'head' || kind === 'foot';
    if (bg) { opts = opts || {}; for (var key in BACKDROP[kind]) if (opts[key] == null) opts[key] = BACKDROP[kind][key]; }
    var s = survey(opts), S = s.options.size, q = S / 4;
    var grid = [q, 2 * q, 3 * q].map(function (v) { return 'M' + v + ' 0V' + S + 'M0 ' + v + 'H' + S; }).join('');
    var paths = s.contours(0).map(function (c, i) {
      return '<path class="cx-plate__line' + (c.index ? ' cx-plate__line--index' : '') + '" style="--i: ' + i + '" pathLength="1" d="' + c.d + '"></path>';
    }).join('');
    return '<div class="' + (bg ? 'cx-backdrop cx-backdrop--' + kind : 'cx-plate') + '" aria-hidden="true" data-plate-seed="' + s.options.seed + '"' + (bg ? ' data-plate-cells="' + s.options.cells + '"' : '') + '>' +
      '<svg class="cx-plate__map" viewBox="0 0 ' + S + ' ' + S + '"' + (bg ? ' preserveAspectRatio="xMidYMid slice"' : '') + ' focusable="false">' +
      '<path class="cx-plate__grid" d="' + grid + '"></path>' + paths + '</svg></div>';
  }
  function backdrop(kind, opts) { return markup(opts, kind || 'head'); }

  // ------------------------------------------------------------ animation (browser only)
  function ms(win, root, name) { // durations come from the tokens, through custom properties on the element
    var v = win.getComputedStyle(root).getPropertyValue(name).trim();
    return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
  }

  // A specimen plate: its lines draw in, then the terrain drifts until it is paused, hidden or off screen.
  function mountPlate(root) {
    var doc = root.ownerDocument, win = doc.defaultView;
    var toggle = (root.closest('.cx-plate-frame') || root.parentElement).querySelector('.cx-plate__pause');
    var input = toggle && toggle.querySelector('input');
    var paths = root.querySelectorAll('.cx-plate__line');
    var reduce = win.matchMedia('(prefers-reduced-motion: reduce)');
    var drift = ms(win, root, '--cx-plate-drift'), delay = ms(win, root, '--cx-plate-draw');
    var s = survey({ seed: Number(root.getAttribute('data-plate-seed')) || DEFAULTS.seed });
    // The drift never starts at full speed: from rest its speed eases up over one draw duration, on load and again
    // after a pause, a hidden tab or scrolling back into view. Pausing still stops it at once.
    var elapsed = 0, last = null, raf = 0, frames = 0, visible = true, ready = false, warm = 0;

    function running() { return ready && visible && !doc.hidden && !reduce.matches && !(input && input.checked); }
    function tick(now) {
      raf = 0;
      if (!running()) { last = null; warm = 0; return; }
      if (last !== null) {
        var dt = Math.min(now - last, delay / 16); // a long gap (background tab) never jumps the terrain
        warm = Math.min(1, warm + dt / delay);
        elapsed += dt * warm * warm * (3 - 2 * warm); // speed follows a smoothstep from 0 to full
      }
      last = now;
      // Redraw on every second frame: the terrain moves so little per frame that this looks the same at half the cost.
      if ((frames++ & 1) === 0) s.contours(elapsed / drift).forEach(function (c, i) { paths[i].setAttribute('d', c.d); });
      raf = win.requestAnimationFrame(tick);
    }
    function update() {
      if (toggle) toggle.hidden = reduce.matches;
      if (running() && !raf) raf = win.requestAnimationFrame(tick);
    }
    if (input) input.addEventListener('change', update);
    if (reduce.addEventListener) reduce.addEventListener('change', update);
    doc.addEventListener('visibilitychange', update);
    if ('IntersectionObserver' in win) new win.IntersectionObserver(function (e) { visible = e[0].isIntersecting; update(); }).observe(root);
    win.setTimeout(function () { ready = true; update(); }, delay);
    update();
  }

  // A backdrop never drifts. The head settles into place over one settle duration on arrival (fast, then easing to a
  // stop) and stays still. While a layer is on screen, the pointer warms the ground under it into a hill of rings,
  // which rises over two-thirds of a settle, stays while the pointer rests there, and flattens over two settles once it
  // moves on. Nothing runs on its own for
  // more than five seconds, so there is no pause control; under prefers-reduced-motion none of it happens.
  var SETTLE_FROM = -0.14, HEAT_MAX = 0.95, HEAT_STEP = 0.08, HEAT_KEEP = 40, MOVE_PX = 14;
  function mountBackdrop(root) {
    var doc = root.ownerDocument, win = doc.defaultView;
    if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var svg = root.querySelector('.cx-plate__map'), paths = root.querySelectorAll('.cx-plate__line');
    var s = survey({ seed: Number(root.getAttribute('data-plate-seed')) || DEFAULTS.seed, cells: Number(root.getAttribute('data-plate-cells')) || DEFAULTS.cells });
    var settle = ms(win, root, '--cx-plate-settle'), rise = settle * 2 / 3, cool = settle * 2;
    var head = root.classList.contains('cx-backdrop--head');
    var heat = [], under = null, t0 = null, settling = head, raf = 0, last = null, visible = true, lastXY = null;

    // The survey square covers the layer (slice), so a screen point maps to survey widths through its larger side.
    function toSurvey(px, py) {
      var r = svg.getBoundingClientRect(), side = Math.max(r.width, r.height);
      return [(px - r.left - (r.width - side) / 2) / side, (py - r.top - (r.height - side) / 2) / side];
    }
    function tick(now) {
      raf = 0;
      var dt = last === null ? 0 : Math.min(now - last, settle / 16); last = now;
      var t = 0, moving = false;
      if (settling) {
        if (t0 === null) t0 = now;
        var p = Math.min(1, (now - t0) / settle);
        t = SETTLE_FROM * Math.pow(1 - p, 3); // eases out: quick on arrival, still at the end
        if (p < 1) moving = true; else settling = false;
      }
      heat.forEach(function (h) {
        if (h === under) { if (h.a < HEAT_MAX) { h.a = Math.min(HEAT_MAX, h.a + dt / rise * HEAT_MAX); moving = true; } }
        else { h.a -= dt / cool * HEAT_MAX; moving = true; }
      });
      heat = heat.filter(function (h) { return h.a > 0; });
      s.contours(t, heat).forEach(function (c, i) { paths[i].setAttribute('d', c.d); });
      if (moving) raf = win.requestAnimationFrame(tick); else last = null;
    }
    function wake() { if (!raf) raf = win.requestAnimationFrame(tick); }
    function warmAt(px, py) {
      var r = root.getBoundingClientRect();
      if (!visible || px < r.left || px > r.right || py < r.top || py > r.bottom) { under = null; return; }
      var q = toSurvey(px, py), near = null, best = s.options.bump * 0.8;
      heat.forEach(function (h) { var d = Math.hypot(h.x - q[0], h.y - q[1]); if (d < best) { best = d; near = h; } });
      if (!near) { near = { x: q[0], y: q[1], a: 0 }; heat.push(near); if (heat.length > HEAT_KEEP) heat.shift(); }
      near.a = Math.min(HEAT_MAX, near.a + HEAT_STEP);
      under = near;
      wake();
    }
    win.addEventListener('pointermove', function (e) {
      if (lastXY && Math.hypot(e.clientX - lastXY[0], e.clientY - lastXY[1]) < MOVE_PX) return;
      lastXY = [e.clientX, e.clientY]; warmAt(e.clientX, e.clientY);
    }, { passive: true });
    win.addEventListener('pointerdown', function (e) { warmAt(e.clientX, e.clientY); }, { passive: true });
    doc.documentElement.addEventListener('pointerleave', function () { under = null; wake(); });
    if ('IntersectionObserver' in win) new win.IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(root);
    if (settling) wake();
  }

  function mount(root) { if (root.classList.contains('cx-backdrop')) mountBackdrop(root); else mountPlate(root); }

  g.cxPlate = { survey: survey, markup: markup, backdrop: backdrop, mount: mount, defaults: DEFAULTS };

  // In a browser, start every plate and backdrop on the page. Without this script the static contours stay as they are.
  if (typeof document !== 'undefined' && document.querySelectorAll) {
    var start = function () { Array.prototype.forEach.call(document.querySelectorAll('.cx-plate[data-plate-seed], .cx-backdrop[data-plate-seed]'), mount); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  }
})(typeof window !== 'undefined' ? window : globalThis);
