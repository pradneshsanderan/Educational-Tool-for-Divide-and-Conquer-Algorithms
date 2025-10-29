import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import Switch from "../Switch"; // Add this import at the top with others
import HomeButton from "../HomeButton";
import ProgressButton from "../ProgressButton"; // Add this import at the top with others
import Input from "../Input"; // Add this import at the top with others



const boxStyle = {
  width: '40px',
  height: '40px',
  lineHeight: '40px',
  textAlign: 'center',
  border: '1px solid #2A2925',
  borderRadius: '4px',
  backgroundColor: 'rgb(192, 231, 241)',
};



const TUTORIAL_STEPS = [
  {
    title: "Exploring mode switch",
    content: "The button in the top left toggles to an explorative version of the visualizer. "
  },
  {
    title: "Bottom Panel",
    content: "The bottom panel shows details about the selected array group. Click on an array group to see details about it."
  },
  {
    title: "Custom Input",
    content: "The custom input field allows you to enter your own array of integers. Enter a comma-separated list of integers and click 'Submit'."
  }
];


const getMergeSortStepsLevelWise = (arr) => {
  const steps = [];
  const metaMap = {};
  let idCounter = 0;

  function createId() {
    return `id_${idCounter++}`;
  }

  function cloneWithId(group, source = null, type = null) {
    const id = createId();
    metaMap[id] = { array: group, formedBy: source, type };
    return { id, group };
  }

  steps.push([cloneWithId(arr.slice())]);

  // Split Phase
  let current = [cloneWithId(arr.slice())];
  while (current.some(({ group }) => group.length > 1)) {
    const next = [];
    for (const { group, id: parentId } of current) {
      if (group.length <= 1) {
        next.push(cloneWithId(group, [parentId], 'carry'));
      } else {
        const mid = Math.floor(group.length / 2);
        const left = group.slice(0, mid);
        const right = group.slice(mid);
        next.push(cloneWithId(left, [parentId], 'split'));
        next.push(cloneWithId(right, [parentId], 'split'));
      }
    }
    steps.push(next);
    current = next;
  }

  // Merge Phase
  while (current.length > 1) {
    const next = [];
    for (let i = 0; i < current.length; i += 2) {
      if (i + 1 < current.length) {
        const { result: merged, trace } =
        merge(current[i].group, current[i + 1].group);
        const mergedNode = cloneWithId(merged, [current[i].id, current[i + 1].id], 'merge');
        metaMap[mergedNode.id].trace = trace;
        next.push(mergedNode);
      } else {
        next.push(cloneWithId(current[i].group, [current[i].id], 'carry'));
      }
    }
    steps.push(next);
    current = next;
  }

  function merge(left, right) {
    const result = [];
    const trace   = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
      const a = left[i], b = right[j];
      const pick = a < b ? a : b;
      trace.push({ compared: [a, b], picked: pick });

      if (a < b) { result.push(left[i++]); }
      else       { result.push(right[j++]); }
    }
    result.push(...left.slice(i), ...right.slice(j));
    return { result, trace };
  }

  return { steps, metaMap };
};

function getHalfDirection(parentArr, childArr) {
  const mid = Math.floor(parentArr.length / 2);
  const left  = parentArr.slice(0, mid).toString();
  return childArr.toString() === left ? -1 : 1;
}

function ArrayGroup({ values, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }} className="array-group">
      {label && <span style={{ fontWeight: 600, marginRight: 8 }}>{label}</span>}
      {values.map((num, i) => (
        <div key={i} style={boxStyle}>{num}</div>
      ))}
    </div>
  );
}

const Visualizer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const algorithm = location.state?.algorithm || 'merge-sort';

  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [panelInfo, setPanelInfo] = useState(null);

  const [arraySize, setArraySize] = useState('10');
  const [submittedSize, setSubmittedSize] = useState(null);
  const [steps, setSteps] = useState([]);
  const [metaMap, setMetaMap] = useState({});
  const [step, setStep] = useState(0);
const [switchChecked, setSwitchChecked] = useState(false);
const [tutorialOpen, setTutorialOpen] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
const [customPanelOpen, setCustomPanelOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customInputError, setCustomInputError] = useState('');



  // --- Tutorial Logic ---
  const panelRef = useRef(null);

  const handleSizeSubmit = (e) => {
    e.preventDefault();
    const size = parseInt(arraySize, 10);
    const randomArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    setSubmittedSize(size);
    const { steps: mergeSteps, metaMap } = getMergeSortStepsLevelWise(randomArray);
    setSteps(mergeSteps);
    setMetaMap(metaMap);
    setStep(0);
  };


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
      setSubmittedSize(arr.length);
      const { steps: mergeSteps, metaMap } = getMergeSortStepsLevelWise(arr);
      setSteps(mergeSteps);
      setMetaMap(metaMap);
      setStep(0);
      setPanelInfo(null);
      setSidePanelOpen(false);
      setCustomPanelOpen(false);
      setCustomInput('');
    } catch {
      setCustomInputError('Please enter a comma-separated list of integers.');
    }
  };

  // --- Side Panel Info Logic ---
  const handleArrayClick = (id) => {
    const meta = metaMap[id];
    if (!meta) return;

    let original = [];
    let result = [];
    let explanation = "";

    // If formed by splitting (type === 'split')
    if (meta.type === 'split') {
      // The parent array before split
      const parentArr = metaMap[meta.formedBy[0]].array;
      original = [parentArr];

      // Always reconstruct left and right from the parent array
      const mid = Math.floor(parentArr.length / 2);
      const left = parentArr.slice(0, mid);
      const right = parentArr.slice(mid);
      result = [left, right];
      explanation =
        `Split [${parentArr.join(', ')}] into:\n` +
        `[${left.join(', ')}] (left)\n` +
        `[${right.join(', ')}] (right)`;
    }
    // If formed by merging (type === 'merge')
    else if (meta.type === 'merge') {
      const left = metaMap[meta.formedBy[0]].array;
      const right = metaMap[meta.formedBy[1]].array;
      original = [left, right];
      result = [meta.array];
      explanation = `Joined [${left.join(', ')}] and [${right.join(', ')}] to create [${meta.array.join(', ')}].`;
    }
    // If carried (type === 'carry')
    else if (meta.type === 'carry') {
      const prev = metaMap[meta.formedBy[0]].array;
      original = [prev];
      result = [meta.array];
      explanation = `Carried forward [${meta.array.join(', ')}].`;
    }
    // For root/base: show only itself
    else {
      original = [];
      result = [meta.array];
      explanation = `Initial array [${meta.array.join(', ')}].`;
    }

    setPanelInfo({ original, result, explanation });
    setSidePanelOpen(true);
  };

  const handlePrevious = () => setStep((prev) => Math.max(prev - 1, 0));
  const handleNext = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleComplete = () => setStep(steps.length - 1);
  const handleNewArray = () => {
    setArraySize('');
    setSubmittedSize(null);
    setSteps([]);
    setMetaMap({});
    setStep(0);
    setPanelInfo(null);
    setSidePanelOpen(false);
  };
  const handleGoHome = () => navigate('/');

  const getArraysByType = (idx) => {
    if (!steps.length || idx >= steps.length) {
      return { dividing: [], conquering: [], combining: [] };
    }

    const dividing   = [];
    const conquering = [];
    const combining  = [];

    steps[idx].forEach(({ id }) => {
      const meta = metaMap[id];
      if (!meta) return;

      if (meta.type === 'merge') {
        combining.push(meta.array);
      } else if (meta.type === 'carry' || meta.array.length === 1) {
        conquering.push(meta.array);
      } else {
        dividing.push(meta.array);
      }
    });

    return { dividing, conquering, combining };
  };

  // Close bottom panel when clicking outside (not on array group or button)
  useEffect(() => {
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
      setPanelInfo(null);
      setSidePanelOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sidePanelOpen]);

  const { dividing, conquering, combining } = getArraysByType(step);

  return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: '2rem',
      background: "#F9F6F2",
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

    {/* Toggle-style button in top-left that navigates to another page */}
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
        checked={switchChecked}
        label={"Standard Mode"}
        onChange={e => {
          setSwitchChecked(e.target.checked);
          if (e.target.checked) navigate('/sandbox');
        }}
      />
    </div>
    {/* Home button in top-right corner */}
    <div
      style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        zIndex: 1000
      }}
    >
      <HomeButton onClick={handleGoHome} />
    </div>
    <div style={{ width: "100%", maxWidth: 900 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
          width: "100%",
        }}
      >
        <h1 style={{ textAlign: "center", margin: 0, fontSize: "2rem" }}>
          Visualizing Merge Sort
        </h1>
      </div>

      {!submittedSize && (
        <form
          onSubmit={handleSizeSubmit}
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
            value={arraySize}
            onChange={e => setArraySize(e.target.value)}
            type="number"
            min="1"
            required
            placeholder="Array size..."
            style={{ margin: 0 }}
          />
          <ProgressButton type="submit">Start</ProgressButton>
        </form>
      )}

      {submittedSize && (
        <>
          <div style={{ marginTop: '2rem', display: "flex", justifyContent: "center", gap: "1rem" }}>
            <ProgressButton onClick={handleNext}
            disabled={step === steps.length - 1}>Next Step</ProgressButton>
            <ProgressButton onClick={handlePrevious}
            disabled={step === 0}>Previous Step</ProgressButton>
            <ProgressButton onClick={handleComplete}
            disabled={step === steps.length - 1}>Complete visualisation</ProgressButton>
            <ProgressButton onClick={handleNewArray}>Generate New Array</ProgressButton>
          </div>

          <div style={{ marginTop: '2rem', textAlign: "center" }}>
            <div style={{ padding: '1rem', border: '0px solid #ccc', marginTop: '1rem', display: "flex", flexDirection: "column", alignItems: "center" }}>
              {steps.length > 0 ? (
                <>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: "center" }}>
                    <AnimatePresence mode="popLayout">
                      {steps[step].map(({ id, group, formedBy }, groupIdx) => {
                        let slideX = 0;
                        if (metaMap[id]?.type === "split" && formedBy) {
                          const parentArray = metaMap[formedBy[0]].array;
                          slideX = 60 * getHalfDirection(parentArray, group);
                        }

                        return (
                          <motion.div
                            key={id || groupIdx}
                            initial={{ opacity: 0, x: 0 }}
                            animate={{ opacity: 1, x: slideX }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.45 }}
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              padding: "0.5rem",
                              border: "1.5px solid #2A2925",
                              borderRadius: "6px",
                              backgroundColor: "rgb(229, 226, 221)",
                              cursor: id ? "pointer" : "default",
                            }}
                            onClick={() => id && handleArrayClick(id)}
                          >
                            {group.map((num, numIdx) => (
                              <div
                                key={numIdx}
                                style={boxStyle}
                              >
                                {num}
                              </div>
                            ))}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </>
              ) : <p>Loading steps...</p>}
            </div>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            border: '1.5px solid #2A2925',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
            justifyContent: "center",
            textAlign: "center"
          }}>
            <div>
              <h4>Dividing (Split)</h4>
              {dividing.length > 0 ? (
                dividing.map((arr, i) => <p key={i}>[{arr.join(', ')}]</p>)
              ) : <p><i>None</i></p>}
            </div>

            <div>
              <h4>Conquering (Carry)</h4>
              {conquering.length > 0 ? (
                conquering.map((arr, i) => <p key={i}>[{arr.join(', ')}]</p>)
              ) : <p><i>None</i></p>}
            </div>

            <div>
              <h4>Combining (Merge)</h4>
              {combining.length > 0 ? (
                combining.map((arr, i) => <p key={i}>[{arr.join(', ')}]</p>)
              ) : <p><i>None</i></p>}
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
            background: "#F9F6F2",
            color: "	#2A2925",
            borderTop: "2px solid 	#2A2925",
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
            borderRight: "1.5px solid 	#B0ADA8",
            display: "flex",
            flexDirection: "column"
          }}>
            <h4 style={{ marginTop: 0, color: "	#3b4252" }}>Original Array{panelInfo?.original?.length > 1 ? "s" : ""}</h4>
            {panelInfo?.original?.length === 0 && <p>No action yet.</p>}
            {panelInfo?.original?.length === 2 ? (
              <>
                <ArrayGroup values={panelInfo.original[0]} label="Left:" />
                <ArrayGroup values={panelInfo.original[1]} label="Right:" />
              </>
            ) : (
              panelInfo?.original?.map((arr, i) => (
                <ArrayGroup key={i} values={arr} />
              ))
            )}
          </div>
          {/* Result Array Section */}
          <div style={{
            flex: 1,
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
            borderRight: "1.5px solid #B0ADA8",
            display: "flex",
            flexDirection: "column"
          }}>
            <h4 style={{ marginTop: 0, color: "	#3b4252" }}>Result Array{panelInfo?.result?.length > 1 ? "s" : ""}</h4>
            {panelInfo?.result?.length === 0 && <p>No result yet.</p>}
            {panelInfo?.result?.length === 2 ? (
              <>
                <ArrayGroup values={panelInfo.result[0]} label="Left:" />
                <ArrayGroup values={panelInfo.result[1]} label="Right:" />
              </>
            ) : (
              panelInfo?.result?.map((arr, i) => (
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
            <h4 style={{ marginTop: 0, color: "	#3b4252" }}>What Happened</h4>
            <p>{panelInfo?.explanation || "No action yet."}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
};

export default Visualizer;