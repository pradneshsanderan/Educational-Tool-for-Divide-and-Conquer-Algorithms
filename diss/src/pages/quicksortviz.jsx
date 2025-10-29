import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";

// --- Styles ---
const boxStyle = {
  width: 40,
  height: 40,
  lineHeight: '40px',
  textAlign: 'center',
  border: '1px solid #444',
  borderRadius: 4,
  background: '#90caf9',
  margin: '0 2px',
  position: 'relative',
  fontWeight: 500,
  fontSize: 18,
  transition: 'background 0.2s, border 0.2s, color 0.2s'
};

function getBoxColor(state) {
  if (state === 'pivot') return { background: '#ffeb3b', border: '2px solid #fbc02d', color: '#333' };
  if (state === 'pivot-dim') return { background: '#fffde7', border: '2px solid #fbc02d', color: '#aaa' };
  if (state === 'pivot-dark') return { background: '#ffd600', border: '2px solid #ff6f00', color: '#222' };
  if (state === 'sorted') return { background: '#c8e6c9', border: '2px solid #388e3c', color: '#222' };
  return { background: '#90caf9', border: '1px solid #444', color: '#222' };
}

// --- Step generator for visualisation ---
function buildQuickSortSteps(arr) {
  let steps = [];
  let idCounter = 0;

  function createId() {
    return `qs_${idCounter++}`;
  }

  // Build the quicksort tree, but only mark the root as pivot at first
  function buildTree(group, indices, markPivot = true) {
    if (group.length <= 1) {
      return {
        id: createId(),
        indices: [...indices],
        pivotIdx: null,
        left: null,
        right: null,
        state: group.length === 1 ? 'sorted' : null,
      };
    }
    const pivotIdx = Math.floor(group.length / 2);
    const pivotVal = group[pivotIdx];
    const leftArr = [];
    const leftIndices = [];
    const rightArr = [];
    const rightIndices = [];
    for (let i = 0; i < group.length; ++i) {
      if (i === pivotIdx) continue;
      if (group[i] < pivotVal) {
        leftArr.push(group[i]);
        leftIndices.push(indices[i]);
      } else {
        rightArr.push(group[i]);
        rightIndices.push(indices[i]);
      }
    }
    return {
      id: createId(),
      indices: [...indices],
      pivotIdx,
      left: buildTree(leftArr, leftIndices, false),
      right: buildTree(rightArr, rightIndices, false),
      state: markPivot ? 'pivot' : null, // Only root is pivot at first
    };
  }

  // Helper to traverse tree and collect all current groups at a given phase
  function getCurrentGroups(node, pivots = new Set(), dimmed = false, dark = false, sortedSet = new Set()) {
    let queue = [node];
    let groups = [];
    while (queue.length) {
      let next = [];
      for (const n of queue) {
        if (!n) continue;
        let state = null;
        if (sortedSet.has(n.id)) {
          state = 'sorted';
        } else if (dark && pivots.has(n.id)) {
          state = 'pivot-dark';
        } else if (dimmed && pivots.has(n.id)) {
          state = 'pivot-dim';
        } else if (pivots.has(n.id)) {
          state = 'pivot';
        }
        groups.push({
          id: n.id,
          indices: n.indices,
          pivotIdx: n.pivotIdx,
          state,
        });
        if (n.left) next.push(n.left);
        if (n.right) next.push(n.right);
      }
      queue = next;
    }
    return groups;
  }

  // Helper to collect all current pivots (nodes with state 'pivot')
  function collectPivots(node, pivots = new Set()) {
    if (!node) return;
    if (node.state === 'pivot') pivots.add(node.id);
    if (node.left) collectPivots(node.left, pivots);
    if (node.right) collectPivots(node.right, pivots);
    return pivots;
  }

  // Helper to set pivots for all eligible subgroups (length > 1, not sorted)
  function setNextPivots(node) {
    let pivots = new Set();
    function mark(node) {
      if (!node) return;
      if (node.state === null && node.indices.length > 1) {
        node.state = 'pivot';
        pivots.add(node.id);
      }
      if (node.left) mark(node.left);
      if (node.right) mark(node.right);
    }
    mark(node);
    return pivots;
  }

  // Helper to mark pivots as dark
  function markPivotsDark(node, pivots = new Set()) {
    if (!node) return;
    if (node.state === 'pivot') pivots.add(node.id);
    if (node.left) markPivotsDark(node.left, pivots);
    if (node.right) markPivotsDark(node.right, pivots);
    return pivots;
  }

  // Helper to mark all as sorted for a set of nodes
  function markAllSorted(node, sortedSet) {
    if (!node) return;
    sortedSet.add(node.id);
    if (node.left) markAllSorted(node.left, sortedSet);
    if (node.right) markAllSorted(node.right, sortedSet);
  }

  // Main step generator
  function generateSteps(tree, arr) {
    // 1. Initial: only root is pivot, all others are unsorted
    let pivots = collectPivots(tree, new Set());
    steps.push(getCurrentGroups(tree, pivots));

    // 2. Dim the root pivot
    steps.push(getCurrentGroups(tree, pivots, true));

    // 3. Set pivots for all subgroups (left/right of root)
    pivots = setNextPivots(tree);
    steps.push(getCurrentGroups(tree, pivots, false, false));

    // 4. Dim all pivots (waiting for combine)
    steps.push(getCurrentGroups(tree, pivots, true, false));

    // 5. Darken all pivots (ready to combine)
    let darkPivots = markPivotsDark(tree, new Set());
    steps.push(getCurrentGroups(tree, darkPivots, false, true));

    // 6. Combine subgroups (undarken pivots and mark as sorted except root)
    let sortedSet = new Set();
    function combineSubgroups(node) {
      if (!node) return;
      if (node.left && node.left.state === 'pivot') {
        markAllSorted(node.left, sortedSet);
      }
      if (node.right && node.right.state === 'pivot') {
        markAllSorted(node.right, sortedSet);
      }
      if (node.left) combineSubgroups(node.left);
      if (node.right) combineSubgroups(node.right);
    }
    combineSubgroups(tree);
    steps.push(getCurrentGroups(tree, darkPivots, false, false, sortedSet));

    // 7. Combine root (all sorted)
    markAllSorted(tree, sortedSet);
    steps.push(getCurrentGroups(tree, darkPivots, false, false, sortedSet));
  }

  // Build the tree and generate steps
  const tree = buildTree(arr, arr.map((_, i) => i), true);
  generateSteps(tree, arr);

  // Each step is an array of groups, each group has indices into arr and a pivotIdx
  // We'll use these to render the array in order, with group/pivot highlights
  return steps.map(stepGroups => {
    // For each element in the original array, find its group and pivot state
    let elementStates = arr.map((num, idx) => ({
      value: num,
      groupId: null,
      isPivot: false,
      pivotState: null,
      sorted: false,
    }));
    for (const group of stepGroups) {
      for (let i = 0; i < group.indices.length; ++i) {
        const arrIdx = group.indices[i];
        elementStates[arrIdx].groupId = group.id;
        elementStates[arrIdx].sorted = group.state === 'sorted' || group.state === 'pivot-dark' || group.state === 'pivot-dim' || group.state === 'pivot';
        if (group.pivotIdx !== null && group.pivotIdx === i) {
          elementStates[arrIdx].isPivot = true;
          elementStates[arrIdx].pivotState = group.state;
        } else if (group.pivotIdx === null && group.state === 'sorted') {
          elementStates[arrIdx].pivotState = 'sorted';
        } else if (group.state === 'pivot-dim' || group.state === 'pivot-dark') {
          // If group is dimmed/darkened, mark all as such
          elementStates[arrIdx].pivotState = group.state;
        }
      }
    }
    // Also, collect group boundaries for rendering
    let groupBoundaries = [];
    let lastGroup = null;
    for (let i = 0; i < elementStates.length; ++i) {
      if (elementStates[i].groupId !== lastGroup) {
        groupBoundaries.push(i);
        lastGroup = elementStates[i].groupId;
      }
    }
    groupBoundaries.push(elementStates.length);
    return { elementStates, groupBoundaries };
  });
}

// --- Array Row Component ---
function ArrayRow({ elementStates, groupBoundaries, onCellClick }) {
  let cells = [];
  for (let g = 0; g < groupBoundaries.length - 1; ++g) {
    const start = groupBoundaries[g];
    const end = groupBoundaries[g + 1];
    const group = elementStates.slice(start, end);
    cells.push(
      <div
        key={g}
        className="array-group"
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.5rem",
          border: "1px solid #aaa",
          borderRadius: "6px",
          background: "#f0f0f0",
          margin: "0 10px",
          minWidth: group.length ? group.length * 44 : 44,
          boxShadow: group.some(e => e.pivotState === 'pivot-dark' || e.pivotState === 'sorted') ? "0 0 8px #c8e6c9" : undefined,
          position: "relative"
        }}
      >
        {group.map((cell, idx) => {
          const color = getBoxColor(cell.pivotState);
          return (
            <div
              key={idx}
              style={{ ...boxStyle, ...color }}
              onClick={() => onCellClick && onCellClick(cell)}
            >
              {cell.value}
              {cell.isPivot && cell.pivotState === 'pivot' && (
                <div style={{
                  position: 'absolute',
                  bottom: -18,
                  left: 0,
                  width: '100%',
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#fbc02d'
                }}>Pivot</div>
              )}
              {cell.isPivot && cell.pivotState === 'pivot-dim' && (
                <div style={{
                  position: 'absolute',
                  bottom: -18,
                  left: 0,
                  width: '100%',
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#bbb'
                }}>Pivot</div>
              )}
              {cell.isPivot && cell.pivotState === 'pivot-dark' && (
                <div style={{
                  position: 'absolute',
                  bottom: -18,
                  left: 0,
                  width: '100%',
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#ff6f00'
                }}>Pivot</div>
              )}
              {cell.pivotState === 'sorted' && (
                <div style={{
                  position: 'absolute',
                  top: -18,
                  left: 0,
                  width: '100%',
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#388e3c'
                }}>Sorted</div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return <div style={{ display: "flex", justifyContent: "center" }}>{cells}</div>;
}

// --- Main Visualiser ---
export default function QuickSortViz() {
  const navigate = useNavigate();
  const [size, setSize] = useState('7');
  const [submitted, setSubmitted] = useState(false);
  const [steps, setSteps] = useState([]);
  const [step, setStep] = useState(0);

  // Bottom panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelInfo, setPanelInfo] = useState(null);
  const panelRef = useRef(null);

  // Generate random array and steps
  const handleSubmit = e => {
    e.preventDefault();
    const arr = Array.from({ length: Math.min(Math.max(parseInt(size, 10), 2), 25) }, () => Math.floor(Math.random() * 100));
    const steps = buildQuickSortSteps(arr);
    setSteps(steps);
    setStep(0);
    setSubmitted(true);
    setPanelInfo(null);
    setPanelOpen(false);
  };

  const reset = () => {
    setSubmitted(false);
    setSteps([]);
    setStep(0);
    setSize('7');
    setPanelInfo(null);
    setPanelOpen(false);
  };

  // Panel info logic
  const handleCellClick = (cell) => {
    if (!cell) return;
    let info = {};
    if (cell.pivotState === 'pivot') {
      info = {
        title: "Pivot",
        content: `Pivot element: ${cell.value}`
      };
    } else if (cell.pivotState === 'pivot-dim') {
      info = {
        title: "Pivot (dimmed)",
        content: `This pivot is waiting for subgroups to be processed.`
      };
    } else if (cell.pivotState === 'pivot-dark') {
      info = {
        title: "Pivot (ready to combine)",
        content: `This pivot is ready to be combined with its subgroups.`
      };
    } else if (cell.pivotState === 'sorted') {
      info = {
        title: "Sorted",
        content: `Element ${cell.value} is now in its sorted position.`
      };
    } else {
      info = {
        title: "Element",
        content: `Value: ${cell.value}`
      };
    }
    setPanelInfo(info);
    setPanelOpen(true);
  };

  // Only close if click is NOT on a button or array group
  useEffect(() => {
    if (!panelOpen) return;
    function handleClick(e) {
      if (panelRef.current && panelRef.current.contains(e.target)) {
        if (
          e.target.closest('button') ||
          e.target.closest('.array-group')
        ) {
          return;
        }
        setPanelInfo(null);
        setPanelOpen(false);
        return;
      }
      if (
        e.target.closest('button') ||
        e.target.closest('.array-group')
      ) {
        return;
      }
      setPanelInfo(null);
      setPanelOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [panelOpen]);

  // Step navigation
  const handleNext = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const handlePrev = () => setStep(s => Math.max(s - 1, 0));
  const handleComplete = () => setStep(steps.length - 1);

  // Panel auto-update on step change
  useEffect(() => {
    setPanelInfo(null);
    setPanelOpen(false);
  }, [step]);

  return (
    <div
      style={{
        minHeight: "20vh",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: '2rem',
        background: "#f8fafc"
      }}
    >
      <div style={{ width: "100%", maxWidth: 900 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem"
          }}
        >
          <h1 style={{ textAlign: "center", margin: 0, flex: 1 }}>
            Quicksort Visualiser
          </h1>
          <button
            onClick={() => navigate('/')}
            style={{
              marginLeft: "1.5rem",
              marginRight: 0,
              alignSelf: "flex-start",
              fontSize: "1rem",
              padding: "0.5rem 1.2rem",
              borderRadius: "0.35rem",
              border: "1px solid #333",
              background: "#f5f5f5",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Home
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <label>
              Array size (2‑25):
              <input
                type="number"
                value={size}
                min={2}
                max={25}
                onChange={e => {
                  let v = e.target.value === '' ? '' : Math.max(2, Math.min(25, parseInt(e.target.value, 10))).toString();
                  setSize(v);
                }}
                style={{ marginLeft: "0.5rem" }}
              />
            </label>
            <button type="submit" style={{ marginTop: '1rem' }}>Generate & Start</button>
          </form>
        ) : (
          <>
            <div style={{ marginTop: '2rem', display: "flex", justifyContent: "center", gap: "1rem" }}>
              <button disabled={step === steps.length - 1} onClick={handleNext}>Next step</button>
              <button disabled={step === 0} onClick={handlePrev}>Previous step</button>
              <button onClick={handleComplete}>Complete visualisation</button>
              <button onClick={reset}>Generate new array</button>
            </div>

            <h3 style={{ marginTop: '1rem' }}>Step {step + 1}/{steps.length}</h3>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', justifyContent: 'center', minHeight: 120 }}>
              <AnimatePresence mode="popLayout">
                {steps[step] &&
                  <ArrayRow
                    elementStates={steps[step].elementStates}
                    groupBoundaries={steps[step].groupBoundaries}
                    onCellClick={handleCellClick}
                  />
                }
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
      {/* Bottom Panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            ref={panelRef}
            initial={false}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 320, opacity: 0 }}
            transition={{
              type: "tween",
              ease: [0.22, 1, 0.36, 1],
              duration: 0.5
            }}
            style={{
              width: "100vw",
              background: "#fff",
              color: "#222",
              borderTop: "2px solid #bbb",
              boxShadow: "0 -2px 10px #0002",
              minHeight: 180,
              position: "fixed",
              left: 0,
              bottom: 0,
              zIndex: 99,
              padding: "2rem 5rem 2rem 1.5rem",
              display: "flex",
              flexDirection: "row",
              alignItems: "stretch",
              gap: "2rem",
              overflow: "hidden"
            }}
          >
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column"
            }}>
              <h4 style={{ marginTop: 0, color: "#1976d2" }}>{panelInfo?.title || "Info"}</h4>
              <p style={{ fontSize: "1.1rem" }}>{panelInfo?.content || "Click on an array cell to see information about it"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}