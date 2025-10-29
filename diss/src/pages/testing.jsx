import React, { useState, useRef, useEffect } from "react";
import HomeButton from "../HomeButton";
import ProgressButton from "../ProgressButton";
import styled from "styled-components";
/**
 * ─── Helper Functions ──────────────────────────────────────────────
 * Utility functions for matrix generation, manipulation, and splitting/joining.
 */


const PANEL_BG = "#F9F6F2";
const PANEL_BORDER = "#2A2925";
const PANEL_SHADOW = "0 -2px 10px #0002";
const INFO_BG = "#f9f9f9";
const INFO_BORDER = "#B0ADA8";
const SECTION_TITLE = "#3b4252";
const ARRAY_BG = "rgb(229, 226, 221)";
const ARRAY_BORDER = "#2A2925";
const ARRAY_BOX_BG = "rgb(192, 231, 241)";
const ARRAY_BOX_BORDER = "#2A2925";
const FONT_FAMILY = "inherit";
const FONT_COLOR = "#222";



// Returns a random integer between 0 and 9.
const rand = () => Math.floor(Math.random() * 10);

// Generates an n x n matrix filled with random integers.
const gen = (n) =>
  Array.from({ length: n }, () => Array.from({ length: n }, rand));

// Adds two matrices element-wise.
const add = (A, B) => A.map((r, i) => r.map((v, j) => v + B[i][j]));

// Subtracts matrix B from matrix A element-wise.
const sub = (A, B) => A.map((r, i) => r.map((v, j) => v - B[i][j]));

// Splits a matrix into four quadrants: [top-left, top-right, bottom-left, bottom-right].
const split = (M) => {
  const n = M.length,
    m = n >> 1;
  return [
    M.slice(0, m).map((r) => r.slice(0, m)),
    M.slice(0, m).map((r) => r.slice(m)),
    M.slice(m).map((r) => r.slice(0, m)),
    M.slice(m).map((r) => r.slice(m)),
  ];
};

const StyledSelect = styled.select`
  --input-focus: #2d8cf0;
  --font-color: #323232;
  --font-color-sub: #666;
  --bg-color: #fff;
  --main-color: #323232;
  width: 200px;
  height: 40px;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  background-color: var(--bg-color);
  box-shadow: 4px 4px var(--main-color);
  font-size: 15px;
  font-weight: 600;
  color: var(--font-color);
  padding: 5px 10px;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  transition: border 0.2s;
  &:focus {
    border: 2px solid var(--input-focus);
  }
`;

// Joins four quadrants into a single matrix.
const join = (C11, C12, C21, C22) => {
  const top = C11.map((r, i) => [...r, ...C12[i]]);
  const bot = C21.map((r, i) => [...r, ...C22[i]]);
  return [...top, ...bot];
};

/**
 * Prepares the operand pairs for the seven Strassen subcomputations (P1-P7).
 * Returns an object mapping Pi to [leftOperand, rightOperand].
 */
function prepareStrassenOperands(A, B) {
  const [A11, A12, A21, A22] = split(A);
  const [B11, B12, B21, B22] = split(B);
  return {
    P1: [add(A11, A22), add(B11, B22)],
    P2: [add(A21, A22), B11],
    P3: [A11, sub(B12, B22)],
    P4: [A22, sub(B21, B11)],
    P5: [add(A11, A12), B22],
    P6: [sub(A21, A11), add(B11, B12)],
    P7: [sub(A12, A22), add(B21, B22)],
  };
}

function getQuadrantIndices(n, quad) {
  // quad: 11, 12, 21, 22
  const m = n >> 1;
  if (quad === "11") return { row: [0, m], col: [0, m] };
  if (quad === "12") return { row: [0, m], col: [m, n] };
  if (quad === "21") return { row: [m, n], col: [0, m] };
  if (quad === "22") return { row: [m, n], col: [m, n] };
  return { row: [0, n], col: [0, n] };
}

function safeAdd(A, B) {
  if (!A || !A.length) return B;
  if (!B || !B.length) return A;
  return A.map((r, i) => r.map((v, j) => v + B[i][j]));
}

function safeSub(A, B) {
  if (!A || !A.length) return B ? B.map((row) => row.map((v) => -v)) : [];
  if (!B || !B.length) return A;
  return A.map((r, i) => r.map((v, j) => v - B[i][j]));
}

function prepareCOperands(M) {
  // Defensive: If any M.M* is missing or empty, use a zero matrix of the same shape as the first non-empty M
  const getShape = () => {
    for (let k = 1; k <= 7; ++k) {
      const m = M[`M${k}`];
      if (m && m.length) return [m.length, m[0].length];
    }
    return [0, 0];
  };
  const [rows, cols] = getShape();
  const zeroMat =
    rows && cols ? Array.from({ length: rows }, () => Array(cols).fill(0)) : [];

  const get = (key) => (M[key] && M[key].length ? M[key] : zeroMat);

  return {
    C11: safeAdd(
      safeAdd(safeSub(safeAdd(get("M1"), get("M4")), get("M5")), get("M7")),
      zeroMat
    ),
    C12: safeAdd(get("M3"), get("M5")),
    C21: safeAdd(get("M2"), get("M4")),
    C22: safeAdd(safeAdd(safeSub(get("M1"), get("M2")), get("M3")), get("M6")),
  };
}

function extractBoxViewPairs(operands) {
  if (!operands) return [];
  const keys = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"];
  return keys.map((key) => operands[key]);
}

/**
 * Recursive implementation of Strassen's matrix multiplication algorithm.
 * Multiplies two n x n matrices (where n is a power of 2).
 */
function strassen(A, B) {
  const n = A.length;
  if (n === 1) return [[A[0][0] * B[0][0]]];
  const [A11, A12, A21, A22] = split(A);
  const [B11, B12, B21, B22] = split(B);
  const M1 = strassen(add(A11, A22), add(B11, B22));
  const M2 = strassen(add(A21, A22), B11);
  const M3 = strassen(A11, sub(B12, B22));
  const M4 = strassen(A22, sub(B21, B11));
  const M5 = strassen(add(A11, A12), B22);
  const M6 = strassen(sub(A21, A11), add(B11, B12));
  const M7 = strassen(sub(A12, A22), add(B21, B22));
  const C11 = sub(add(add(M1, M4), M7), M5);
  const C12 = add(M3, M5);
  const C21 = add(M2, M4);
  const C22 = sub(add(add(M1, M3), M6), M2);
  return join(C11, C12, C21, C22);
}

/**
 * ─── Matrix Renderer ───────────────────────────────────────────────
 * Renders a matrix as a table with optional label and border.
 */
const Mat = ({ data, label, border }) => (
  <div
    style={{
      margin: "0.5rem",
      display: "inline-block",
      position: "relative",
      fontFamily: FONT_FAMILY,
    }}
  >
    {label && (
      <div style={{ fontWeight: "bold", textAlign: "center", color: SECTION_TITLE, fontSize: "1.1rem" }}>{label}</div>
    )}
    <table style={{ borderCollapse: "collapse", background: ARRAY_BG, borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
      <tbody>
        {data.map((r, i) => (
          <tr key={i}>
            {r.map((v, j) => (
              <td
                key={j}
                style={{
                  border: `1.5px solid ${ARRAY_BOX_BORDER}`,
                  width: 32,
                  height: 32,
                  textAlign: "center",
                  userSelect: "none",
                  background: ARRAY_BOX_BG,
                  color: FONT_COLOR,
                  fontWeight: 600,
                  fontSize: "1rem",
                  borderRadius: 4,
                  fontFamily: FONT_FAMILY,
                }}
              >
                {v}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {border && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `3px solid ${border}`,
          pointerEvents: "none",
        }}
      />
    )}
  </div>
);

// Colors for quadrant overlays.
const quadColors = ["#f44336", "#2196f3", "#4caf50", "#ff9800"];

/**
 * ─── StrassenVisualizer Component ──────────────────────────────────
 * Main React component for visualizing Strassen's algorithm step-by-step.
 */
export default function StrassenVisualizer() {
  // ─── State Variables ─────────────────────────────────────────────
  const [n, setN] = useState(4); // Matrix size
  const [A, setA] = useState([]); // Matrix A
  const [B, setB] = useState([]); // Matrix B
  const [stage, setStage] = useState(0); // Current visualization stage
  const [Mi, setMi] = useState({}); // Stores M1-M7 results
  const [C, setC] = useState([]); // Result matrix
  const [operands, setOperands] = useState(null); // Strassen operand pairs

  const [Cquads, setCquads] = useState({ C11: [], C12: [], C21: [], C22: [] }); // Quadrants of result
  const [openFormula, setOpenFormula] = useState(null); // For UI expansion (unused)
  const [openCombine, setOpenCombine] = useState(null); // For UI expansion (unused)

  /**
   * Resets all state to initial values.
   */
  const reset = () => {
    setStage(0);
    setA([]);
    setB([]);
    setMi({});
    setC([]);
    setOperands(null);
  };

  /**
   * Moves to the previous visualization stage.
   */
  const previous = () => {
    setStage((prev) => (prev > 0 ? prev - 1 : 0));
  };

  /**
   * Initializes matrices and moves to the first stage.
   * Ensures n is a power of 2 and at least 2.
   */
  const start = () => {
    if (n < 2 || (n & (n - 1)) !== 0) {
      alert("n must be a power of 2 and ≥ 2");
      return;
    }
    const a = gen(n);
    const b = gen(n);
    setA(a);
    setB(b);
    setStage(1);
    setOperands(null);
  };

  /**
   * Computes al M1-M7 and the final result C using Strassen's algorithm.
   * Also stores the quadrants of C for fgfvisualization.
   */
  const computeMiC = () => {
    const [A11, A12, A21, A22] = split(A);
    const [B11, B12, B21, B22] = split(B);
    const M1 = strassen(add(A11, A22), add(B11, B22));
    const M2 = strassen(add(A21, A22), B11);
    const M3 = strassen(A11, sub(B12, B22));
    const M4 = strassen(A22, sub(B21, B11));
    const M5 = strassen(add(A11, A12), B22);
    const M6 = strassen(sub(A21, A11), add(B11, B12));
    const M7 = strassen(sub(A12, A22), add(B21, B22));
    const C11 = sub(add(add(M1, M4), M7), M5);
    const C12 = add(M3, M5);
    const C21 = add(M2, M4);
    const C22 = sub(add(add(M1, M3), M6), M2);
    setMi({ M1, M2, M3, M4, M5, M6, M7 });
    setC(join(C11, C12, C21, C22));
    setCquads({ C11, C12, C21, C22 });
  };

  /**
   * Navigates to the homepage.
   */
  const home = () => {
    window.location.href = "/";
  };

  /**
   * Advances to the next visualization stage.
   */
  const next = () => {
    if (stage === 1) {
      setOperands(prepareStrassenOperands(A, B));
      setStage(2);
    } else if (stage === 2) setStage(3);
    else if (stage === 3) {
      computeMiC();
      setStage(4);
    } else if (stage === 4) setStage(5);
    else if (stage === 5) setStage(6);
    else if (stage === 6) setStage(7);
    else if (stage === 7) setStage(8);
    else if (stage === 8) setStage(9);
  };

  // Precompute quadrants for A and B for use in views.
  const [A11, A12, A21, A22] = A.length ? split(A) : [[], [], [], []];
  const [B11, B12, B21, B22] = B.length ? split(B) : [[], [], [], []];

  /**
   * ─── OriginalView Component ──────────────────────────────────────
   * Displays the original input matrices A and B.
   */
  const OriginalView = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2>Original Input Matrices</h2>
      <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Mat data={A} label="Matrix A" />
        <Mat data={B} label="Matrix B" />
      </div>
    </div>
  );

  // Formula text for each Pi operand.
  const formulaText = {
    P1: ["(A11 + A22)", "(B11 + B22)"],
    P2: ["(A21 + A22)", "B11"],
    P3: ["A11", "(B12 − B22)"],
    P4: ["A22", "(B21 − B11)"],
    P5: ["(A11 + A12)", "B22"],
    P6: ["(A21 − A11)", "(B11 + B12)"],
    P7: ["(A12 − A22)", "(B21 + B22)"],
  };

  /**
   * ─── DivideView Component ────────────────────────────────────────
   * Shows matrices A and B with colored quadrant overlays.
   */
  const DivideView = () => {
    // Animation state: 0 = show whole, 1 = split A, 2 = split B, 3 = show all quadrants
    const [animStep, setAnimStep] = useState(0);

    useEffect(() => {
      setAnimStep(0);
      const timers = [
        setTimeout(() => setAnimStep(1), 700),
        setTimeout(() => setAnimStep(2), 1400),
        setTimeout(() => setAnimStep(3), 2100),
      ];
      return () => timers.forEach(clearTimeout);
    }, [A, B]);

    // Helper to animate splitting a matrix
    const AnimatedSplit = ({ data, label, showSplit }) => {
      if (!data.length) return null;
      const n = data.length;
      const [Q11, Q12, Q21, Q22] = split(data);

      // Only show the full matrix at first
      if (showSplit === 0) {
        return <Mat data={data} label={label} />;
      }

      // Show the four quadrants as separate smaller matrices
      if (showSplit >= 1) {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
              {label}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
              }}
            >
              <Mat data={Q11} label={label + "11"} />
              <Mat data={Q12} label={label + "12"} />
              <Mat data={Q21} label={label + "21"} />
              <Mat data={Q22} label={label + "22"} />
            </div>
          </div>
        );
      }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2>Divide stage A(1) (Splitting into Quadrants) </h2>
        <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap", justifyContent: "center" }}>
          <AnimatedSplit data={A} label="A" showSplit={animStep >= 1 ? 1 : 0} />
          <AnimatedSplit data={B} label="B" showSplit={animStep >= 2 ? 1 : 0} />
        </div>
      </div>
    );
  };

  const HighlightMat = ({ data, quad, label }) => {
  if (!data.length) return null;
  const n = data.length;
  const { row, col } = getQuadrantIndices(n, quad);
  return (
    <div
      style={{
        margin: "0.5rem",
        display: "inline-block",
        position: "relative",
        fontFamily: FONT_FAMILY,
      }}
    >
      {label && (
        <div style={{ fontWeight: "bold", textAlign: "center", color: SECTION_TITLE, fontSize: "1.1rem" }}>{label}</div>
      )}
      <table style={{ borderCollapse: "collapse", background: ARRAY_BG, borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td
                  key={j}
                  style={{
                    border: `1.5px solid ${ARRAY_BOX_BORDER}`,
                    width: 32,
                    height: 32,
                    textAlign: "center",
                    userSelect: "none",
                    background:
                      i >= row[0] && i < row[1] && j >= col[0] && j < col[1]
                        ? "#ffe082" // Highlight color for the selected quadrant
                        : ARRAY_BOX_BG,
                    color: FONT_COLOR,
                    fontWeight: 600,
                    fontSize: "1rem",
                    borderRadius: 4,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

  /**
   * ─── BoxView Component ───────────────────────────────────────────
   * Shows the operand pairs for each Pi as boxes with formulas and matrices.
   * Now supports clicking a box to show a popup with details.
   */
   const BoxView = () => {
    const [openBox, setOpenBox] = useState(null);
    const popupRef = useRef();

    // Close popup when clicking outside
    useEffect(() => {
      if (!openBox) return;
      const handleClick = (e) => {
        if (popupRef.current && !popupRef.current.contains(e.target)) {
          setOpenBox(null);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [openBox]);

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2>Divide stage A(2) (Operands for Strassen Subcomputations) </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
          {Object.entries(operands || {}).map(([key, [left, right]]) => (
            <div
              key={key}
              style={{
                border: "2px solid #2A2925",
                padding: "0.5rem",
                minWidth: "300px",
                cursor: "pointer",
                background: openBox === key ? "#e6f7ff" : "#fff",
                position: "relative",
                zIndex: openBox === key ? 2 : 1,
              }}
              onClick={() => setOpenBox(key)}
            >
              <div
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                {key}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ marginBottom: "0.3rem" }}>
                    {formulaText[key][0]}
                  </div>
                  <Mat data={left} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ marginBottom: "0.3rem" }}>
                    {formulaText[key][1]}
                  </div>
                  <Mat data={right} />
                </div>
              </div>
              {/* Popup */}
              {openBox === key && (
                <div
  ref={popupRef}
  style={{
    width: "80vw",
    maxWidth: 900,
    background: PANEL_BG,
    color: FONT_COLOR,
    border: `2px solid ${PANEL_BORDER}`,
    boxShadow: PANEL_SHADOW,
    minHeight: 320,
    position: "fixed",
    left: "50%",
    top: "50%", // <-- changed
    transform: "translate(-50%, -50%)", // <-- changed
    zIndex: 99,
    padding: "2rem 5rem 2rem 1.5rem",
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    gap: 0,
    overflow: "hidden",
    borderRadius: "16px"
  }}
  onClick={(e) => e.stopPropagation()}
>
                  <button
    style={{
      position: "absolute",
      top: 12,
      right: 18,
      background: "#eee",
      border: `1px solid ${INFO_BORDER}`,
      borderRadius: "0.5rem",
      fontWeight: "bold",
      cursor: "pointer",
      padding: "0.2rem 0.7rem",
      fontSize: "1.2rem"
    }}
                    onClick={() => setOpenBox(null)}
                  >
                    ×
                  </button>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      marginBottom: "1rem",
                      textAlign: "center",
                    }}
                  >
                    {key} 
                  </div>
                  {/* Show how the left matrix is formed */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.5rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {(() => {
                      // Parse the formula for the left operand
                      const leftFormula = formulaText[key][0];
                      // e.g. "(A11 + A12)" or "A11"
                      const match = leftFormula.match(/A(\d\d)/g);
                      if (match) {
                        return (
                          <>
                            {match.map((quad, idx) => (
                              <React.Fragment key={quad}>
                                <HighlightMat
                                  data={A}
                                  quad={quad.slice(1)}
                                  label={`A${quad.slice(1)}`}
                                />
                                {idx < match.length - 1 && (
                                  <span
                                    style={{
                                      fontSize: "1.5rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    +
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                            <span
                              style={{ fontSize: "2rem", fontWeight: "bold" }}
                            >
                              =
                            </span>
                            <Mat data={left} />
                          </>
                        );
                      }
                      return <Mat data={left} />;
                    })()}
                  </div>
                  {/* Show how the right matrix is formed */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.5rem",
                    }}
                  >
                    {(() => {
                      const rightFormula = formulaText[key][1];
                      const match = rightFormula.match(/B(\d\d)/g);
                      if (match) {
                        return (
                          <>
                            {match.map((quad, idx) => (
                              <React.Fragment key={quad}>
                                <HighlightMat
                                  data={B}
                                  quad={quad.slice(1)}
                                  label={`B${quad.slice(1)}`}
                                />
                                {idx < match.length - 1 && (
                                  <span
                                    style={{
                                      fontSize: "1.5rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    +
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                            <span
                              style={{ fontSize: "2rem", fontWeight: "bold" }}
                            >
                              =
                            </span>
                            <Mat data={right} />
                          </>
                        );
                      }
                      return <Mat data={right} />;
                    })()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * QuadrantMat Component
   * Renders a matrix subdivided into four colored quadrants.
   */
  function QuadrantMat({ data }) {
    if (!data.length) return null;
    const [Q11, Q12, Q21, Q22] = split(data);
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem",
          width: "auto",
        }}
      >
        <Mat data={Q11} />
        <Mat data={Q12} />
        <Mat data={Q21} />
        <Mat data={Q22} />
      </div>
    );
  }

  /**
   * ─── QuadrantBoxView Component ───────────────────────────────────
   * Shows operand pairs for each Pi, with each operand subdivided into quadrants.
   */
  const QuadrantBoxView = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <h2>Divide stage B(1) (Splitting into Quadrants) </h2>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
      {Object.entries(operands || {}).map(([key, [left, right]]) => (
        <div
          key={key}
          style={{
            border: "2px solid #2A2925",
            background: "#fff",
            padding: "0.5rem",
            minWidth: "300px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            {key}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "0.3rem" }}>
                {formulaText[key][0]}
              </div>
              <QuadrantMat data={left} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "0.3rem" }}>
                {formulaText[key][1]}
              </div>
              <QuadrantMat data={right} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

  /**
   * ─── SecondBoxView Component ─────────────────────────────────────
   * Shows 7 rows of 7 boxes, each with formulas at the ends.
   * Each inner box is clickable and shows a popup with how the matrices are formed,
   * referencing the matrices in BoxView and preserving "+" and "−" symbols.
   */
  const SecondBoxView = () => {
    // The formulas for each Pi, copied from formulaText in BoxView
    const formulas = [
      ["(A11 + A22)", "(B11 + B22)"],
      ["(A21 + A22)", "B11"],
      ["A11", "(B12 − B22)"],
      ["A22", "(B21 − B11)"],
      ["(A11 + A12)", "B22"],
      ["(A21 − A11)", "(B11 + B12)"],
      ["(A12 − A22)", "(B21 + B22)"],
    ];

    // Get the 7 pairs of matrices from operands (BoxView)
    const boxPairs = extractBoxViewPairs(operands);

    // State for popup
    const [openInner, setOpenInner] = useState({ box: null, mini: null });
    const popupRef = useRef();

    // Close popup when clicking outside
    useEffect(() => {
      if (openInner.box === null) return;
      const handleClick = (e) => {
        if (popupRef.current && !popupRef.current.contains(e.target)) {
          setOpenInner({ box: null, mini: null });
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [openInner]);

    // Helper to get the operand matrices from BoxView for a given Pi
    const getBoxViewOperands = (piIndex) => {
      // Pi index 0-6, keys P1-P7
      const keys = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"];
      if (!operands) return [[], []];
      return operands[keys[piIndex]] || [[], []];
    };

    return (
  <>
    <h2 style = {{textAlign: "center"}}>Divide stage B(2) (Operands for Strassen Subcomputations) </h2>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        padding: "1rem",
        alignItems: "center",
      }}
    >
      {boxPairs.map(([leftMat, rightMat], boxIndex) => {
            // For each pair, run prepareStrassenOperands on both matrices
            // (if they are square and of size >= 2)
            let innerOperands = null;
            if (
              Array.isArray(leftMat) &&
              Array.isArray(rightMat) &&
              leftMat.length === rightMat.length &&
              leftMat.length >= 2 &&
              leftMat.length === leftMat[0].length &&
              rightMat.length === rightMat[0].length
            ) {
              innerOperands = prepareStrassenOperands(leftMat, rightMat);
            }

            // Extract the 7 pairs for the inner boxes (or fill with empty if not possible)
            const innerPairs = innerOperands
              ? extractBoxViewPairs(innerOperands)
              : Array(7).fill([[], []]);

            return (
          <div key={boxIndex} style={{ marginBottom: "2.5rem" }}>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "0.5rem",
                fontSize: "1.1rem",
                textAlign: "center",
              }}
            >
              P{boxIndex + 1}
            </div>
            <div
              style={{
                width: "100%",
                minWidth: "1800px",
                height: "180px", // Increased height
                border: "2px solid #2A2925",
                padding: "18px", // Increased padding
                boxSizing: "border-box",
                backgroundColor: "#fff",
                borderRadius: "0.75rem",
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "28px", // Increased gap
                alignItems: "stretch",
                justifyItems: "stretch",
                fontSize: "1.15rem", // Slightly larger font
                color: "#63b3ed",
                overflow: "hidden",
              }}
            >
              {innerPairs.map(([innerLeft, innerRight], miniIndex) => (
                <div
                  key={miniIndex}
                  style={{
                    width: "100%",
                    height: "100%",
                    minWidth: "200px",
                    backgroundColor: "#fff",
                    border: "2px solid #2A2925",
                    borderRadius: "0.75rem",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: 0,
                    fontSize: "1rem",
                    color: "#222",
                    textAlign: "center",
                    padding: "6px", // Increased padding
                    overflow: "auto",
                    gap: "12px", // Increased gap
                    position: "relative",
                    cursor: "pointer",
                  }}
                  title={`Mini Box ${miniIndex + 1}`}
                  onClick={() =>
                    setOpenInner({ box: boxIndex, mini: miniIndex })
                  }
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 10,
                      fontWeight: "bold",
                      fontSize: "0.95em",
                      color: "#444",
                      opacity: 0.85,
                      pointerEvents: "none",
                    }}
                  >
                    {`P${boxIndex + 1}.${miniIndex + 1}`}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ marginBottom: "0.3rem" }}>
                      {formulas[miniIndex][0]}
                    </div>
                    <Mat data={innerLeft} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ marginBottom: "0.3rem" }}>
                      {formulas[miniIndex][1]}
                    </div>
                    <Mat data={innerRight} />
                  </div>
                </div>
              ))}
                  {/* Popup for inner box */}
              {openInner.box === boxIndex && openInner.mini !== null && (
                <div
                  ref={popupRef}
                  style={{
                    width: "80vw",
                    maxWidth: 900,
                    background: PANEL_BG,
                    color: FONT_COLOR,
                    border: `2px solid ${PANEL_BORDER}`,
                    boxShadow: PANEL_SHADOW,
                    minHeight: 320,
                    position: "fixed",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 99,
                    padding: "2rem 5rem 2rem 1.5rem",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "stretch",
                    gap: 0,
                    overflow: "hidden",
                    borderRadius: "16px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 18,
                      background: "#eee",
                      border: `1px solid ${INFO_BORDER}`,
                      borderRadius: "0.5rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      padding: "0.2rem 0.7rem",
                      fontSize: "1.2rem",
                    }}
                    onClick={() => setOpenInner({ box: null, mini: null })}
                  >
                    ×
                  </button>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {`P${boxIndex + 1}.${openInner.mini + 1}`} Details
                  </div>
                  {/* Show how the left and right matrix are formed, with space between */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "2.5rem",
                      marginBottom: "1.5rem",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    {/* Left matrix formation */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      {(() => {
                        const leftFormula = formulas[openInner.mini][0];
                        const parts = [];
                        let regex = /A(\d\d)|[+\-−]/g;
                        let m;
                        while ((m = regex.exec(leftFormula))) {
                          if (m[0] === "+" || m[0] === "-" || m[0] === "−") {
                            parts.push(m[0]);
                          } else if (m[1]) {
                            parts.push({ quad: m[1] });
                          }
                        }
                        const [boxLeft] = getBoxViewOperands(boxIndex);
                        return (
                          <>
                            {parts.map((part, idx) =>
                              typeof part === "string" ? (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "bold",
                                    margin: "0 0.3rem",
                                  }}
                                >
                                  {part}
                                </span>
                              ) : (
                                <HighlightMat
                                  key={part.quad}
                                  data={boxLeft}
                                  quad={part.quad}
                                  label={`A${part.quad}`}
                                />
                              )
                            )}
                            <span
                              style={{ fontSize: "2rem", fontWeight: "bold" }}
                            >
                              =
                            </span>
                            <Mat data={innerPairs[openInner.mini][0]} />
                          </>
                        );
                      })()}
                    </div>
                    {/* Spacer */}
                    <div style={{ width: "2rem" }} />
                    {/* Right matrix formation */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      {(() => {
                        const rightFormula = formulas[openInner.mini][1];
                        const parts = [];
                        let regex = /B(\d\d)|[+\-−]/g;
                        let m;
                        while ((m = regex.exec(rightFormula))) {
                          if (m[0] === "+" || m[0] === "-" || m[0] === "−") {
                            parts.push(m[0]);
                          } else if (m[1]) {
                            parts.push({ quad: m[1] });
                          }
                        }
                        const [, boxRight] = getBoxViewOperands(boxIndex);
                        return (
                          <>
                            {parts.map((part, idx) =>
                              typeof part === "string" ? (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "bold",
                                    margin: "0 0.3rem",
                                  }}
                                >
                                  {part}
                                </span>
                              ) : (
                                <HighlightMat
                                  key={part.quad}
                                  data={boxRight}
                                  quad={part.quad}
                                  label={`B${part.quad}`}
                                />
                              )
                            )}
                            <span
                              style={{ fontSize: "2rem", fontWeight: "bold" }}
                            >
                              =
                            </span>
                            <Mat data={innerPairs[openInner.mini][1]} />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  /**
   * ─── FourInnerBoxView Component ─────────────────────────────────────
   * Shows 7 outer boxes, each with 4 inner boxes, and formulas using PX for each outer box.
   */
  const FourInnerBoxView = () => {
    // Get the 7 pairs of matrices from operands (BoxView)
    const boxPairs = extractBoxViewPairs(operands);

    // For each quadrant, the corresponding formula using PX
    const cFormulas = [
      (PX) => `C11 = ${PX}1 + ${PX}4 – ${PX}5 + ${PX}7`,
      (PX) => `C12 = ${PX}3 + ${PX}5`,
      (PX) => `C21 = ${PX}2 + ${PX}4`,
      (PX) => `C22 = ${PX}1 – ${PX}2 + ${PX}3 + ${PX}6`,
    ];

    // Popup state for each Cij
    const [openC, setOpenC] = useState({ box: null, quad: null });
    const popupRef = useRef();

    // Close popup when clicking outside
    useEffect(() => {
      if (openC.box === null) return;
      const handleClick = (e) => {
        if (popupRef.current && !popupRef.current.contains(e.target)) {
          setOpenC({ box: null, quad: null });
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [openC]);

    return (
      <>
        <h2 style={{textAlign:"center"}}>Combination Stage B(1) (With Combination formulas)</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            padding: "1rem",
          }}
        >
          {boxPairs.map((_, boxIndex) => {
            if (!operands) return null;
            const keys = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"];
            let M = {};
            keys.forEach((key, i) => {
              const [left, right] = extractBoxViewPairs(
                prepareStrassenOperands(...boxPairs[boxIndex])
              )[i] || [[], []];
              M[`M${i + 1}`] =
                left.length && right.length ? strassen(left, right) : [];
            });

            // Now use prepareCOperands to get the 4 matrices for this box
            const cResults = prepareCOperands(M);
            const PX = `P${boxIndex + 1}`;
            const cKeys = ["C11", "C12", "C21", "C22"];

            // Helper for popup: get the formula and show how the matrix is formed
            const getCFormulaParts = (quadIndex) => {
              // For each Cij, get the formula string and parse it
              // Example: C11 = P11 + P14 – P15 + P17
              const formulaStr = cFormulas[quadIndex](PX).replace(
                /^C\d\d = /,
                ""
              );
              // Match all PiX and operators (+ or −)
              const parts = [];
              let regex = new RegExp(`${PX}(\\d)|[+\\-−–]`, "g");
              let m;
              while ((m = regex.exec(formulaStr))) {
                if (
                  m[0] === "+" ||
                  m[0] === "-" ||
                  m[0] === "−" ||
                  m[0] === "–"
                ) {
                  parts.push(m[0]);
                } else if (m[1]) {
                  parts.push({ pi: PX, idx: m[1] });
                }
              }
              return parts;
            };

            // Helper to get the matrix for a given PiX (e.g., P13)
            const getPiMat = (piNum) => {
              // piNum: "1".."7"
              const idx = parseInt(piNum, 10) - 1;
              // For this outer box, get the 7 pairs, then run strassen on each
              const [left, right] = extractBoxViewPairs(
                prepareStrassenOperands(...boxPairs[boxIndex])
              )[idx] || [[], []];
              return left.length && right.length ? strassen(left, right) : [];
            };

            return (
              <div key={boxIndex} style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                    fontSize: "1.1rem",
                    textAlign: "center",
                  }}
                >
                  {PX}
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "170px",
                    border: "2px solid #2A2925",
                    padding: "18px",
                    boxSizing: "border-box",
                    backgroundColor: "#fff",
                    borderRadius: "0.75rem",
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "16px",
                    alignItems: "stretch",
                    justifyItems: "stretch",
                    fontSize: "2rem",
                    color: "#63b3ed",
                    overflow: "hidden",
                  }}
                >
                  {cKeys.map((cKey, quadIndex) => (
                    <div
                      key={cKey}
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#fff",
                        border: "2px solid #2A2925",
                        borderRadius: "0.75rem",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "#222",
                        textAlign: "center",
                        padding: "2px",
                        overflow: "auto",
                        gap: "8px",
                        position: "relative",
                        cursor: "pointer",
                      }}
                      title={`Click to see how this matrix is formed`}
                      onClick={() =>
                        setOpenC({ box: boxIndex, quad: quadIndex })
                      }
                    >
                      <div style={{ marginBottom: "0.3rem" }}>
                        {(() => {
                          // Convert e.g. "C11 = P11 + P14 – P15 + P17" to "C11 = P1.1 + P1.4 – P1.5 + P1.7"
                          const formula = cFormulas[quadIndex](PX);
                          return formula.replace(/P(\d)(\d)/g, "P$1.$2");
                        })()}
                      </div>
                      <Mat data={cResults[cKey]} />
                    </div>
                  ))}
                  {/* Popup for Cij */}
                  {openC.box === boxIndex && openC.quad !== null && (
                    <div
  ref={popupRef}
  style={{
    width: "80vw",
    maxWidth: 900,
    background: PANEL_BG,
    color: FONT_COLOR,
    border: `2px solid ${PANEL_BORDER}`,
    boxShadow: PANEL_SHADOW,
    minHeight: 320,
    position: "fixed",
    left: "50%",
    top: "50%", // <-- changed
    transform: "translate(-50%, -50%)", // <-- changed
    zIndex: 99,
    padding: "2rem 5rem 2rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
    overflow: "hidden",
    borderRadius: "16px"
  }}
  onClick={(e) => e.stopPropagation()}
>
                      <button
    style={{
      position: "absolute",
      top: 12,
      right: 18,
      background: "#eee",
      border: `1px solid ${INFO_BORDER}`,
      borderRadius: "0.5rem",
      fontWeight: "bold",
      cursor: "pointer",
      padding: "0.2rem 0.7rem",
      fontSize: "1.2rem"
    }}
                        onClick={() => setOpenC({ box: null, quad: null })}
                      >
                        ×
                      </button>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                          marginBottom: "1rem",
                        }}
                      >
                        {`${PX}.${cKeys[openC.quad]}`} Details
                      </div>
                      {/* Show how the matrix is formed */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1.5rem",
                        }}
                      >
                        {(() => {
                          // Parse the formula string for both +, - and Unicode minus
                          const parts = getCFormulaParts(openC.quad);
                          return (
                            <>
                              {parts.map((part, idx) =>
                                typeof part === "string" ? (
                                  <span
                                    key={idx}
                                    style={{
                                      fontSize: "1.5rem",
                                      fontWeight: "bold",
                                      margin: "0 0.3rem",
                                    }}
                                  >
                                    {part}
                                  </span>
                                ) : (
                                  // Change label from e.g. P11 to P1.1
                                  <Mat
                                    key={part.pi + part.idx}
                                    data={getPiMat(part.idx)}
                                    label={`${part.pi}.${part.idx}`}
                                  />
                                )
                              )}
                              <span
                                style={{ fontSize: "2rem", fontWeight: "bold" }}
                              >
                                =
                              </span>
                              <Mat data={cResults[cKeys[openC.quad]]} />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  /**
   * ─── CombinedOuterBoxView Component ────────────────────────────────
   * Shows 7 outer boxes (P1 to P7), each with a single combined matrix
   * formed by joining the 4 matrices (C11, C12, C21, C22) from FourInnerBoxView.
   */
  /**
   * ─── CombinedOuterBoxView Component ────────────────────────────────
   * Shows 7 outer boxes (P1 to P7), each with a single combined matrix
   * formed by joining the 4 matrices (C11, C12, C21, C22) from FourInnerBoxView.
   */
  const CombinedOuterBoxView = () => {
    const boxPairs = extractBoxViewPairs(operands);
    const cKeys = ["C11", "C12", "C21", "C22"];
    const PXs = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"];
    const [openCombined, setOpenCombined] = useState(null);
    const popupRef = useRef();

    // Close popup when clicking outside
    useEffect(() => {
      if (openCombined === null) return;
      const handleClick = (e) => {
        if (popupRef.current && !popupRef.current.contains(e.target)) {
          setOpenCombined(null);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [openCombined]);

    // C formulas for each quadrant
    const cFormulas = [
      (PX) => ` ${PX}1 + ${PX}4 – ${PX}5 + ${PX}7 = C11`,
      (PX) => ` ${PX}3 + ${PX}5 = C12`,
      (PX) => `${PX}2 + ${PX}4 = C21`,
      (PX) => `${PX}1 – ${PX}2 + ${PX}3 + ${PX}6 = C22`,
    ];

    return (
      <>
        <h2 style={{textAlign:"center"}}>Combination stage B(2) (Forming combined matrices)</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "1.5rem",
            padding: "1rem",
            justifyContent: "center",
          }}
        >
          {boxPairs.map((_, boxIndex) => {
            if (!operands) return null;

            // For this outer box, get the 7 pairs of matrices to multiply
            const keys = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"];
            let M = {};
            keys.forEach((key, i) => {
              const [left, right] = extractBoxViewPairs(
                prepareStrassenOperands(...boxPairs[boxIndex])
              )[i] || [[], []];
              M[`M${i + 1}`] =
                left.length && right.length ? strassen(left, right) : [];
            });

            // Get the 4 matrices for this box
            const cResults = prepareCOperands(M);

            // Combine them into one matrix (top left, top right, bottom left, bottom right)
            const [C11, C12, C21, C22] = cKeys.map((k) => cResults[k]);
            let combined = [];
            if (
              C11 &&
              C12 &&
              C21 &&
              C22 &&
              C11.length &&
              C12.length &&
              C21.length &&
              C22.length
            ) {
              combined = join(C11, C12, C21, C22);
            }

            // Helper for popup: get the formula and show how the matrix is formed
            const getCFormulaParts = (quadIndex) => {
              // For each Cij, get the formula string and parse it
              // Example: C11 = P11 + P14 – P15 + P17
              const PX = PXs[boxIndex];
              const formulaStr = cFormulas[quadIndex](PX).replace(
                /^C\d\d = /,
                ""
              );
              // Match all PiX and operators (+ or −)
              const parts = [];
              let regex = new RegExp(`${PX}(\\d)|[+\\-−–]`, "g");
              let m;
              while ((m = regex.exec(formulaStr))) {
                if (
                  m[0] === "+" ||
                  m[0] === "-" ||
                  m[0] === "−" ||
                  m[0] === "–"
                ) {
                  parts.push(m[0]);
                } else if (m[1]) {
                  parts.push({ pi: PX, idx: m[1] });
                }
              }
              return parts;
            };

            // Helper to get the matrix for a given PiX (e.g., P13)
            const getPiMat = (piNum) => {
              // piNum: "1".."7"
              const idx = parseInt(piNum, 10) - 1;
              // For this outer box, get the 7 pairs, then run strassen on each
              const [left, right] = extractBoxViewPairs(
                prepareStrassenOperands(...boxPairs[boxIndex])
              )[idx] || [[], []];
              return left.length && right.length ? strassen(left, right) : [];
            };

            return (
              <div
                key={PXs[boxIndex]}
                style={{
                  minWidth: 120,
                  minHeight: 120,
                  border: "2px solid #2A2925",
                  borderRadius: "0.75rem",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  // fontWeight: "bold",
                  fontSize: "1.1rem",
                  color: "#000",
                  boxShadow: "0 2px 8px #0001",
                  textAlign: "center",
                  position: "relative",
                  padding: "0.5rem",
                  cursor: "pointer",
                }}
                onClick={() => setOpenCombined(boxIndex)}
                title="Click to see how this matrix is formed"
              >
                <div style={{ marginBottom: "0.5rem" }}>{PXs[boxIndex]}</div>
                <Mat data={combined} />
                {/* Popup for combined matrix */}
                {openCombined === boxIndex && (
  <div
    ref={popupRef}
    style={{
      width: "98vw",
      maxWidth: 1600,
      background: PANEL_BG,
      color: FONT_COLOR,
      border: `2.5px solid ${PANEL_BORDER}`,
      boxShadow: PANEL_SHADOW,
      minHeight: 320,
      position: "fixed",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 99,
      padding: "2.5rem 2.5rem 2rem 2.5rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "2.5rem",
      overflowY: "auto",
      borderRadius: "20px",
    }}
    onClick={(e) => e.stopPropagation()}
  >
    <button
      style={{
        position: "absolute",
        top: 18,
        right: 28,
        background: "#f5f5f5",
        border: `1.5px solid ${INFO_BORDER}`,
        borderRadius: "0.75rem",
        fontWeight: "bold",
        cursor: "pointer",
        padding: "0.2rem 0.9rem",
        fontSize: "1.3rem",
        boxShadow: "0 2px 8px #0001",
        color: "#444",
      }}
      onClick={() => setOpenCombined(null)}
      aria-label="Close"
    >
      ×
    </button>
    <div
      style={{
        fontWeight: "bold",
        fontSize: "1.35rem",
        marginBottom: "0.5rem",
        textAlign: "center",
        alignSelf: "center",
        letterSpacing: "0.02em",
        color: SECTION_TITLE,
      }}
    >
      {PXs[boxIndex]} Combined Matrix Details
    </div>
    {/* Show how each quadrant is formed */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2.5rem",
        width: "100%",
        maxWidth: 1200,
        marginBottom: "1.5rem",
      }}
    >
      {cKeys.map((cKey, quadIndex) => (
        <div
          key={cKey}
          style={{
            background: "#fff",
            border: `1.5px solid ${PANEL_BORDER}`,
            borderRadius: "0.75rem",
            boxShadow: "0 1px 6px #0001",
            padding: "1.2rem 1rem",
            marginBottom: "0.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: "0.7rem",
              color: SECTION_TITLE,
              fontSize: "1.08rem",
              textAlign: "center",
              letterSpacing: "0.01em",
            }}
          >
            {cFormulas[quadIndex](PXs[boxIndex]).replace(
              /P(\d)(\d)/g,
              "P$1.$2"
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.1rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "0.7rem",
            }}
          >
            {(() => {
              const parts = getCFormulaParts(quadIndex);
              return (
                <>
                  {parts.map((part, idx) =>
                    typeof part === "string" ? (
                      <span
                        key={idx}
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: "bold",
                          margin: "0 0.2rem",
                          color: "#444",
                        }}
                      >
                        {part}
                      </span>
                    ) : (
                      <Mat
                        key={part.pi + part.idx}
                        data={getPiMat(part.idx)}
                        label={`${part.pi}.${part.idx}`}
                      />
                    )
                  )}
                  <span
                    style={{
                      fontSize: "1.7rem",
                      fontWeight: "bold",
                      margin: "0 0.2rem",
                      color: "#444",
                    }}
                  >
                    =
                  </span>
                  <Mat data={cResults[cKey]} />
                </>
              );
            })()}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  /**
   * ─── FinalCFormulaView Component ─────────────────────────────────────
   * Takes the 7 combined matrices from CombinedOuterBoxView,
   * applies the Cij formulas, and displays the 4 resulting matrices (C1–C4).
   */
  const FinalCFormulaView = () => {
    // Get the 7 combined matrices from CombinedOuterBoxView
    const boxPairs = extractBoxViewPairs(operands);
    const cKeys = ["C1", "C2", "C3", "C4"];
    // Popup state and ref (hooks must be at the top)
    const [openC, setOpenC] = useState(null);
    const popupRef = useRef();

    useEffect(() => {
      if (openC === null) return;
      const handleClick = (e) => {
        if (popupRef.current && !popupRef.current.contains(e.target)) {
          setOpenC(null);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [openC]);

    // Defensive: If not enough combined matrices, show nothing
    if (!boxPairs || boxPairs.length < 7) return null;

    // For each outer box, we already computed the combined matrix in CombinedOuterBoxView
    // Let's recompute them here:
    const combinedMatrices = boxPairs.map((_, boxIndex) => {
      const keys = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"];
      let M = {};
      keys.forEach((key, i) => {
        const [left, right] = extractBoxViewPairs(
          prepareStrassenOperands(...boxPairs[boxIndex])
        )[i] || [[], []];
        M[`M${i + 1}`] =
          left.length && right.length ? strassen(left, right) : [];
      });
      const cResults = prepareCOperands(M);
      const [C11, C12, C21, C22] = ["C11", "C12", "C21", "C22"].map(
        (k) => cResults[k]
      );
      if (
        C11 &&
        C12 &&
        C21 &&
        C22 &&
        C11.length &&
        C12.length &&
        C21.length &&
        C22.length
      ) {
        return join(C11, C12, C21, C22);
      }
      return [];
    });

    // Now apply the formulas to the 7 combined matrices
    // (P1 = combinedMatrices[0], ..., P7 = combinedMatrices[6])
    const P = combinedMatrices;
    const addMat = (A, B) => {
      if (!A || !A.length) return B;
      if (!B || !B.length) return A;
      return A.map((r, i) => r.map((v, j) => v + B[i][j]));
    };
    const subMat = (A, B) => {
      if (!A || !A.length) return B ? B.map((row) => row.map((v) => -v)) : [];
      if (!B || !B.length) return A;
      return A.map((r, i) => r.map((v, j) => v - B[i][j]));
    };

    const C1 = addMat(addMat(subMat(addMat(P[0], P[3]), P[4]), P[6]), []);
    const C2 = addMat(P[2], P[4]);
    const C3 = addMat(P[1], P[3]);
    const C4 = addMat(addMat(subMat(P[0], P[1]), P[2]), P[5]);

    const finalCs = [C1, C2, C3, C4];

    // Helper: formulas and parsing for each Ck
    const cFormulas = [
      " P1 + P4 – P5 + P7 = C1",
      "P3 + P5 = C2",
      "P2 + P4 = C3",
      "P1 – P2 + P3 + P6 = C4",
    ];
    const getCFormulaParts = (idx) => {
      // Parse e.g. "C1 = P1 + P4 – P5 + P7"
      const formula = cFormulas[idx].replace(/^C\d = /, "");
      // Match all Pi and operators (+ or −, including en dash)
      const parts = [];
      let regex = /P(\d)|[+\-−–]/g;
      let m;
      while ((m = regex.exec(formula))) {
        if (m[0] === "+" || m[0] === "-" || m[0] === "−" || m[0] === "–") {
          parts.push(m[0]);
        } else if (m[1]) {
          parts.push({ pi: m[1] });
        }
      }
      return parts;
    };

    return (
      <>
        <h2 style={{textAlign:"center"}}>Combination stage A(1) (With Combination formulas)</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "2rem",
            padding: "1rem",
            justifyContent: "center",
          }}
        >
          {finalCs.map((mat, i) => (
            <div
              key={i}
              style={{
                minWidth: 180,
                minHeight: 180,
                border: "2px solid #2A2925",
                borderRadius: "0.75rem",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                // fontWeight: "bold",
                fontSize: "1.1rem",
                color: "#000",
                boxShadow: "0 2px 8px #0001",
                textAlign: "center",
                position: "relative",
                padding: "1rem",
                cursor: "pointer",
              }}
              onClick={() => setOpenC(i)}
              title="Click to see how this matrix is formed"
            >
              <div style={{ marginBottom: "0.5rem" }}>{cKeys[i]}</div>
              <Mat data={mat} />
              {/* Popup for Ck */}
              {openC === i && (
                <div
  ref={popupRef}
  style={{
    width: "80vw",
    maxWidth: 900,
    background: PANEL_BG,
    color: FONT_COLOR,
    border: `2px solid ${PANEL_BORDER}`,
    boxShadow: PANEL_SHADOW,
    minHeight: 320,
    position: "fixed",
    left: "50%",
    top: "50%", // <-- changed
    transform: "translate(-50%, -50%)", // <-- changed
    zIndex: 99,
    padding: "2rem 5rem 2rem 1.5rem",
    display: "flex",
    flexDirection: "column",
  alignItems: "center", 
    gap: 0,
    overflow: "hidden",
    borderRadius: "16px"
  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
    style={{
      position: "absolute",
      top: 12,
      right: 18,
      background: "#eee",
      border: `1px solid ${INFO_BORDER}`,
      borderRadius: "0.5rem",
      fontWeight: "bold",
      cursor: "pointer",
      padding: "0.2rem 0.7rem",
      fontSize: "1.2rem"
    }}
                    onClick={() => setOpenC(null)}
                  >
                    ×
                  </button>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {cKeys[i]} Details
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.2rem",
                    }}
                  >
                    {(() => {
                      const parts = getCFormulaParts(i);
                      return (
                        <>
                          {parts.map((part, idx) =>
                            typeof part === "string" ? (
                              <span
                                key={idx}
                                style={{
                                  fontSize: "1.5rem",
                                  fontWeight: "bold",
                                  margin: "0 0.3rem",
                                }}
                              >
                                {part}
                              </span>
                            ) : (
                              <Mat
                                key={part.pi}
                                data={P[parseInt(part.pi, 10) - 1]}
                                label={`P${part.pi}`}
                              />
                            )
                          )}
                         <span
  style={{ fontSize: "2rem", fontWeight: "bold" }}
>
  =
</span>
<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
  <div style={{ fontWeight: "bold", textAlign: "center" }}>
    {cKeys[i]}
  </div>
  <Mat data={mat} />
</div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };
  /**
   * ─── FinalCombinedMatrixView Component ────────────────────────────────
   * Combines the 4 final matrices (C1, C2, C3, C4) into a single matrix,
   * placing them as: C1 = top left, C2 = top right, C3 = bottom left, C4 = bottom right.
   */
  const FinalCombinedMatrixView = () => {
    // Hooks must be at the top!
    const [openPopup, setOpenPopup] = useState(false);
    const popupRef = useRef();

    // Close popup when clicking outside
    useEffect(() => {
      if (!openPopup) return;
      const handleClick = (e) => {
        if (popupRef.current && !popupRef.current.contains(e.target)) {
          setOpenPopup(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [openPopup]);

    // Get the 7 combined matrices from CombinedOuterBoxView
    const boxPairs = extractBoxViewPairs(operands);

    // Defensive: If not enough combined matrices, show nothing
    if (!boxPairs || boxPairs.length < 7) return null;

    // Recompute the 7 combined matrices as in FinalCFormulaView
    const combinedMatrices = boxPairs.map((_, boxIndex) => {
      const keys = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"];
      let M = {};
      keys.forEach((key, i) => {
        const [left, right] = extractBoxViewPairs(
          prepareStrassenOperands(...boxPairs[boxIndex])
        )[i] || [[], []];
        M[`M${i + 1}`] =
          left.length && right.length ? strassen(left, right) : [];
      });
      const cResults = prepareCOperands(M);
      const [C11, C12, C21, C22] = ["C11", "C12", "C21", "C22"].map(
        (k) => cResults[k]
      );
      if (
        C11 &&
        C12 &&
        C21 &&
        C22 &&
        C11.length &&
        C12.length &&
        C21.length &&
        C22.length
      ) {
        return join(C11, C12, C21, C22);
      }
      return [];
    });

    // Now apply the formulas to the 7 combined matrices
    // (P1 = combinedMatrices[0], ..., P7 = combinedMatrices[6])
    const P = combinedMatrices;
    const addMat = (A, B) => {
      if (!A || !A.length) return B;
      if (!B || !B.length) return A;
      return A.map((r, i) => r.map((v, j) => v + B[i][j]));
    };
    const subMat = (A, B) => {
      if (!A || !A.length) return B ? B.map((row) => row.map((v) => -v)) : [];
      if (!B || !B.length) return A;
      return A.map((r, i) => r.map((v, j) => v - B[i][j]));
    };

    const C1 = addMat(addMat(subMat(addMat(P[0], P[3]), P[4]), P[6]), []);
    const C2 = addMat(P[2], P[4]);
    const C3 = addMat(P[1], P[3]);
    const C4 = addMat(addMat(subMat(P[0], P[1]), P[2]), P[5]);

    // Combine the 4 matrices into one
    const combinedFinal = join(C1, C2, C3, C4);

    // Helper to render a quadrant with label
    const QuadrantWithLabel = ({ data, label }) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "0.2rem" }}>
          {label}
        </div>
        <Mat data={data} />
      </div>
    );

    return (
      <>
        <h2 style={{textAlign:"center"}}>Combination stage A(2) (Final Combined Matrix)</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{ cursor: "pointer", display: "inline-block" }}
            onClick={() => setOpenPopup(true)}
            title="Click to see quadrants"
          >
            <Mat data={combinedFinal} label="C (Final Result)" />
          </div>
          {openPopup && (
            <div
  ref={popupRef}
  style={{
    width: "80vw",
    maxWidth: 900,
    background: PANEL_BG,
    color: FONT_COLOR,
    border: `2px solid ${PANEL_BORDER}`,
    boxShadow: PANEL_SHADOW,
    minHeight: 320,
    position: "fixed",
    left: "50%",
    top: "50%", // <-- changed
    transform: "translate(-50%, -50%)", // <-- changed
    zIndex: 99,
    padding: "2rem 5rem 2rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
    overflow: "hidden",
    borderRadius: "16px"
  }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
    style={{
      position: "absolute",
      top: 12,
      right: 18,
      background: "#eee",
      border: `1px solid ${INFO_BORDER}`,
      borderRadius: "0.5rem",
      fontWeight: "bold",
      cursor: "pointer",
      padding: "0.2rem 0.7rem",
      fontSize: "1.2rem"
    }}
                onClick={() => setOpenPopup(false)}
              >
                ×
              </button>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  marginBottom: "1rem",
                }}
              >
                Final Matrix Quadrants
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateRows: "1fr 1fr",
                  gap: "1.5rem",
                  alignItems: "center",
                  justifyItems: "center",
                }}
              >
                <QuadrantWithLabel data={C1} label="C1" />
                <QuadrantWithLabel data={C2} label="C2" />
                <QuadrantWithLabel data={C3} label="C3" />
                <QuadrantWithLabel data={C4} label="C4" />
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  /**
   * ─── Main Render ────────────────────────────────────────────────
   * Renders the UI and the current visualization stage.
   */
  return (
    <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "2rem",
      background: PANEL_BG,
      fontFamily: FONT_FAMILY,
      color: FONT_COLOR,
    }}
  >
      <div style={{ width: "100%", maxWidth: 1100 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem"
          }}
        >
          <h1 style={{
            textAlign: "center",
            margin: 0,
            flex: 1,
            fontSize: "2rem",
            color: FONT_COLOR,
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
          }}>
            Strassen&apos;s Matrix Multiplication Visualizer
          </h1>
          <div
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              zIndex: 1000,
            }}
          >
            <HomeButton onClick={home} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          {stage === 0 ? (
            <>
              <label style={{ display: "flex", alignItems: "center", gap: "0.7rem", fontWeight: 500 }}>
                Matrix size (n×n, power of 2):{" "}
                <StyledSelect
                  value={n}
                  onChange={e => setN(Number(e.target.value))}
                  style={{ marginRight: "1rem" }}
                >
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                  <option value={8}>8</option>
                </StyledSelect>
              </label>
              <ProgressButton onClick={start}>Start</ProgressButton>
            </>
          ) : (
            <>
              <ProgressButton onClick={next}
              disabled={stage === 9}>Next Step</ProgressButton>
              <ProgressButton onClick={previous}
              disabled={stage === 1}>Previous Step</ProgressButton>
              <ProgressButton onClick={reset}>Reset</ProgressButton>
            </>
          )}
        </div>
        {/* Info message below progress buttons */}
        {stage >= 3 && ![4].includes(stage) && (
          <div style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            color: "#444",
            fontSize: "1.07rem",
            background: "#f3f4f6",
            border: "1.5px solid #b0ada8",
            borderRadius: "0.7em",
            padding: "0.7em 1.2em",
            maxWidth: 600,
            marginLeft: "auto",
            marginRight: "auto"
          }}>
            Click on a box to see how that matrix is formed.
          </div>
        )}
        {/* ...rest of your views... */}
        {stage === 1 && <OriginalView />}
        {stage === 2 && <DivideView />}
        {stage === 3 && <BoxView />}
        {stage === 4 && <QuadrantBoxView />}
        {stage === 5 && <SecondBoxView />}
        {stage === 6 && <FourInnerBoxView />}
        {stage === 7 && <CombinedOuterBoxView />}
        {stage === 8 && <FinalCFormulaView />}
        {stage === 9 && <FinalCombinedMatrixView />}
      </div>
    </div>
  );
}
