let currentMode = 'BST'; // 'BST' or 'AVL'
let root = null;
let animationSpeed = 650;
let isAnimating = false;

const defaultCatalog = {
  1020: { name: "Steel Storage Rack", cat: "Shelving", qty: 80, price: 215.75 },
  1030: { name: "Hydraulic Pallet Jack", cat: "Handling", qty: 45, price: 380.50 },
  1040: { name: "Safety Harness Kit", cat: "Safety Gear", qty: 150, price: 64.00 },
  1050: { name: "Industrial Forklift", cat: "Heavy Equip", qty: 12, price: 4250.00 },
  1060: { name: "Conveyor Belt Roller", cat: "Automation", qty: 60, price: 540.00 },
  1070: { name: "Barcode Laser Scanner", cat: "Electronics", qty: 110, price: 125.00 },
  1080: { name: "Thermal Label Printer", cat: "Electronics", qty: 35, price: 295.25 }
};

// 1. Node Class
class TreeNode {
  constructor(id, name, cat = "General", qty = 50, price = 100.0) {
    this.id = id;
    this.name = name;
    this.cat = cat;
    this.qty = qty;
    this.price = price;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = 0;
    this.y = 0;
  }
}

// 2. Height & Balance Factor Helpers
function getHeight(node) {
  return node ? node.height : 0;
}

function getBalanceFactor(node) {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function updateHeight(node) {
  if (node) {
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
  }
}

function setConceptExplanation(title, htmlText) {
  document.getElementById("concept-title").textContent = title;
  document.getElementById("concept-body").innerHTML = htmlText;
}

function logMessage(msg, type = "info") {
  const consoleEl = document.getElementById("log-console");
  const div = document.createElement("div");
  let style = "text-slate-700";
  if (type === "success") style = "text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded";
  if (type === "warn") style = "text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded";
  if (type === "error") style = "text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded";
  if (type === "rotation") style = "text-indigo-800 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200";
  div.className = style;
  div.textContent = msg;
  consoleEl.appendChild(div);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// 3. AVL Tree Rotations
function rightRotate(y) {
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  logMessage(`↻ Right Rotate on ${y.id}: ${x.id} moves UP as parent of ${y.id}`, "rotation");
  return x;
}

function leftRotate(x) {
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  logMessage(`↺ Left Rotate on ${x.id}: ${y.id} moves UP as parent of ${x.id}`, "rotation");
  return y;
}

// 4. Insert Function (BST and AVL)
function insertNode(node, newNode, isAVL = false) {
  if (!node) return newNode;

  if (newNode.id < node.id) {
    node.left = insertNode(node.left, newNode, isAVL);
  } else if (newNode.id > node.id) {
    node.right = insertNode(node.right, newNode, isAVL);
  } else {
    return node;
  }

  updateHeight(node);

  if (isAVL) {
    const bf = getBalanceFactor(node);

    // LL Case
    if (bf > 1 && newNode.id < node.left.id) {
      logMessage(`! LL Imbalance at ${node.id} (BF=+${bf})`, "warn");
      return rightRotate(node);
    }
    // RR Case
    if (bf < -1 && newNode.id > node.right.id) {
      logMessage(`! RR Imbalance at ${node.id} (BF=${bf})`, "warn");
      return leftRotate(node);
    }
    // LR Case
    if (bf > 1 && newNode.id > node.left.id) {
      logMessage(`! LR Imbalance at ${node.id} (BF=+${bf}) -> Double Rotation`, "warn");
      node.left = leftRotate(node.left);
      return rightRotate(node);
    }
    // RL Case
    if (bf < -1 && newNode.id < node.right.id) {
      logMessage(`! RL Imbalance at ${node.id} (BF=${bf}) -> Double Rotation`, "warn");
      node.right = rightRotate(node.right);
      return leftRotate(node);
    }
  }
  return node;
}

// 5. Delete Function
function getMinValueNode(node) {
  let curr = node;
  while (curr && curr.left) curr = curr.left;
  return curr;
}

function deleteNode(node, targetId, isAVL = false) {
  if (!node) return null;

  if (targetId < node.id) {
    node.left = deleteNode(node.left, targetId, isAVL);
  } else if (targetId > node.id) {
    node.right = deleteNode(node.right, targetId, isAVL);
  } else {
    if (!node.left || !node.right) {
      return node.left ? node.left : node.right;
    }
    const succ = getMinValueNode(node.right);
    logMessage(`Node ${node.id} has 2 children → replacing with Inorder Successor (${succ.id})`, "warn");
    node.id = succ.id;
    node.name = succ.name;
    node.cat = succ.cat;
    node.qty = succ.qty;
    node.price = succ.price;
    node.right = deleteNode(node.right, succ.id, isAVL);
  }

  updateHeight(node);

  if (isAVL) {
    const bf = getBalanceFactor(node);
    if (bf > 1 && getBalanceFactor(node.left) >= 0) return rightRotate(node);
    if (bf > 1 && getBalanceFactor(node.left) < 0) {
      node.left = leftRotate(node.left);
      return rightRotate(node);
    }
    if (bf < -1 && getBalanceFactor(node.right) <= 0) return leftRotate(node);
    if (bf < -1 && getBalanceFactor(node.right) > 0) {
      node.right = rightRotate(node.right);
      return leftRotate(node);
    }
  }
  return node;
}

// 6. Compute Screen Positions
function calculateCoordinates(node, depth = 0, leftBound = 40, rightBound = 860) {
  if (!node) return;
  node.x = (leftBound + rightBound) / 2;
  node.y = 45 + depth * 58;
  calculateCoordinates(node.left, depth + 1, leftBound, node.x);
  calculateCoordinates(node.right, depth + 1, node.x, rightBound);
}

// 7. Render Tree into SVG
function renderTree(highlightedPath = [], specialNodes = {}) {
  const edgesGroup = document.getElementById("svg-edges");
  const nodesGroup = document.getElementById("svg-nodes");
  const emptyState = document.getElementById("empty-state");

  edgesGroup.innerHTML = "";
  nodesGroup.innerHTML = "";

  if (!root) {
    emptyState.classList.remove("hidden");
    updateMetrics();
    updateCatalogue();
    return;
  }
  emptyState.classList.add("hidden");

  if (getHeight(root) >= 6 && !root.left) {
    let curr = root;
    let idx = 0;
    while (curr) {
      curr.x = 120 + idx * 110;
      curr.y = 45 + idx * 55;
      curr = curr.right;
      idx++;
    }
  } else {
    calculateCoordinates(root);
  }

  function drawEdge(parent, child, label) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", parent.x);
    line.setAttribute("y1", parent.y);
    line.setAttribute("x2", child.x);
    line.setAttribute("y2", child.y);
    line.setAttribute("stroke", "#94a3b8");
    line.setAttribute("stroke-width", "2.5");
    edgesGroup.appendChild(line);

    const mx = (parent.x + child.x) / 2;
    const my = (parent.y + child.y) / 2 - 4;
    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", mx);
    txt.setAttribute("y", my);
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("fill", "#64748b");
    txt.setAttribute("font-size", "10");
    txt.setAttribute("font-weight", "bold");
    txt.textContent = label;
    edgesGroup.appendChild(txt);
  }

  function traverseEdges(node) {
    if (!node) return;
    if (node.left) { drawEdge(node, node.left, "< L"); traverseEdges(node.left); }
    if (node.right) { drawEdge(node, node.right, "R >"); traverseEdges(node.right); }
  }
  traverseEdges(root);

  function traverseNodes(node) {
    if (!node) return;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "cursor-pointer node-transition");

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", "22");

    let fill = "#2563eb";
    let stroke = "#1d4ed8";

    if (specialNodes[node.id] === "visiting") { fill = "#f59e0b"; stroke = "#b45309"; }
    else if (specialNodes[node.id] === "found") { fill = "#059669"; stroke = "#065f46"; }
    else if (specialNodes[node.id] === "pred") { fill = "#9333ea"; stroke = "#6b21a8"; }
    else if (specialNodes[node.id] === "succ") { fill = "#f97316"; stroke = "#c2410c"; }
    else if (highlightedPath.includes(node.id)) { fill = "#3b82f6"; stroke = "#1e40af"; }

    circle.setAttribute("fill", fill);
    circle.setAttribute("stroke", stroke);
    circle.setAttribute("stroke-width", "3");
    g.appendChild(circle);

    const idText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    idText.setAttribute("x", node.x);
    idText.setAttribute("y", node.y + 4);
    idText.setAttribute("text-anchor", "middle");
    idText.setAttribute("fill", "#ffffff");
    idText.setAttribute("font-size", "11");
    idText.setAttribute("font-weight", "bold");
    idText.setAttribute("font-family", "JetBrains Mono, monospace");
    idText.textContent = node.id;
    g.appendChild(idText);

    const bf = getBalanceFactor(node);
    if (currentMode === 'AVL' || specialNodes[node.id]) {
      const badge = document.createElementNS("http://www.w3.org/2000/svg", "text");
      badge.setAttribute("x", node.x);
      badge.setAttribute("y", node.y - 27);
      badge.setAttribute("text-anchor", "middle");
      badge.setAttribute("fill", "#0f766e");
      badge.setAttribute("font-size", "10");
      badge.setAttribute("font-weight", "bold");
      badge.textContent = currentMode === 'AVL' ? `BF=${bf > 0 ? '+' + bf : bf}` : '';
      g.appendChild(badge);
    }

    g.addEventListener("mouseenter", () => showNodeInfo(node));
    g.addEventListener("mouseleave", () => hideNodeInfo());
    g.addEventListener("click", () => {
      document.getElementById("input-search").value = node.id;
      handleSearch();
    });

    nodesGroup.appendChild(g);
    traverseNodes(node.left);
    traverseNodes(node.right);
  }
  traverseNodes(root);

  updateMetrics();
  updateCatalogue();
}

function showNodeInfo(node) {
  const card = document.getElementById("node-info-card");
  document.getElementById("info-id").textContent = `Product ID: ${node.id}`;
  document.getElementById("info-bf").textContent = `BF: ${getBalanceFactor(node)}`;
  document.getElementById("info-name").textContent = node.name;
  document.getElementById("info-cat").textContent = node.cat;
  document.getElementById("info-qty").textContent = `${node.qty} units`;
  document.getElementById("info-price").textContent = `$${node.price.toFixed(2)}`;
  document.getElementById("info-height").textContent = `${node.height}`;
  card.classList.remove("hidden");
}

function hideNodeInfo() {
  document.getElementById("node-info-card").classList.add("hidden");
}

function countNodes(node) {
  return node ? 1 + countNodes(node.left) + countNodes(node.right) : 0;
}

function updateMetrics() {
  const count = countNodes(root);
  const height = getHeight(root);
  const optHeight = count > 0 ? Math.floor(Math.log2(count)) + 1 : 0;

  document.getElementById("metric-count").textContent = count;
  document.getElementById("metric-height").textContent = height;
  document.getElementById("metric-height-comp").textContent = `Best: ${optHeight}`;

  const badge = document.getElementById("metric-shape-badge");
  if (count === 0) {
    badge.textContent = "Empty";
    badge.className = "text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500";
  } else if (height === count && count > 2) {
    badge.textContent = "Skewed O(n)";
    badge.className = "text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800";
  } else if (height <= optHeight + 1) {
    badge.textContent = "Balanced O(log n)";
    badge.className = "text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800";
  } else {
    badge.textContent = "Unbalanced";
    badge.className = "text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800";
  }
}

function updateCatalogue() {
  const tbody = document.getElementById("catalogue-body");
  const badge = document.getElementById("catalogue-badge");
  const list = [];
  function inorder(node) {
    if (!node) return;
    inorder(node.left);
    list.push(node);
    inorder(node.right);
  }
  inorder(root);
  badge.textContent = `${list.length} items`;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-400 italic">Empty inventory</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(item => `
    <tr class="hover:bg-slate-50">
      <td class="py-1 px-2 font-bold text-blue-600">${item.id}</td>
      <td class="py-1 px-2 text-slate-700 truncate max-w-[125px]">${item.name}</td>
      <td class="py-1 px-2 text-right text-slate-600">${item.height}</td>
      <td class="py-1 px-2 text-right font-bold ${Math.abs(getBalanceFactor(item)) > 1 ? 'text-rose-600' : 'text-teal-700'}">${getBalanceFactor(item)}</td>
    </tr>
  `).join("");
}

// 8. Interactive Operations
async function handleSearch() {
  const targetId = parseInt(document.getElementById("input-search").value);
  if (isNaN(targetId) || !root || isAnimating) return;
  isAnimating = true;

  let curr = root;
  let comparisons = 0;
  const pathIds = [];

  logMessage(`--- Searching for Product ID ${targetId} ---`, "info");
  while (curr) {
    comparisons++;
    pathIds.push(curr.id);
    renderTree(pathIds, { [curr.id]: "visiting" });

    if (targetId === curr.id) {
      await sleep(animationSpeed);
      renderTree(pathIds, { [curr.id]: "found" });
      document.getElementById("metric-comps").textContent = comparisons;
      document.getElementById("metric-comps-status").textContent = "Found!";
      document.getElementById("canvas-status").textContent = `Found in ${comparisons} comparisons`;
      logMessage(`Step ${comparisons}: ${targetId} == ${curr.id} → FOUND (${curr.name})!`, "success");
      setConceptExplanation(
        `Search Result: Found Product ${targetId} in ${comparisons} Comparison(s)`,
        `We started at the root (${root.id}) and compared keys at each level. Because the tree height is <strong>h = ${getHeight(root)}</strong>, it took <strong>${comparisons} step(s)</strong> to locate <strong>${curr.name}</strong>.`
      );
      isAnimating = false;
      return;
    } else if (targetId < curr.id) {
      logMessage(`Step ${comparisons}: ${targetId} < ${curr.id} → Go LEFT`, "info");
      await sleep(animationSpeed);
      curr = curr.left;
    } else {
      logMessage(`Step ${comparisons}: ${targetId} > ${curr.id} → Go RIGHT`, "info");
      await sleep(animationSpeed);
      curr = curr.right;
    }
  }

  renderTree(pathIds);
  document.getElementById("metric-comps").textContent = comparisons;
  document.getElementById("metric-comps-status").textContent = "Not Found";
  document.getElementById("canvas-status").textContent = `Not Found (${comparisons} steps)`;
  logMessage(`Reached NULL after ${comparisons} steps → ID ${targetId} NOT in warehouse.`, "error");
  setConceptExplanation(
    `Search Result: Product ID ${targetId} Not Found (${comparisons} Comparisons)`,
    `We followed the < (Left) and > (Right) rules until we hit an empty <strong>NULL</strong> pointer after <strong>${comparisons} comparison(s)</strong>. This proves ID ${targetId} is not in the inventory.`
  );
  isAnimating = false;
}

async function handleInsert() {
  const idInput = document.getElementById("input-id");
  const nameInput = document.getElementById("input-name");
  const id = parseInt(idInput.value);
  if (isNaN(id) || isAnimating) return;

  const meta = defaultCatalog[id] || { name: nameInput.value.trim() || `Product ${id}`, cat: "General", qty: 25, price: 99.0 };
  const newNode = new TreeNode(id, nameInput.value.trim() || meta.name, meta.cat, meta.qty, meta.price);

  root = insertNode(root, newNode, currentMode === 'AVL');
  renderTree([], { [id]: "found" });
  logMessage(`Inserted ID ${id} (${newNode.name})`, "success");
  setConceptExplanation(
    `Inserted Product ID ${id} into ${currentMode} Tree`,
    currentMode === 'AVL'
      ? `Inserted <strong>${id}</strong> and automatically checked every ancestor's <strong>Balance Factor (BF = Left Height - Right Height)</strong> to keep the tree balanced.`
      : `Inserted <strong>${id}</strong> by comparing from the root: going Left when smaller (&lt;) and Right when larger (&gt;) until finding an empty spot.`
  );
  idInput.value = "";
  nameInput.value = "";
}

async function handlePredSucc() {
  const targetId = parseInt(document.getElementById("input-search").value);
  if (isNaN(targetId) || !root || isAnimating) return;

  let pred = null, succ = null, curr = root;
  while (curr) {
    if (curr.id === targetId) {
      if (curr.left) { let p = curr.left; while (p.right) p = p.right; pred = p; }
      if (curr.right) { let s = curr.right; while (s.left) s = s.left; succ = s; }
      break;
    } else if (targetId < curr.id) {
      succ = curr;
      curr = curr.left;
    } else {
      pred = curr;
      curr = curr.right;
    }
  }

  const highlights = {};
  if (curr) highlights[curr.id] = "found";
  if (pred) highlights[pred.id] = "pred";
  if (succ) highlights[succ.id] = "succ";
  renderTree([], highlights);

  logMessage(`ID ${targetId} → Predecessor: ${pred ? pred.id : 'None'} (Purple) | Successor: ${succ ? succ.id : 'None'} (Orange)`, "success");
  setConceptExplanation(
    `Predecessor & Successor of ID ${targetId}`,
    `<strong>Inorder Predecessor (${pred ? pred.id : 'None'}, Purple):</strong> The largest ID strictly smaller than ${targetId} (rightmost node in its left subtree).<br><strong>Inorder Successor (${succ ? succ.id : 'None'}, Orange):</strong> The smallest ID strictly larger than ${targetId} (leftmost node in its right subtree).`
  );
}

async function handleDelete() {
  const targetId = parseInt(document.getElementById("input-search").value);
  if (isNaN(targetId) || !root || isAnimating) return;

  logMessage(`--- Deleting Product ID ${targetId} ---`, "warn");
  root = deleteNode(root, targetId, currentMode === 'AVL');
  renderTree();
  setConceptExplanation(
    `Deleted Discontinued Product ID ${targetId}`,
    `<strong>How BST Deletion Works:</strong> (1) If the node is a <em>Leaf</em>, simply remove it. (2) If it has <em>1 Child</em>, link its parent directly to that child. (3) If it has <em>2 Children</em> (like Root 1050), replace it with its <strong>Inorder Successor</strong> (smallest ID in the right subtree) so the tree stays valid!`
  );
}

async function handleInorder() {
  if (!root || isAnimating) return;
  isAnimating = true;
  const list = [];
  function collect(n) { if (!n) return; collect(n.left); list.push(n); collect(n.right); }
  collect(root);

  setConceptExplanation(
    `Inorder Traversal (Left → Root → Right)`,
    `Because all Left nodes are smaller and all Right nodes are larger, visiting <strong>Left → Root → Right</strong> automatically prints all warehouse products in <strong>sorted ascending order</strong>: <strong>${list.map(x => x.id).join(' → ')}</strong>.`
  );
  logMessage(`Inorder Traversal: ${list.map(x => x.id).join(' -> ')}`, "success");

  for (const item of list) {
    renderTree([], { [item.id]: "found" });
    await sleep(animationSpeed * 0.75);
  }
  renderTree();
  isAnimating = false;
}

function loadPreset(ids, isAVL, title, explanation) {
  root = null;
  document.getElementById("log-console").innerHTML = "";
  logMessage(`Inserting sequence: ${ids.join(' → ')}`, "info");
  for (const id of ids) {
    const meta = defaultCatalog[id] || { name: `Product ${id}`, cat: "Warehouse", qty: 40, price: 120.0 };
    root = insertNode(root, new TreeNode(id, meta.name, meta.cat, meta.qty, meta.price), isAVL);
  }
  renderTree();
  setConceptExplanation(title, explanation);
}

// 9. Wire Up Events
document.getElementById("btn-insert").addEventListener("click", handleInsert);
document.getElementById("btn-search").addEventListener("click", handleSearch);
document.getElementById("btn-pred-succ").addEventListener("click", handlePredSucc);
document.getElementById("btn-delete").addEventListener("click", handleDelete);
document.getElementById("btn-inorder").addEventListener("click", handleInorder);
document.getElementById("btn-clear").addEventListener("click", () => {
  root = null;
  renderTree();
  setConceptExplanation("Tree Cleared", "Enter a Product ID and click Insert, or click one of the Lesson buttons above.");
});
document.getElementById("btn-clear-log").addEventListener("click", () => {
  document.getElementById("log-console").innerHTML = "";
});

document.getElementById("slider-speed").addEventListener("input", (e) => {
  animationSpeed = parseInt(e.target.value);
  document.getElementById("speed-label").textContent = `${(animationSpeed / 1000).toFixed(1)}s`;
});

// BST Presets
document.getElementById("btn-demo-random").addEventListener("click", () => {
  loadPreset(
    [1050, 1030, 1070, 1020, 1040, 1060, 1080],
    false,
    "Lesson 1: Random Order Insertion → Balanced BST (Height h = 3, Fast O(log n))",
    "When we insert <strong>1050 first</strong> (a middle number), smaller IDs (1030, 1020, 1040) branch Left and larger IDs (1070, 1060, 1080) branch Right. Every step cuts the search space in half! Searching for <strong>1080</strong> takes only <strong>3 comparisons</strong>."
  );
  document.getElementById("input-search").value = "1080";
});

document.getElementById("btn-demo-sorted").addEventListener("click", () => {
  loadPreset(
    [1020, 1030, 1040, 1050, 1060, 1070, 1080],
    false,
    "Lesson 2: Sorted Order Insertion → Skewed BST (Height h = 7, Slow O(n))",
    "<strong>Why did the tree become a straight line?</strong> We inserted IDs in sorted order: <strong>1020 → 1030 → 1040 → 1050 → 1060 → 1070 → 1080</strong>. Every new ID is larger than the previous one, so every node attaches to the <strong>RIGHT</strong>! Now searching for <strong>1080</strong> takes <strong>7 comparisons</strong> (just like a slow linked list)."
  );
  document.getElementById("input-search").value = "1080";
});

// AVL Presets
document.getElementById("btn-demo-ll").addEventListener("click", () => {
  loadPreset(
    [30, 20, 10],
    true,
    "AVL Case 1: LL Rotation (Single Right Rotation) on Inserting 30 → 20 → 10",
    "Inserting <strong>30 → 20 → 10</strong> makes Node 30 Left-Left heavy (<strong>BF = +2</strong>). <strong>Fix:</strong> Perform a <strong>Single Right Rotation</strong> on 30 — pull the middle node (<strong>20</strong>) UP to become the root, and push <strong>30</strong> down as its right child!"
  );
});

document.getElementById("btn-demo-rr").addEventListener("click", () => {
  loadPreset(
    [10, 20, 30],
    true,
    "AVL Case 2: RR Rotation (Single Left Rotation) on Inserting 10 → 20 → 30",
    "Inserting sorted keys <strong>10 → 20 → 30</strong> makes Node 10 Right-Right heavy (<strong>BF = -2</strong>). <strong>Fix:</strong> Perform a <strong>Single Left Rotation</strong> on 10 — pull the middle node (<strong>20</strong>) UP to become the root, and push <strong>10</strong> down as its left child!"
  );
});

document.getElementById("btn-demo-lr").addEventListener("click", () => {
  loadPreset(
    [30, 10, 20],
    true,
    "AVL Case 3: LR Double Rotation (Left-Right) on Inserting 30 → 10 → 20",
    "Inserting <strong>30 → 10 → 20</strong> creates a <em>zig-zag bend</em> (Left then Right). A single rotation cannot fix a bend! <strong>Step 1:</strong> Left-Rotate child <strong>10</strong> so 20 moves up into a straight line (30→20→10). <strong>Step 2:</strong> Right-Rotate <strong>30</strong> so <strong>20</strong> becomes the balanced root!"
  );
});

document.getElementById("btn-demo-rl").addEventListener("click", () => {
  loadPreset(
    [10, 30, 20],
    true,
    "AVL Case 4: RL Double Rotation (Right-Left) on Inserting 10 → 30 → 20",
    "Inserting <strong>10 → 30 → 20</strong> creates a <em>zig-zag bend</em> (Right then Left). <strong>Step 1:</strong> Right-Rotate child <strong>30</strong> to straighten the line (10→20→30). <strong>Step 2:</strong> Left-Rotate <strong>10</strong> so <strong>20</strong> becomes the balanced root!"
  );
});

document.getElementById("btn-demo-avl-fix").addEventListener("click", () => {
  loadPreset(
    [1020, 1030, 1040, 1050, 1060, 1070, 1080],
    true,
    "How AVL Solves Problem 19: Inserting Sorted IDs (1020..1080) Stays Balanced!",
    "We inserted the <strong>exact same sorted warehouse IDs (1020 → 1030 → ... → 1080)</strong> that caused a skewed chain of height 7 in a normal BST. Every time a node reached <strong>BF = -2</strong>, the AVL tree automatically performed a <strong>Left Rotation (RR case)</strong>, keeping the final tree perfectly balanced at <strong>Height h = 3</strong>!"
  );
  document.getElementById("input-search").value = "1080";
});

// Mode Tabs
const tabBST = document.getElementById("tab-bst");
const tabAVL = document.getElementById("tab-avl");
const bstPresets = document.getElementById("bst-presets");
const avlPresets = document.getElementById("avl-presets");

tabBST.addEventListener("click", () => {
  currentMode = 'BST';
  tabBST.className = "px-4 py-2 rounded-lg bg-blue-600 text-white shadow-sm transition";
  tabAVL.className = "px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition";
  bstPresets.classList.remove("hidden");
  avlPresets.classList.add("hidden");
  document.getElementById("metric-mode").textContent = "Standard BST";
  document.getElementById("btn-demo-random").click();
});

tabAVL.addEventListener("click", () => {
  currentMode = 'AVL';
  tabAVL.className = "px-4 py-2 rounded-lg bg-blue-600 text-white shadow-sm transition";
  tabBST.className = "px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition";
  avlPresets.classList.remove("hidden");
  bstPresets.classList.add("hidden");
  document.getElementById("metric-mode").textContent = "Self-Balancing AVL";
  document.getElementById("btn-demo-avl-fix").click();
});

// Auto-run Lesson 1 on start
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-demo-random").click();
});