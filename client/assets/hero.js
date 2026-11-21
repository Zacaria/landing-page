(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const canvas = hero.querySelector(".hero-map");
  const context = canvas.getContext("2d");
  const label = hero.querySelector(".hero-start");
  const rows = [...hero.querySelectorAll(".site-map li")];
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(pointer: fine)");
  let width, height, cell, cols, count, walls, start, targets, colors;
  let destination = 0,
    locked = false,
    visible = true,
    frame = 0,
    dirty = false;
  let search = [],
    path = [],
    previous = [],
    previousAt = 0,
    began = 0,
    cycle = 0;
  let pointer = null,
    pointerAt = -Infinity,
    entrance = performance.now();
  // Idle wanderer: each search starts from another corner of the text, so
  // the route visibly winds around the headline.
  let anchors = [],
    turn = 0;
  function wander() {
    turn = (turn + 1) % anchors.length;
    return anchors[turn];
  }
  const xy = (id) => [id % cols, Math.floor(id / cols)];
  const point = (id) => {
    const [x, y] = xy(id);
    return [x * cell + cell / 2, y * cell + cell / 2];
  };
  const indexAt = (x, y) =>
    Math.max(0, Math.min(Math.ceil(height / cell) - 1, Math.floor(y / cell))) *
      cols +
    Math.max(0, Math.min(cols - 1, Math.floor(x / cell)));
  function nearest(id) {
    if (!walls[id]) return id;
    const [x, y] = xy(id);
    for (let r = 1; r < Math.max(cols, Math.ceil(height / cell)); r++) {
      let best = -1,
        distance = Infinity;
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          const nx = x + dx,
            ny = y + dy,
            n = ny * cols + nx;
          if (nx < 0 || nx >= cols || ny < 0 || n >= count || walls[n])
            continue;
          const d = dx * dx + dy * dy;
          if (d < distance) {
            best = n;
            distance = d;
          }
        }
      if (best !== -1) return best;
    }
    return id;
  }
  function route(from, to) {
    const open = [from],
      g = new Float64Array(count).fill(Infinity),
      parent = new Int32Array(count).fill(-1),
      closed = new Uint8Array(count),
      visited = [];
    g[from] = 0;
    const [tx, ty] = xy(to);
    const score = (n) => {
      const [x, y] = xy(n);
      return g[n] + Math.abs(x - tx) + Math.abs(y - ty);
    };
    while (open.length) {
      let best = 0;
      for (let i = 1; i < open.length; i++)
        if (score(open[i]) < score(open[best])) best = i;
      const n = open.splice(best, 1)[0];
      if (closed[n]) continue;
      closed[n] = 1;
      visited.push(n);
      if (n === to) {
        const result = [];
        for (let p = n; p !== -1; p = parent[p]) result.push(p);
        return [visited, result.reverse()];
      }
      const [x, y] = xy(n);
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ]) {
        const nx = x + dx,
          ny = y + dy,
          next = ny * cols + nx;
        if (
          nx < 0 ||
          nx >= cols ||
          ny < 0 ||
          next >= count ||
          walls[next] ||
          closed[next]
        )
          continue;
        if (g[n] + 1 < g[next]) {
          g[next] = g[n] + 1;
          parent[next] = n;
          open.push(next);
        }
      }
    }
    return [visited, []];
  }
  function positionLabel() {
    const [x, y] = point(start);
    label.style.left = `${Math.min(width - 100, x + 10)}px`;
    label.style.top = `${Math.max(0, y - 20)}px`;
  }
  function calculate(now = performance.now()) {
    if (path.length) {
      previous = path;
      previousAt = now;
    }
    [search, path] = route(start, targets[destination]);
    began = now;
    cycle = now;
    positionLabel();
    if (motion.matches) draw(now);
    else wake();
  }
  function measure() {
    const rect = hero.getBoundingClientRect();
    if (!hero.isConnected || !rect.width || !rect.height) return;
    width = rect.width;
    height = rect.height;
    cell = innerWidth <= 850 ? 18 : 22;
    cols = Math.ceil(width / cell);
    count = cols * Math.ceil(height / cell);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const style = getComputedStyle(hero),
      root = getComputedStyle(document.documentElement);
    colors = {
      dot: style.getPropertyValue("--border").trim(),
      line:
        root.colorScheme === "dark"
          ? root.getPropertyValue("--accent").trim()
          : root.getPropertyValue("--line-1").trim(),
    };
    walls = new Uint8Array(count);
    const blocks = [
      ...hero.querySelectorAll(
        ".role, .intro, .conditions, .quick-links a, .site-map b, .site-map span, .hero-scroll, .hero-caption",
      ),
    ];
    const rectangles = blocks.flatMap((el) => [...el.getClientRects()]);
    const walker = document.createTreeWalker(
      hero.querySelector("h1"),
      NodeFilter.SHOW_TEXT,
    );
    while (walker.nextNode()) {
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      rectangles.push(...range.getClientRects());
    }
    for (let i = 0; i < count; i++) {
      const [x, y] = point(i);
      walls[i] = rectangles.some(
        (r) =>
          x + cell / 2 > r.left - rect.left - 4 &&
          x - cell / 2 < r.right - rect.left + 4 &&
          y + cell / 2 > r.top - rect.top - 4 &&
          y - cell / 2 < r.bottom - rect.top + 4,
      )
        ? 1
        : 0;
    }
    targets = rows.map((row) => {
      const r = row.querySelector(".node").getBoundingClientRect();
      return nearest(
        indexAt(
          r.left + r.width / 2 - rect.left,
          r.top + r.height / 2 - rect.top,
        ),
      );
    });
    const button = hero.querySelector(".quick-links").getBoundingClientRect();
    start = nearest(
      pointer
        ? indexAt(pointer[0], pointer[1])
        : indexAt(12, button.bottom - rect.top + cell * 1.5),
    );
    const h1 = hero.querySelector("h1").getBoundingClientRect();
    anchors = [
      ...new Set([
        start,
        nearest(indexAt(cell / 2, h1.top - rect.top - cell)),
        nearest(indexAt(width * 0.4, cell / 2)),
      ]),
    ].filter(
      (anchor) =>
        anchor === start ||
        targets.every((target) => route(anchor, target)[1].length),
    );
    turn = 0;
    previous = [];
    calculate();
  }
  function line(points, alpha, fraction = 1) {
    if (!points.length) return;
    const limit = Math.max(1, Math.ceil(points.length * fraction));
    context.globalAlpha = alpha;
    context.strokeStyle = colors.line;
    context.lineWidth = 2.5;
    context.beginPath();
    points.slice(0, limit).forEach((id, i) => {
      const [x, y] = point(id);
      if (i) context.lineTo(x, y);
      else context.moveTo(x, y);
    });
    context.stroke();
    const [x, y] = point(points[limit - 1]);
    context.fillStyle = colors.line;
    context.beginPath();
    context.arc(x, y, 3.5, 0, Math.PI * 2);
    context.fill();
  }
  function draw(now) {
    context.clearRect(0, 0, width, height);
    const elapsed = now - began;
    context.fillStyle = colors.dot;
    for (let i = 0; i < count; i++)
      if (!walls[i]) {
        const [x, y] = point(i),
          [sx, sy] = point(start);
        const wave = motion.matches
          ? 1
          : Math.max(
              0,
              Math.min(
                1,
                (now - entrance - Math.hypot(x - sx, y - sy) * 0.6) / 400,
              ),
            );
        context.globalAlpha = 0.65 * wave;
        context.fillRect(x - 1, y - 1, 2, 2);
      }
    if (motion.matches) {
      targets.forEach((target) => line(route(start, target)[1], 0.72));
    } else {
      line(previous, Math.max(0, 0.3 * (1 - (now - previousAt) / 2400)));
      context.fillStyle = colors.line;
      const shown = Math.min(search.length, Math.floor(elapsed / 12) * 14);
      const size = cell * 0.42;
      for (let i = 0; i < shown; i++) {
        const age = elapsed - Math.floor(i / 14) * 12;
        context.globalAlpha = Math.max(0.05, 0.42 * (1 - age / 1400));
        const [x, y] = point(search[i]);
        context.fillRect(x - size / 2, y - size / 2, size, size);
      }
      const progress = Math.max(
        0,
        Math.min(
          1,
          (elapsed - Math.min(1300, (search.length / 14) * 12)) / 900,
        ),
      );
      line(path, 0.9, progress);
      if (progress >= 1 && path.length)
        rows.forEach((row, i) =>
          row.classList.toggle("is-target", i === destination),
        );
    }
    const [startX, startY] = point(start);
    context.globalAlpha = 1;
    context.fillStyle = colors.line;
    context.beginPath();
    context.arc(startX, startY, 3, 0, Math.PI * 2);
    context.fill();
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || motion.matches) return;
    if (dirty) {
      dirty = false;
      const next = nearest(indexAt(...pointer));
      if (next !== start) {
        start = next;
        calculate(now);
      }
    }
    if (!locked && now - cycle > 3400) {
      destination = (destination + 1) % rows.length;
      if (now - pointerAt > 4000) start = wander();
      calculate(now);
    }
    draw(now);
    frame = requestAnimationFrame(tick);
  }
  function wake() {
    if (!frame && visible && !document.hidden && !motion.matches)
      frame = requestAnimationFrame(tick);
  }
  function updateMotion() {
    canvas.dataset.motion = motion.matches ? "static" : "live";
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    measure();
  }
  rows.forEach((row, i) => {
    const select = () => {
      locked = true;
      destination = i;
      calculate();
    };
    const release = () => {
      if (!row.matches(":hover, :focus-within")) {
        locked = false;
        cycle = performance.now();
      }
    };
    row.addEventListener("pointerenter", () => {
      if (fine.matches) select();
    });
    row.addEventListener("pointerleave", () => {
      if (fine.matches) release();
    });
    row.addEventListener("focusin", select);
    row.addEventListener("focusout", () => requestAnimationFrame(release));
  });
  hero.addEventListener("pointermove", (event) => {
    if (!fine.matches || motion.matches) return;
    const r = hero.getBoundingClientRect();
    pointer = [event.clientX - r.left, event.clientY - r.top];
    pointerAt = performance.now();
    dirty = true;
    wake();
  });
  new ResizeObserver(measure).observe(hero);
  new MutationObserver(measure).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) {
      cycle = performance.now();
      wake();
    }
  }).observe(hero);
  document.addEventListener("visibilitychange", wake);
  motion.addEventListener("change", updateMotion);
  document.fonts.ready.then(measure);
  updateMotion();
})();
