import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import Switch from "../Switch";
import HomeButton from "../HomeButton"; // Add this import at the top
import ProgressButton from "../ProgressButton"; // Add this import at the top
import Input from "../Input";

// Color palette
const COLORS = {
  background: "#F9F6F2", // Main page background
  arrayBoxBg: "rgb(192, 231, 241)", // Array group box background
  arrayContainerBg: "rgb(229, 226, 221)", // Array group container background
  infoSectionBg: "#f9f9f9", // Info section background
  borderDark: "#2A2925", // Dark border
  borderLight: "#B0ADA8", // Light border for dividers
  sectionTitle: "#3b4252", // Section title color
};

const boxStyle = {
  width: '40px',
  height: '40px',
  lineHeight: '40px',
  textAlign: 'center',
  border: `1px solid ${COLORS.borderDark}`,
  borderRadius: '4px',
  backgroundColor: COLORS.arrayBoxBg,
  color: "#222",
  fontWeight: 600,
  fontSize: "1rem",
  marginRight: '0.3rem',
  marginBottom: '0.3rem'
};


let idCounter = 0;

function createId() {
  return `id_${idCounter++}`;
}

function getInitialArray(size = 8) {
  const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
  return [{ id: createId(), values: arr, history: null }];
}

function splitArray(arrObj) {
  const arr = arrObj.values;
  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);
  return [
    { id: createId(), values: left, history: { type: "split", from: arrObj } },
    { id: createId(), values: right, history: { type: "split", from: arrObj } }
  ];
}

function mergeArrays(arrObj1, arrObj2) {
  const arr1 = arrObj1.values;
  const arr2 = arrObj2.values;
  const merged = [];
  let i = 0, j = 0;
  while (i < arr1.length && j < arr2.length) {
    if (arr1[i] < arr2[j]) merged.push(arr1[i++]);
    else merged.push(arr2[j++]);
  }
  const result = merged.concat(arr1.slice(i)).concat(arr2.slice(j));
  return {
    id: createId(),
    values: result,
    history: { type: "merge", from: [arrObj1, arrObj2] }
  };
}

function isSorted(arr) {
  for (let i = 1; i < arr.length; ++i) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}

function ArrayGroup({ values, label, children, onClick, className }) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "0.5rem",
        position: "relative",
        cursor: onClick ? "pointer" : "default"
      }}
      onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {label && <span style={{ fontWeight: 600, marginRight: 8 }}>{label}</span>}
        {values.map((num, i) => (
          <div key={i} style={boxStyle}>{num}</div>
        ))}
      </div>
      <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
        {children}
      </div>
    </div>
  );
}

export default function InteractiveMergeSort() {
  const navigate = useNavigate();
  const [originalSize, setOriginalSize] = useState(8);
  const [arrays, setArrays] = useState(() => {
    idCounter = 0;
    return getInitialArray(8);
  });
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const [panelOriginal, setPanelOriginal] = useState([]);
  const [panelResult, setPanelResult] = useState([]);
  const [panelExplanation, setPanelExplanation] = useState("");

  const panelRef = useRef(null);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [customPanelOpen, setCustomPanelOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customInputError, setCustomInputError] = useState('');
  const [tutorialOpen, setTutorialOpen] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);

  const TUTORIAL_STEPS = [
    {
      title: "Explorative Merge Sort",
      content:
        "This page lets you explore how Merge Sort works step by step. Each array group can be divided into smaller groups or combined with another group independently."
    },
    {
      title: "Dividing Arrays",
      content:
        "Click the ÷ button on any group to split it into two smaller groups. Keep dividing until you reach groups of one element."
    },
    {
      title: "Combining Arrays",
      content:
        "Click the X button to combine two groups of the same size. The groups will be merged and sorted, simulating the 'conquer' and 'combine' step of Merge Sort."
    },
    {
      title: "Custom Arrays",
      content:
        "Use the 'Custom Array' button at the bottom right to enter your own numbers and see how Merge Sort works on your data."
    },
    {
      title: "Bottom Panel",
      content:
        "Click on any group to see how it was formed: whether by splitting or combining. The bottom panel shows the original and result arrays for each operation."
    }
  ];


  // Show formation history when array group is clicked
  const handleArrayGroupClick = (arrValues) => {
    const arrObj = arrays.find(a => a.values === arrValues) || arrays.find(a => JSON.stringify(a.values) === JSON.stringify(arrValues));
    if (!arrObj || !arrObj.history) {
      setPanelOriginal([]);
      setPanelResult([arrValues]);
      setPanelExplanation(`This array was not formed by a split or combine operation.`);
      setSidePanelOpen(true);
      return;
    }
    if (arrObj.history.type === "split") {
      setPanelOriginal([arrObj.history.from.values]);
      setPanelResult([arrObj.values]);
      setPanelExplanation(
        `This array was formed by splitting the original array [${arrObj.history.from.values.join(', ')}] into [${arrObj.values.join(', ')}].`
      );
    } else if (arrObj.history.type === "merge") {
      setPanelOriginal([arrObj.history.from[0].values, arrObj.history.from[1].values]);
      setPanelResult([arrObj.values]);
      setPanelExplanation(
        `This array was formed by combining arrays [${arrObj.history.from[0].values.join(', ')}] and [${arrObj.history.from[1].values.join(', ')}].`
      );
    }
    setSidePanelOpen(true);
  };

  // Divide
  const handleDivide = (id) => {
    setArrays(prev => {
      const idx = prev.findIndex(a => a.id === id);
      if (idx === -1 || prev[idx].values.length <= 1) return prev;
      const [leftObj, rightObj] = splitArray(prev[idx]);
      const newArrs = [
        ...prev.slice(0, idx),
        leftObj,
        rightObj,
        ...prev.slice(idx + 1)
      ];
      setPanelOriginal([prev[idx].values]);
      setPanelResult([leftObj.values, rightObj.values]);
      setPanelExplanation(
        `Divided [${prev[idx].values.join(', ')}] into [${leftObj.values.join(', ')}] and [${rightObj.values.join(', ')}].`
      );
      return newArrs;
    });
    setSidePanelOpen(true);
  };



  // Combine
  const handleCombine = (id) => {
    setArrays(prev => {
      const idx = prev.findIndex(a => a.id === id);
      if (idx === -1) return prev;
      const arrObj1 = prev[idx];

      const leftIdx = idx > 0 ? idx - 1 : null;
      const rightIdx = idx < prev.length - 1 ? idx + 1 : null;

      let neighborIdx = null;
      if (leftIdx !== null && prev[leftIdx].values.length === arrObj1.values.length) {
        neighborIdx = leftIdx;
      } else if (rightIdx !== null && prev[rightIdx].values.length === arrObj1.values.length) {
        neighborIdx = rightIdx;
      } else if (leftIdx !== null && rightIdx !== null) {
        neighborIdx = prev[leftIdx].values.length <= prev[rightIdx].values.length ? leftIdx : rightIdx;
      } else if (leftIdx !== null) {
        neighborIdx = leftIdx;
      } else if (rightIdx !== null) {
        neighborIdx = rightIdx;
      } else {
        return prev;
      }

      const arrObj2 = prev[neighborIdx];
      if (arrObj1.values.length === originalSize || arrObj2.values.length === originalSize) return prev;

      const first = Math.min(idx, neighborIdx);
      const second = Math.max(idx, neighborIdx);
      const mergedObj = mergeArrays(prev[first], prev[second]);
      const newArrs = [
        ...prev.slice(0, first),
        mergedObj,
        ...prev.slice(second + 1)
      ];
      setPanelOriginal([prev[first].values, prev[second].values]);
      setPanelResult([mergedObj.values]);
      setPanelExplanation(
        `Combined [${prev[first].values.join(', ')}] and [${prev[second].values.join(', ')}] into [${mergedObj.values.join(', ')}]. ` +
        (isSorted(mergedObj.values) ? "The resulting array is sorted." : "The resulting array is not sorted. Try dividing it to the base case.")
      );
      return newArrs;
    });
    setSidePanelOpen(true);
  };

  // Reset
  const handleReset = () => {
    idCounter = 0;
    setArrays(getInitialArray(originalSize));
    setPanelOriginal([]);
    setPanelResult([]);
    setPanelExplanation("");
    setSidePanelOpen(false);
  };

  // Close panel if clicking outside (not on array group or buttons)
  React.useEffect(() => {
    if (!sidePanelOpen) return;
    function handleClick(e) {
      if (panelRef.current && panelRef.current.contains(e.target)) {
        if (
          e.target.closest('.array-group') ||
          e.target.closest('button')
        ) {
          return;
        }
      }
      setSidePanelOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sidePanelOpen]);

  const handleCustomInputSubmit = (e) => {
    e.preventDefault();
    setCustomInputError('');
    try {
      const arr = customInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(Number);
      if (arr.some(isNaN)) throw new Error("Invalid input");
      if (arr.length === 0) throw new Error("Input cannot be empty");
      setOriginalSize(arr.length);
      idCounter = 0;
      setArrays([{ id: createId(), values: arr, history: null }]);
      setPanelOriginal([]);
      setPanelResult([]);
      setPanelExplanation("");
      setSidePanelOpen(false);
      setCustomPanelOpen(false);
      setCustomInput('');
    } catch {
      setCustomInputError('Please enter a comma-separated list of integers.');
    }
  };


  return (
  <div style={{
    display: "flex",
    minHeight: "100vh",
    background: COLORS.background,
    overflow: "hidden",
    position: "relative"
  }}>

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
      label={"Explorative Mode"}
        checked={switchChecked}
        onChange={e => {
          setSwitchChecked(e.target.checked);
          if (!e.target.checked) navigate('/merge-sort');
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
            placeholder="e.g. 5, 2, 9, 1"
            style={{ width: "100%", marginBottom: "1rem" }}
          />
          {customInputError && (
            <div style={{ color: "#b91c1c", marginBottom: "0.5rem", fontSize: "0.98rem" }}>
              {customInputError}
            </div>
          )}
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
    <div style={{ flex: 1, padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
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
          Visualising Merge Sort (Explorative)
        </h1>
      </div>
      {/* Centered Reset Button */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
        <ProgressButton onClick={handleReset}>
          Generate New Array
        </ProgressButton>
      </div>
      <div style={{
        display: "flex",
        gap: "2rem",
        justifyContent: "center",
        marginBottom: "1.5rem"
      }}>
        {arrays.map((arr, idx) => (
          <motion.div
            key={arr.id}
            whileHover={{ scale: 1.08 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.2rem",
              padding: "0.5rem",
              border: `1.5px solid ${COLORS.borderDark}`,
              borderRadius: "6px",
              backgroundColor: COLORS.arrayContainerBg,
              cursor: "pointer",
              position: "relative"
            }}
          >
            <ArrayGroup
              values={arr.values}
              onClick={() => handleArrayGroupClick(arr.values)}
              className="array-group"
            >
              <button
                onClick={e => { e.stopPropagation(); handleDivide(arr.id); }}
                title="Divide"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: `1px solid ${COLORS.borderDark}`,
                  background: COLORS.arrayContainerBg,
                  color: COLORS.borderDark,
                  fontWeight: "bold",
                  fontSize: "1rem",
                  padding: 0,
                  marginBottom: 2,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <span style={{ fontSize: "1.1em" }}>÷</span>
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleCombine(arr.id); }}
                title="Combine"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: `1px solid ${COLORS.borderDark}`,
                  background: COLORS.arrayContainerBg,
                  color: COLORS.borderDark,
                  fontWeight: "bold",
                  fontSize: "1rem",
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <span style={{ fontSize: "1.1em" }}>X</span>
              </button>
            </ArrayGroup>
          </motion.div>
        ))}
      </div>
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
          {/* Original Array Section */}
          <div style={{
            flex: 1,
            paddingRight: "1.5rem",
            borderRight: `1.5px solid ${COLORS.borderLight}`,
            display: "flex",
            flexDirection: "column"
          }}>
            <h4 style={{ marginTop: 0, color: COLORS.sectionTitle, fontSize: "1.1rem", fontWeight: 700 }}>
              Original Array{panelOriginal.length > 1 ? " Groups" : ""}
            </h4>
            {panelOriginal.length === 0 && <p>No action yet.</p>}
            {panelOriginal.length === 2 ? (
              <>
                <ArrayGroup values={panelOriginal[0]} label="Left:" />
                <ArrayGroup values={panelOriginal[1]} label="Right:" />
              </>
            ) : (
              panelOriginal.map((arr, i) => (
                <ArrayGroup key={i} values={arr} />
              ))
            )}
          </div>
          {/* Result Array Section */}
          <div style={{
            flex: 1,
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
            borderRight: `1.5px solid ${COLORS.borderLight}`,
            display: "flex",
            flexDirection: "column"
          }}>
            <h4 style={{ marginTop: 0, color: COLORS.sectionTitle, fontSize: "1.1rem", fontWeight: 700 }}>
              Result Array{panelResult.length > 1 ? " Groups" : ""}
            </h4>
            {panelResult.length === 0 && <p>No result yet.</p>}
            {panelResult.length === 2 ? (
              <>
                <ArrayGroup values={panelResult[0]} label="Left:" />
                <ArrayGroup values={panelResult[1]} label="Right:" />
              </>
            ) : (
              panelResult.map((arr, i) => (
                <ArrayGroup key={i} values={arr} />
              ))
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
              What Happened
            </h4>
            <p>{panelExplanation || "No action yet."}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
}