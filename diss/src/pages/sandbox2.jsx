import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Switch from "../Switch";
import HomeButton from "../HomeButton";
import ProgressButton from "../ProgressButton";
import Input from "../Input"; 
// --- Style constants to match BinarySearchViz.jsx ---
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
  background: COLORS.arrayBoxBg,
  color: "#222",
  fontWeight: 600,
  fontSize: "1rem",
  fontFamily: "inherit",
  position: 'relative',
  cursor: 'pointer',
  marginRight: '0.3rem',
  marginBottom: '0.3rem',
  transition: "background 0.2s, color 0.2s"
};

export default function BinarySearchExploration() {
  const navigate = useNavigate();
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState(null);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selectedPivot, setSelectedPivot] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [history, setHistory] = useState([]);
  const [undoState, setUndoState] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(true);
    const [customPanelOpen, setCustomPanelOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customInputError, setCustomInputError] = useState('');
const [tutorialOpen, setTutorialOpen] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);


  function generateSortedArray(size) {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    return arr.sort((a, b) => a - b);
  }


  const TUTORIAL_STEPS = [
    {
      title: "Exploration Mode",
      content: "This is the interactive exploration mode for binary search. In a real binary search, the computer doesn't know all the numbers in advance.It can only reveal values by checking specific positions. To simulate this, the numbers are hidden until you choose a pivot to inspect."
    },
    {
      title: "Custom Array Input",
      content: "Use the 'Custom Array' button at the bottom right to enter your own array and (optionally) a target in brackets."
    },
    {
      title: "How it works",
      content: "Click on any cell to select it as the pivot. Then, choose whether to search left or right. Try to find the target value using as few steps as possible."
    },
    {
      title: "Undo & History",
      content: "If you make a mistake, use the Undo button. The search history box shows your previous moves and whether they were correct."
    }
  ];

  const generateNewGame = () => {
    const newArray = generateSortedArray(15);
    const newTarget = newArray[Math.floor(Math.random() * newArray.length)];
    setArray(newArray);
    setTarget(newTarget);
    setLow(0);
    setHigh(newArray.length - 1);
    setMessage('');
    setMessageType('');
    setSelectedPivot(null);
    setGameOver(false);
    setHistory([]);
    setUndoState(null);
    setShowUndo(false);
  };

  const handlePivotClick = (index) => {
    if (gameOver || index < low || index > high) return;
    setSelectedPivot(index);
    const pivotVal = array[index];

    if (pivotVal === target) {
      setMessage("You have found the target value. Game over");
      setMessageType('correct');
      setGameOver(true);
      setShowUndo(false);
    } else {
      setMessage(`You selected index ${index}. The value is ${pivotVal}. Which side do you want to search?`);
      setMessageType('');
      setShowUndo(false);
    }
  };

  const handleDirection = (dir) => {
    if (selectedPivot == null || gameOver) return;
    const pivotVal = array[selectedPivot];
    let correct = false;

    setUndoState({
      low,
      high,
      selectedPivot,
      message,
      messageType,
      gameOver,
      history: [...history],
    });

    if ((pivotVal > target && dir === 'left') || (pivotVal < target && dir === 'right')) {
      correct = true;
    }

    const newLow = dir === 'left' ? low : selectedPivot + 1;
    const newHigh = dir === 'left' ? selectedPivot - 1 : high;

    setLow(newLow);
    setHigh(newHigh);
    setSelectedPivot(null);
    setHistory([...history, { pivot: selectedPivot, dir, correct }]);

    if (newLow > newHigh) {
      setMessage(`No more elements to search. Target ${target} not found.`);
      setMessageType('wrong');
      setGameOver(true);
      setShowUndo(false);
    } else {
      setMessage(correct ? `Good choice! Keep going.` : `That was incorrect. Try again.`);
      setMessageType(correct ? 'correct' : 'wrong');
      setShowUndo(!correct);
    }
  };

  const handleUndo = () => {
    if (!undoState) return;
    setLow(undoState.low);
    setHigh(undoState.high);
    setSelectedPivot(undoState.selectedPivot);
    setMessage(undoState.message);
    setMessageType(undoState.messageType || '');
    setGameOver(undoState.gameOver);
    setHistory(undoState.history);
    setShowUndo(false);
    setUndoState(null);
  };

  const getMessageStyle = () => {
    if (messageType === 'correct') {
      return { color: '#388e3c', fontWeight: 'bold', fontFamily: "inherit" };
    }
    if (messageType === 'wrong') {
      return { color: '#d32f2f', fontWeight: 'bold', fontFamily: "inherit" };
    }
    return { fontFamily: "inherit" };
  };

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

      setArray(arr);
      setTarget(chosenTarget);
      setLow(0);
      setHigh(arr.length - 1);
      setMessage('');
      setMessageType('');
      setSelectedPivot(null);
      setGameOver(false);
      setHistory([]);
      setUndoState(null);
      setShowUndo(false);
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
        display: "flex",
        minHeight: "100vh",
        background: COLORS.background,
        position: "relative",
        fontFamily: "inherit"
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
        label={"Explorative Mode"}
          checked={switchChecked}
          onChange={e => {
            setSwitchChecked(e.target.checked);
            if (!e.target.checked) navigate('/binary-search');
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
      {/* Main Content */}
      <div style={{ flex: 1, padding: "2rem" }}>
        {/* Header row: title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
            width: "100%",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              margin: 0,
              fontSize: "2rem",
              color: "#222",
              fontFamily: "inherit",
              fontWeight: 700,
            }}
          >
            Explore Binary Search
          </h1>
        </div>
        {/* Centered Generate New Game and Looking for */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <ProgressButton onClick={generateNewGame} style={{ marginBottom: "1.5rem" }}>
            Generate New Array
          </ProgressButton>
          {array.length > 0 && (
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
                boxShadow: "0 2px 8px #0001",
                marginBottom: "1.5rem"
              }}
            >
              Looking for: <strong>{target}</strong>
            </div>
          )}
        </div>

        {array.length > 0 && (
          <>
            {/* Array Visualization */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                background: COLORS.arrayContainerBg,
                borderRadius: 8,
                padding: "1rem 1.5rem"
              }}>
{array.map((val, idx) => {
  const isOutOfBounds = idx < low || idx > high;
  const isSelected = idx === selectedPivot;
  const revealValue =
    selectedPivot != null && (isSelected || idx === selectedPivot - 1 || idx === selectedPivot + 1);

  return (
    <div
      key={idx}
      onClick={() => handlePivotClick(idx)}
      style={{
        ...boxStyle,
        background: isSelected
          ? '#ffcc80'
          : isOutOfBounds
            ? '#888' // Match the grey used in BinarySearchViz.jsx for blacked out
            : COLORS.arrayBoxBg,
        color: isOutOfBounds
          ? '#888'
          : revealValue
            ? '#222'
            : 'transparent',
        border: isSelected
          ? `2px solid #ff9800`
          : isOutOfBounds
            ? `1.5px solid ${COLORS.borderLight}`
            : `1.5px solid ${COLORS.borderDark}`,
        boxShadow: isSelected ? "0 2px 8px #ff980033" : undefined,
        fontFamily: "inherit",
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {revealValue ? val : ''}
      {isOutOfBounds && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 4px)',
          pointerEvents: 'none',
          borderRadius: 4
        }} />
      )}
    </div>
  );
})}
              </div>
            </div>

            {/* Search Left/Right Buttons */}
            {selectedPivot != null && !gameOver && array[selectedPivot] !== target && (
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <ProgressButton onClick={() => handleDirection('left')}>
                  Search Left
                </ProgressButton>
                <ProgressButton onClick={() => handleDirection('right')}>
                  Search Right
                </ProgressButton>
              </div>
            )}

            {/* Message and Undo */}
            {!selectedPivot && message && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={getMessageStyle()}>{message}</p>
                {showUndo && (
                  <ProgressButton onClick={handleUndo} style={{ marginTop: '0.5rem' }}>
                    Undo Last Move
                  </ProgressButton>
                )}
              </div>
            )}

            {/* Game Over */}
            {gameOver && (
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={messageType === 'correct'
                  ? { color: '#388e3c', fontWeight: 'bold', fontFamily: "inherit" }
                  : { color: '#d32f2f', fontWeight: 'bold', fontFamily: "inherit" }
                }>
                  You Found it. Click generat new array to try again.
                </h3>
              </div>
            )}

            {/* Search History Info Box */}
            <div
              style={{
                marginTop: '2rem',
                textAlign: 'left',
                maxWidth: 600,
                marginInline: 'auto',
                background: COLORS.infoSectionBg,
                border: `1.5px solid ${COLORS.borderDark}`,
                borderRadius: "10px",
                padding: "1.25rem 2rem",
                boxShadow: "0 2px 8px #0001",
                fontFamily: "inherit"
              }}
            >
              <h4 style={{ marginTop: 0, color: COLORS.sectionTitle, fontSize: "1.1rem", fontWeight: 700 }}>
                Search History:
              </h4>
              <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
                {history.map((h, i) => (
                  <li key={i} style={{ color: "#222", fontWeight: 'bold', fontFamily: "inherit" }}>
                    Step {i + 1}: Picked index {h.pivot} ({array[h.pivot]}) → went {h.dir} →{' '}
                    <span style={{ color: h.correct ? '#388e3c' : '#d32f2f' }}>
                      {h.correct ? 'Correct' : 'Wrong'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}