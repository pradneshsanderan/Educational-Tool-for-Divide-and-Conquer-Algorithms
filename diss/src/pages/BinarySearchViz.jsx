import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import Switch from "../Switch";
import HomeButton from "../HomeButton";
import Input from "../Input"; // Add this import at the top with others
import ProgressButton from "../ProgressButton"; // Add this import at the top with others


const TUTORIAL_STEPS = [
  {
    title: "Exploring mode Switch",
    content: "The button in the top left toggles to an explorative version of the visualizer. "
  },
  {
    title: "Custom Array Input",
    content: "Use the 'Custom Array' button at the bottom right to enter your own array and (optionally) a target in brackets, e.g. 1,2,3,4,5 (3)."
  },
  {
    title: "Target",
    content: "The current target is shown above the array. The algorithm will search for this value."
  },
  {
    title: "Bottom Panel",
    content: "Click on an element to see details about the current step in the bottom panel."
  }
];

const COLORS = {
  background: "#F9F6F2",
  arrayBoxBg: "rgb(192, 231, 241)",
  arrayContainerBg: "rgb(229, 226, 221)",
  infoSectionBg: "#f9f9f9",
  borderDark: "#2A2925",
  borderLight: "#B0ADA8",
  sectionTitle: "#3b4252",
};



const boxStyle = {
  width: 40,
  height: 40,
  lineHeight: '40px',
  textAlign: 'center',
  border: `1px solid ${COLORS.borderDark}`,
  borderRadius: 4,
  backgroundColor: COLORS.arrayBoxBg,
  color: "#222",
  fontWeight: 600,
  fontSize: "1rem",
  marginRight: '0.3rem',
  marginBottom: '0.3rem',
  position: 'relative',
  overflow: 'hidden'
};



function getBoxVisuals(idx, { low, mid, high, found }) {
  let backgroundColor = '#90caf9';
  let overlay = null;
  if (idx < low || idx > high) {
    backgroundColor = '#888';
    overlay = (
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 4px)',
        pointerEvents: 'none'
      }} />
    );
  }
  if (idx === mid) backgroundColor = found ? '#c8e6c9' : '#ffcc80';
  return { backgroundColor, overlay };
}

function buildBinarySearchStepsRandom(size) {
  const random = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
  const arr    = [...random].sort((a, b) => a - b);
  const target = arr[Math.floor(Math.random() * arr.length)];

  const shrink = [];
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid   = Math.floor((low + high) / 2);
    const found = arr[mid] === target;
    shrink.push({ array: [...arr], low, mid, high, found });
    if (found) break;
    if (arr[mid] > target) high = mid - 1; else low = mid + 1;
  }

  const foundSnap = shrink[shrink.length - 1];
  const grow = shrink
    .slice(0, -1)
    .reverse()
    .map(s => ({
      array: [...arr],
      low   : s.low,
      high  : s.high,
      mid   : foundSnap.mid,
      found : true
    }));

  const steps = [...shrink, ...grow];

  return { steps, target };
}

function buildSearchPath(steps, stepIndex) {
  const path = [];
  for (let i = 0; i <= stepIndex && i < steps.length; i++) {
    const s = steps[i];
    path.push({
      value: s.array[s.mid],
      dir:   s.found ? 'found'
            : steps[i + 1] && steps[i + 1].mid < s.mid ? 'left' : 'right'
    });
    if (s.found) break;
  }
  return path;
}

function buildBinarySearchSteps(arr, target) {
  const steps = [];
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const found = arr[mid] === target;
    steps.push({ array: [...arr], low, mid, high, found });
    if (found) break;
    if (arr[mid] > target) high = mid - 1;
    else low = mid + 1;
  }
  // Optionally add recombine/grow steps if you want to mimic your random version
  return { steps };
}



export default function BinarySearchViz() {
  const navigate = useNavigate();
  const [size, setSize] = useState('10');
  const [submitted, setSubmitted] = useState(false);
  const [steps, setSteps] = useState([]);
  const [step, setStep] = useState(0);
  const [target, setTarget] = useState(null);
  const [switchChecked, setSwitchChecked] = useState(false);


  // Bottom panel state
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [panelInfo, setPanelInfo] = useState(null);
  const panelRef = useRef(null);


const [customPanelOpen, setCustomPanelOpen] = useState(false);
const [customInput, setCustomInput] = useState('');
const [customInputError, setCustomInputError] = useState('');


const [tutorialOpen, setTutorialOpen] = useState(true);
const [tutorialStep, setTutorialStep] = useState(0);

  // Helper to determine if we are in the "expanding" (recombining) phase
  function isExpanding(idx) {
    const firstFoundIdx = steps.findIndex(st => st.found);
    return steps[idx]?.found && idx > firstFoundIdx;
  }

  // Helper to get the index in the current array view (for recombining phase)
  function getRelativeIndex(idx, stepIdx) {
    if (!isExpanding(stepIdx)) return idx;
    return idx;
  }

  // --- Always show info for pivot if panel is open, even if not clicked ---
  function getPanelInfoForStep(stepIdx) {
  if (!steps.length) return null;
  const s = steps[stepIdx];
  if (!s) return null;
  const { low, mid, high, found, array } = s;
  const val = array[mid];

  // If found and in expanding phase, show only found message
  const firstFoundIdx = steps.findIndex(st => st.found);
  if (found && (stepIdx === firstFoundIdx || (stepIdx > firstFoundIdx && steps[stepIdx].found))) {
    // If in recombining phase (stepIdx > firstFoundIdx)
    if (stepIdx > firstFoundIdx) {
      return {
        found: true,
        foundMsg: `Target element ${val} found at index ${mid}.`,
        explanation: "Recombining discarded elements to show target number relative to original array"
      };
    }
    // Normal found message
    return {
      found: true,
      foundMsg: `Target element ${val} found at index ${mid}.`
    };
  }

  // Section 1: Pivot (middle element)
  const pivot = {
    value: array[mid],
    index: mid
  };

  // Section 2: Sides chosen
  let sides = '';
  if (array[mid] === target) {
    sides = `Pivot equals target.`;
  } else if (array[mid] > target) {
    sides = `Left side (indices ${low}–${mid - 1}) will be kept. Right side discarded.`;
  } else if (array[mid] < target) {
    sides = `Right side (indices ${mid + 1}–${high}) will be kept. Left side discarded.`;
  }

  // Section 3: Explanation
  let explanation = '';
  if (array[mid] === target) {
    explanation = `The middle element ${array[mid]} equals the target ${target}. Search complete!`;
  } else if (array[mid] > target) {
    explanation = `Since ${array[mid]} > ${target}, binary search continues with the left half (indices ${low}–${mid - 1}).`;
  } else {
    explanation = `Since ${array[mid]} < ${target}, binary search continues with the right half (indices ${mid + 1}–${high}).`;
  }

  return {
    found: false,
    pivot,
    sides,
    explanation
  };
}

  // When a cell is clicked, open the bottom panel and show info
  const handleCellClick = (idx) => {
    if (!steps.length) return;
    const s = steps[step];
    const { low, mid, high, found, array } = s;
    const val = array[idx];

    // If found and in expanding phase, show only found message
    if (found && (step === steps.findIndex(st => st.found) || isExpanding(step))) {
      setPanelInfo({
        found: true,
        foundMsg: `Target element ${val} found at index ${idx}.`
      });
      setSidePanelOpen(true);
      return;
    }

    // Section 1: Pivot (middle element)
    const pivot = {
      value: array[mid],
      index: getRelativeIndex(mid, step)
    };

    // Section 2: Sides chosen
    let sides = '';
    if (array[mid] === target) {
      sides = `Pivot equals target.`;
    } else if (array[mid] > target) {
      sides = `Left side (indices ${low}–${mid - 1}) will be kept. Right side discarded.`;
    } else if (array[mid] < target) {
      sides = `Right side (indices ${mid + 1}–${high}) will be kept. Left side discarded.`;
    }

    // Section 3: Explanation
    let explanation = '';
    if (array[mid] === target) {
      explanation = `The middle element ${array[mid]} equals the target ${target}. Search complete!`;
    } else if (array[mid] > target) {
      explanation = `Since ${array[mid]} > ${target}, binary search continues with the left half (indices ${low}–${mid - 1}).`;
    } else {
      explanation = `Since ${array[mid]} < ${target}, binary search continues with the right half (indices ${mid + 1}–${high}).`;
    }

    setPanelInfo({
      found: false,
      pivot,
      sides,
      explanation
    });
    setSidePanelOpen(true);
  };

  // --- Update panel info when step or sidePanelOpen changes ---
  useEffect(() => {
    if (sidePanelOpen && steps.length > 0) {
      setPanelInfo(getPanelInfoForStep(step));
    }
  }, [step, sidePanelOpen, steps, target]);

  // Close bottom panel when clicking outside (not on button or array group)
  useEffect(() => {
    if (!sidePanelOpen) return;
    function handleClick(e) {
      // If click is inside the panel
      if (panelRef.current && panelRef.current.contains(e.target)) {
        // If click is on a button or array group, do nothing
        if (
          e.target.closest('button') ||
          e.target.closest('.array-group')
        ) {
          return;
        }
        // Otherwise, close the panel
        setPanelInfo(null);
        setSidePanelOpen(false);
        return;
      }
      // If click is outside the panel, check if it's on a button or array group
      if (
        e.target.closest('button') ||
        e.target.closest('.array-group')
      ) {
        return;
      }
      setPanelInfo(null);
      setSidePanelOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sidePanelOpen]);

  const handleSubmit = e => {
    e.preventDefault();
    const { steps: b, target } = buildBinarySearchStepsRandom(Math.min(parseInt(size, 10), 25));
    setSteps(b); setTarget(target); setStep(0); setSubmitted(true);
    setPanelInfo(null);
    setSidePanelOpen(false);
  };

  const reset = () => { setSubmitted(false); setSteps([]); setTarget(null); setStep(0); setSize('10'); setPanelInfo(null); setSidePanelOpen(false); };

// Handler for custom input submit
const handleCustomInputSubmit = (e) => {
  e.preventDefault();
  setCustomInputError('');
  try {
    // Parse input like: 1,2,3,4,5 (3)
    const match = customInput.match(/^([^\(\)]*)(?:\(([^)]+)\))?$/);
    if (!match) throw new Error("Invalid input format");
    const arrStr = match[1].trim();
    const targetStr = match[2] ? match[2].trim() : null;

    const arr = arrStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(Number)
      .sort((a, b) => a - b);

    if (arr.some(isNaN)) throw new Error("Invalid input");
    if (arr.length < 2) throw new Error("Input must have at least 2 numbers");

    let chosenTarget;
    if (targetStr !== null && targetStr !== "") {
      chosenTarget = Number(targetStr);
      if (isNaN(chosenTarget) || !arr.includes(chosenTarget)) {
        throw new Error("Target must be a number present in the array.");
      }
    } else {
      // Pick a random target from the array
      chosenTarget = arr[Math.floor(Math.random() * arr.length)];
    }

    // Build steps for this array and target
    const { steps: b } = buildBinarySearchSteps(arr, chosenTarget);
    // Overwrite the array in all steps with the user's array
    b.forEach((step, i) => { step.array = [...arr]; });
    setSteps(b);
    setTarget(chosenTarget);
    setStep(0);
    setSubmitted(true);
    setPanelInfo(null);
    setSidePanelOpen(false);
    setCustomPanelOpen(false);
    setCustomInput('');
  } catch (err) {
    setCustomInputError(
      err.message ||
      'Please enter a comma-separated list of at least 2 integers, optionally with a target in brackets, e.g. 1,2,3,4,5 (3)'
    );
  }
};

  return (
      
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: '2rem',
        background: COLORS.background,
        position: "relative"
      }}
    >
      {/* Tutorial Pop-up */}
    {tutorialOpen && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.25)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "1rem",
            boxShadow: "0 2px 16px 0 rgba(33,150,243,0.18)",
            padding: "2rem 2.5rem",
            maxWidth: 420,
            width: "90%",
            textAlign: "center",
            border: "2px solid #2A2925",
            color: "#1e293b"
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.3rem" }}>
            {TUTORIAL_STEPS[tutorialStep].title}
          </h3>
          <p style={{ fontSize: "1.08rem", marginBottom: "2rem" }}>
            {TUTORIAL_STEPS[tutorialStep].content}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <button
              onClick={() => setTutorialStep(s => Math.max(0, s - 1))}
              disabled={tutorialStep === 0}
              style={{
                padding: "0.5rem 1.2rem",
                borderRadius: "0.7rem",
                border: "1px solid #2A2925",
                background: tutorialStep === 0 ? "#e5e7eb" : "#e0f2fe",
                color: tutorialStep === 0 ? "#888" : "#0077cc",
                cursor: tutorialStep === 0 ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "1rem"
              }}
            >
              Previous
            </button>
            {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
              <button
                onClick={() => setTutorialStep(s => s + 1)}
                style={{
                  padding: "0.5rem 1.2rem",
                  borderRadius: "0.7rem",
                  border: "1px solid #2A2925",
                  background: "#e0f2fe",
                  color: "#0077cc",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1rem"
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setTutorialOpen(false)}
                style={{
                  padding: "0.5rem 1.2rem",
                  borderRadius: "0.7rem",
                  border: "1px solid #2A2925",
                  background: "#dcfce7",
                  color: "#166534",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1rem"
                }}
              >
                Finish
              </button>
            )}
            <button
              onClick={() => setTutorialOpen(false)}
              style={{
                padding: "0.5rem 1.2rem",
                borderRadius: "0.7rem",
                border: "1px solid #2A2925",
                background: "#fef9c3",
                color: "#b45309",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem"
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
      {/* Switch in top-left, absolute */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          zIndex: 999
        }}
        title="Go to alternate view"
      >
        <Switch
        label={"Standard Mode"}
          checked={switchChecked}
          onChange={e => {
            setSwitchChecked(e.target.checked);
            if (e.target.checked) navigate('/sandbox2');
          }}
        />
      </div>
      {/* Home button in top-right, absolute */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          zIndex: 1000
        }}
      >
        <HomeButton onClick={() => navigate("/")} />
      </div>

        {/* Custom Input Side Panel Button (bottom right) */}
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 1200,
      }}
    >
      <button
        onClick={() => setCustomPanelOpen(true)}
        style={{
          background: "#ede9fe",
          color: "#7c3aed",
          border: "2px solid #7c3aed",
          borderRadius: "2rem",
          padding: "0.7rem 1.5rem",
          fontWeight: "bold",
          fontSize: "1rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        Custom Array
      </button>
    </div>
    {/* Custom Input Side Panel */}
    {customPanelOpen && (
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 1300,
          background: "#fff",
          border: "2px solid #B0ADA8",
          borderRadius: "1rem",
          boxShadow: "0 2px 16px 0 rgba(33,150,243,0.18)",
          padding: "2rem 2.5rem",
          minWidth: 320,
          maxWidth: "90vw",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.2rem" }}>
          Enter a comma-separated array
        </h3>
        <form onSubmit={handleCustomInputSubmit} style={{ width: "100%" }}>
          <Input
  type="text"
  value={customInput}
  onChange={e => setCustomInput(e.target.value)}
  placeholder="e.g. 5, 2, 9, 1 (9)"
  style={{ width: "100%", marginBottom: "1rem" }}
/>
{customInputError && (
  <div style={{ color: "#b91c1c", marginBottom: "0.5rem", fontSize: "0.98rem" }}>
    {customInputError}
  </div>
)}
<div style={{ color: "#888", fontSize: "0.98rem", marginBottom: "0.5rem" }}>
  Format: numbers separated by commas, optional target in brackets. Example: <b>1,2,3,4,5 (3)</b>
</div>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button
              type="submit"
              style={{
                padding: "0.5rem 1.2rem",
                borderRadius: "0.7rem",
                border: "1px solid #2A2925",
                background: "#e0f2fe",
                color: "#0077cc",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem"
              }}
            >
              Use Array
            </button>
            <button
              type="button"
              onClick={() => setCustomPanelOpen(false)}
              style={{
                padding: "0.5rem 1.2rem",
                borderRadius: "0.7rem",
                border: "1px solid #2A2925",
                background: "#fef9c3",
                color: "#b45309",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem"
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )}
      <div style={{ width: "100%", maxWidth: 900 }}>
        {/* Centered Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
            width: "100%",
          }}
        >
          <h1 style={{
            textAlign: "center",
            margin: 0,
            fontSize: "2rem",
            color: "#222",
            fontFamily: "inherit",
            fontWeight: 700
          }}>
            Binary Search Visualizer
          </h1>
        </div>
        {/* Input Form */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              marginBottom: "1.5rem"
            }}
          >
            <label style={{ margin: 0, fontWeight: 500 }}>
              Enter array size:
            </label>
            <Input
              value={size}
              onChange={e => {
                let v = e.target.value === '' ? '' : Math.max(2, Math.min(25, parseInt(e.target.value, 10))).toString();
                setSize(v);
              }}
              type="number"
              min="2"
              max="25"
              required
              placeholder="Array size..."
              style={{ margin: 0 }}
            />
            <ProgressButton type="submit">Start</ProgressButton>
          </form>
        ) : (
          <>
            {/* Step Buttons */}
            <div style={{ marginTop: '2rem', display: "flex", justifyContent: "center", gap: "1rem" }}>
              <ProgressButton
                disabled={step === steps.length - 1}
                onClick={() => setStep(p => p + 1)}
              >
                Next Step
              </ProgressButton>
              <ProgressButton
                disabled={step === 0}
                onClick={() => setStep(p => p - 1)}
              >
                Previous Step
              </ProgressButton>
              <ProgressButton onClick={() => setStep(steps.length - 1)}
                disabled={step === steps.length - 1}>
                Complete visualisation
              </ProgressButton>
              <ProgressButton onClick={reset}>
                Generate New Array
              </ProgressButton>
            </div>
            {/* Target Box */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              margin: "2rem 0 1.5rem 0"
            }}>
              <div
                style={{
                  background: COLORS.infoSectionBg,
                  border: `1.5px solid ${COLORS.borderDark}`,
                  borderRadius: "10px",
                  padding: "0.75rem 2rem",
                  minWidth: 180,
                  textAlign: "center",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  color: "#222",
                  boxShadow: "0 2px 8px #0001"
                }}
              >
                <strong>Target:</strong> {target}
              </div>
            </div>
            {/* Array Visualization */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: 'max-content' }}>
                <div style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
                  {steps[step].array.map((val, idx) => {
                    const { backgroundColor, overlay } = getBoxVisuals(idx, steps[step]);
                    return (
                      <div
                        key={idx}
                        style={{ ...boxStyle, backgroundColor }}
                        onClick={() => handleCellClick(idx)}
                      >
                        {val}
                        {overlay}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Bottom Panel */}
      <AnimatePresence>
        {sidePanelOpen && (
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
              background: COLORS.background,
              color: "#2A2925",
              borderTop: `2px solid ${COLORS.borderDark}`,
              boxShadow: "0 -2px 10px #0002",
              minHeight: 320,
              position: "fixed",
              left: 0,
              bottom: 0,
              zIndex: 99,
              padding: "2rem 5rem 2rem 1.5rem",
              display: "flex",
              flexDirection: "row",
              alignItems: "stretch",
              gap: 0,
              overflow: "hidden"
            }}
          >
            {/* Pivot Section */}
            <div style={{
              flex: 1,
              paddingRight: "1.5rem",
              borderRight: `1.5px solid ${COLORS.borderLight}`,
              display: "flex",
              flexDirection: "column"
            }}>
              <h4 style={{ marginTop: 0, color: COLORS.sectionTitle, fontSize: "1.1rem", fontWeight: 700 }}>
                Pivot
              </h4>
              {!panelInfo ? (
                <p style={{ color: "#888", textAlign: "center" }}>
                  Click on an array cell to see information about it
                </p>
              ) : panelInfo.found ? (
                <p style={{ color: "#388e3c", fontWeight: "bold", fontSize: "1.1rem", textAlign: "center" }}>
                  {panelInfo.foundMsg}
                </p>
              ) : (
                <p>
                  Value: <strong>{panelInfo.pivot.value}</strong><br />
                  Index: <strong>{panelInfo.pivot.index}</strong>
                </p>
              )}
            </div>
            {/* Sides Chosen Section */}
            <div style={{
              flex: 1,
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
              borderRight: `1.5px solid ${COLORS.borderLight}`,
              display: "flex",
              flexDirection: "column"
            }}>
              <h4 style={{ marginTop: 0, color: COLORS.sectionTitle, fontSize: "1.1rem", fontWeight: 700 }}>
                Sides Chosen
              </h4>
              {!panelInfo || panelInfo.found ? (
                <p style={{ color: "#888", textAlign: "center" }}>
                  {panelInfo?.found ? "" : "Click on an array cell to see information about it"}
                </p>
              ) : (
                <p>{panelInfo.sides}</p>
              )}
            </div>
            {/* Explanation Section */}
            <div style={{
  flex: 1,
  paddingLeft: "1.5rem",
  display: "flex",
  flexDirection: "column"
}}>
  <h4 style={{ marginTop: 0, color: COLORS.sectionTitle, fontSize: "1.1rem", fontWeight: 700 }}>
    Explanation
  </h4>
  {panelInfo && panelInfo.explanation ? (
    <p style={{ whiteSpace: "pre-line" }}>{panelInfo.explanation}</p>
  ) : (
    <p style={{ color: "#888", textAlign: "center" }}>
      {panelInfo?.found ? "" : "Click on an array cell to see information about it"}
    </p>
  )}
</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}