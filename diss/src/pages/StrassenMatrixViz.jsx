import React, { useState } from "react";

// ─── helpers ─────────────────────────────────────────────────────────
const rand = () => Math.floor(Math.random() * 10);
const gen = (n) => Array.from({ length: n }, () => Array.from({ length: n }, rand));
const add = (A, B) => A.map((r, i) => r.map((v, j) => v + B[i][j]));
const sub = (A, B) => A.map((r, i) => r.map((v, j) => v - B[i][j]));
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
const join = (C11, C12, C21, C22) => {
  const top = C11.map((r, i) => [...r, ...C12[i]]);
  const bot = C21.map((r, i) => [...r, ...C22[i]]);
  return [...top, ...bot];
};

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


function detailExplanation(miKey) {
  switch (miKey) {
    case "M1":
      return (
        <>
          <p><strong>M1 = (A11 + A22) × (B11 + B22)</strong></p>
          <ol>
            <li><b>Add</b> A<sub>11</sub> and A<sub>22</sub> ⇒ S<sub>1</sub>.</li>
            <li><b>Add</b> B<sub>11</sub> and B<sub>22</sub> ⇒ S<sub>2</sub>.</li>
            <li><b>Recursively multiply</b> S<sub>1</sub> × S<sub>2</sub> to get M1.</li>
          </ol>
          <p>Captures the “cross‑diagonal” contribution of both matrices.</p>
        </>
      );

    case "M2":
      return (
        <>
          <p><strong>M2 = (A21 + A22) × B11</strong></p>
          <ol>
            <li><b>Add</b> A<sub>21</sub> and A<sub>22</sub> ⇒ S<sub>3</sub>.</li>
            <li><b>Recursively multiply</b> S<sub>3</sub> × B<sub>11</sub> to get M2.</li>
          </ol>
          <p>Injects the lower‑left block of <em>A</em> into the upper‑left block of <em>B</em>.</p>
        </>
      );

    case "M3":
      return (
        <>
          <p><strong>M3 = A11 × (B12 − B22)</strong></p>
          <ol>
            <li><b>Subtract</b> B<sub>12</sub> − B<sub>22</sub> ⇒ S<sub>4</sub>.</li>
            <li><b>Recursively multiply</b> A<sub>11</sub> × S<sub>4</sub> to get M3.</li>
          </ol>
          <p>Uses the top‑left of <em>A</em> and the right column difference of <em>B</em>.</p>
        </>
      );

    case "M4":
      return (
        <>
          <p><strong>M4 = A22 × (B21 − B11)</strong></p>
          <ol>
            <li><b>Subtract</b> B<sub>21</sub> − B<sub>11</sub> ⇒ S<sub>5</sub>.</li>
            <li><b>Recursively multiply</b> A<sub>22</sub> × S<sub>5</sub> to get M4.</li>
          </ol>
          <p>Combines the lower‑right of <em>A</em> with the left column difference of <em>B</em>.</p>
        </>
      );

    case "M5":
      return (
        <>
          <p><strong>M5 = (A11 + A12) × B22</strong></p>
          <ol>
            <li><b>Add</b> A<sub>11</sub> + A<sub>12</sub> ⇒ S<sub>6</sub>.</li>
            <li><b>Recursively multiply</b> S<sub>6</sub> × B<sub>22</sub> to get M5.</li>
          </ol>
          <p>Captures top‑row contribution of <em>A</em> with bottom‑right of <em>B</em>.</p>
        </>
      );

    case "M6":
      return (
        <>
          <p><strong>M6 = (A21 − A11) × (B11 + B12)</strong></p>
          <ol>
            <li><b>Subtract</b> A<sub>21</sub> − A<sub>11</sub> ⇒ S<sub>7</sub>.</li>
            <li><b>Add</b> B<sub>11</sub> + B<sub>12</sub> ⇒ S<sub>8</sub>.</li>
            <li><b>Recursively multiply</b> S<sub>7</sub> × S<sub>8</sub> to get M6.</li>
          </ol>
          <p>Balances a row‑difference of <em>A</em> with a column‑sum of <em>B</em>.</p>
        </>
      );

    case "M7":
      return (
        <>
          <p><strong>M7 = (A12 − A22) × (B21 + B22)</strong></p>
          <ol>
            <li><b>Subtract</b> A<sub>12</sub> − A<sub>22</sub> ⇒ S<sub>9</sub>.</li>
            <li><b>Add</b> B<sub>21</sub> + B<sub>22</sub> ⇒ S<sub>10</sub>.</li>
            <li><b>Recursively multiply</b> S<sub>9</sub> × S<sub>10</sub> to get M7.</li>
          </ol>
          <p>Ties together right‑column and bottom‑row adjustments.</p>
        </>
      );

    default:
      return null;
  }
}

function combineExplanation(qKey, Mi, mat) {
  const rhsTokens = {
    C11: ["M1", "+", "M4", "−", "M5", "+", "M7"],
    C12: ["M3", "+", "M5"],
    C21: ["M2", "+", "M4"],
    C22: ["M1", "+", "M3", "−", "M2", "+", "M6"],
  }[qKey];

  if (!rhsTokens) return null;


  const renderMatOrScalar = (matrix) =>
    matrix.length === 1 && matrix[0].length === 1 ? (
      <span style={{ fontWeight: "bold" }}>{matrix[0][0]}</span>
    ) : (
      <Mat data={matrix} />
    );

  return (
    <>
      {/* heading */}
      <h3 style={{ marginTop: 0 }}>{qKey} combination</h3>

      {/* LHS = RHS line */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {/* left‑hand side */}
        {renderMatOrScalar(mat)}
        <span style={{ fontSize: 22, fontWeight: "bold" }}>=</span>
        {/* right‑hand side: Mi numeric matrices and operators */}
        {rhsTokens.map((tok, i) =>
          tok.startsWith("M") ? (
            <React.Fragment key={i}>{renderMatOrScalar(Mi[tok])}</React.Fragment>
          ) : (
            <span key={i} style={{ fontSize: 22, fontWeight: "bold" }}>{tok}</span>
          )
        )}
      </div>

      {/* symbolic formula for reference */}
      <p style={{ marginTop: "0.8rem" }}>
        <strong>Symbolic:</strong>&nbsp;{qKey} = {rhsTokens.join(" ")}
      </p>
    </>
  );
}




// ─── Matrix renderer ────────────────────────────────────────────────
const Mat = ({ data, label, border }) => (
  <div style={{ margin: "0.5rem", display: "inline-block", position: "relative" }}>
    {label && <div style={{ fontWeight: "bold", textAlign: "center" }}>{label}</div>}
    <table style={{ borderCollapse: "collapse" }}>
      <tbody>
        {data.map((r, i) => (
          <tr key={i}>
            {r.map((v, j) => (
              <td
                key={j}
                style={{
                  border: "1px solid #333",
                  width: 28,
                  height: 28,
                  textAlign: "center",
                  userSelect: "none",
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

const quadColors = ["#f44336", "#2196f3", "#4caf50", "#ff9800"];

// ─── Visualizer component ───────────────────────────────────────────
export default function StrassenVisualizer() {
  const [n, setN] = useState(4);
  const [A, setA] = useState([]);
  const [B, setB] = useState([]);
  /* stage: 0 idle ▸ 1 original  ▸ 2 divide ▸3 formulas ▸  4 conquer ▸ 5 formulas (cij) ▸ 6 combine */
  const [stage, setStage] = useState(0);
  const [Mi, setMi] = useState({});
  const [C, setC] = useState([]);
  const [openFormula, setOpenFormula] = useState(null); // null or "M1"…"M7"
  const [Cquads, setCquads] = useState({ C11: [], C12: [], C21: [], C22: [] });
  const [openCombine, setOpenCombine] = useState(null);  // "C11" | "C12" | ...




  const reset = () => {
    setStage(0);
    setA([]);
    setB([]);
    setMi({});
    setC([]);
  };
  const start = () => {
    if (n < 2 || (n & (n - 1)) !== 0) {
      alert("n must be a power of 2 and ≥ 2");
      return;
    }
    setA(gen(n));
    setB(gen(n));
    setStage(1); 
    setMi({});
    setC([]);
  };

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

  // navigation handlers
  const next = () => {
    if (stage === 1)      setStage(2);
    else if (stage === 2) setStage(3);
    else if (stage === 3) { computeMiC(); setStage(4); }
    else if (stage === 4) setStage(5);       
    else if (stage === 5) setStage(6);
  };
  
  const prev = () => {
    if (openCombine) { setOpenCombine(null); return; }  
    if (openFormula) { setOpenFormula(null); return; }
    if (stage === 6) setStage(5);
    else if (stage === 5) setStage(4);
    else if (stage === 4) setStage(3);
    else if (stage === 3) setStage(2);
    else if (stage === 2) setStage(1);
    else if (stage === 1) setStage(0);
  };
  
  

  const complete = () => {
    // If we are NOT yet at the final stage
    if (stage < 6) {
      if (stage < 4) computeMiC();
      setStage(6);
    }
  };
  
  

  const [A11, A12, A21, A22] = A.length ? split(A) : [[], [], [], []];
  const [B11, B12, B21, B22] = B.length ? split(B) : [[], [], [], []];

  // ─── views ──────────────────────────────────────────
  const OriginalView = () => (
    <>
      <h2>Original Input Matrices</h2>
      <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
        <Mat data={A} label="Matrix A" />
        <Mat data={B} label="Matrix B" />
      </div>
      <p style={{ marginTop: "1rem" }}>
        Press <b>Next</b> to divide each matrix into quadrants.
      </p>
    </>
  );
  const formulaText = [
    { key: "M1", expr: "(A11 + A22)(B11 + B22)" },
    { key: "M2", expr: "(A21 + A22) · B11" },
    { key: "M3", expr: "A11 · (B12 − B22)" },
    { key: "M4", expr: "A22 · (B21 − B11)" },
    { key: "M5", expr: "(A11 + A12) · B22" },
    { key: "M6", expr: "(A21 − A11)(B11 + B12)" },
    { key: "M7", expr: "(A12 − A22)(B21 + B22)" },
  ];
  
  

  const DivideView = () => (
    <>
      <h2>Divide stage</h2>
      {/* original matrices with colored quadrant overlays */}
      <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Mat data={A} label="Matrix A" />
          {split(A).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                border: `3px solid ${quadColors[i]}`,
                top: i < 2 ? 0 : "50%",
                left: i % 2 ? "50%" : 0,
                width: "50%",
                height: "50%",
                boxSizing: "border-box",
              }}
            />
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <Mat data={B} label="Matrix B" />
          {split(B).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                border: `3px solid ${quadColors[i]}`,
                top: i < 2 ? 0 : "50%",
                left: i % 2 ? "50%" : 0,
                width: "50%",
                height: "50%",
                boxSizing: "border-box",
              }}
            />
          ))}
        </div>
      </div>
  
      {/* list submatrices of A below with matching arrows */}
      <h3 style={{ marginTop: "1.5rem" }}>Matrix A Quadrants</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        {[A11, A12, A21, A22].map((q, i) => (
          <div
            key={i}
            style={{
              border: `2px solid ${quadColors[i]}`,
              padding: "0.3rem",
              display: "inline-block",
            }}
          >
            <Mat data={q} />
          </div>
        ))}
      </div>
  
      {/* list submatrices of B below */}
      <h3 style={{ marginTop: "1.5rem" }}>Matrix B Quadrants</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        {[B11, B12, B21, B22].map((q, i) => (
          <div
            key={i}
            style={{
              border: `2px solid ${quadColors[i]}`,
              padding: "0.3rem",
              display: "inline-block",
            }}
          >
            <Mat data={q} />
          </div>
        ))}
      </div>
    </>
  );
  

  //change it such that we go deeper into the recursion. each matrix will be divivided and undergo the same 7 recursive multiplications until a base case of 1x1 is reached.
  //need to chane until that.
  const FormulaStage = () => (
    <>
      <h2>Formulas stage</h2>
      <p>Click a formula for a detailed, step‑by‑step explanation.</p>

      {/* clickable formula cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        {[
          { key: "M1", expr: "(A11 + A22)(B11 + B22)" },
          { key: "M2", expr: "(A21 + A22)·B11" },
          { key: "M3", expr: "A11·(B12 − B22)" },
          { key: "M4", expr: "A22·(B21 − B11)" },
          { key: "M5", expr: "(A11 + A12)·B22" },
          { key: "M6", expr: "(A21 − A11)(B11 + B12)" },
          { key: "M7", expr: "(A12 − A22)(B21 + B22)" },
        ].map(({ key, expr }, i) => (
          <div
            key={key}
            onClick={() => setOpenFormula(key)}
            style={{
              border: `2px solid ${quadColors[i % 4]}`,
              padding: "0.4rem 0.6rem",
              cursor: "pointer",
            }}
          >
            <strong>{key}</strong>&nbsp;=&nbsp;{expr}
          </div>
        ))}
      </div>

      {/* ==== NEW: visual gallery of all quadrants ==== */}
      <h3 style={{ marginTop: "1.4rem" }}>Quadrants reference</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {[
          { lab: "A11", mat: A11, col: quadColors[0] },
          { lab: "A12", mat: A12, col: quadColors[1] },
          { lab: "A21", mat: A21, col: quadColors[2] },
          { lab: "A22", mat: A22, col: quadColors[3] },
          { lab: "B11", mat: B11, col: quadColors[0] },
          { lab: "B12", mat: B12, col: quadColors[1] },
          { lab: "B21", mat: B21, col: quadColors[2] },
          { lab: "B22", mat: B22, col: quadColors[3] },
        ].map(({ lab, mat, col }) => (
          <div
            key={lab}
            style={{
              border: `2px solid ${col}`,
              padding: "0.25rem",
              display: "inline-block",
            }}
          >
            <Mat data={mat} label={lab} />
          </div>
        ))}
      </div>

      {/* modal popup for detailed explanation */}
      {openFormula && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -30%)",
            background: "white",
            border: "1px solid #888",
            padding: "1rem",
            zIndex: 10,
            maxWidth: 420,
          }}
        >
          {detailExplanation(openFormula)}
          <button onClick={() => setOpenFormula(null)} style={{ marginTop: "0.8rem" }}>
            Close
          </button>
        </div>
      )}
    </>
  );


  const ConquerView = () => (
    <>
      <h2>Conquer stage</h2>
      <p>This stage would show the 7 Strassen multiplications (M1 through M7) recursively computed.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {["M1", "M2", "M3", "M4", "M5", "M6", "M7"].map((key, i) => (
          <div
            key={key}
            style={{
              border: `3px solid ${quadColors[i % 4]}`,
              padding: "0.3rem",
              display: "inline-block",
              minWidth: 120,
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>{key}</div>
            {Mi[key] ? <Mat data={Mi[key]} /> : "Loading..."}
          </div>
        ))}
      </div>
      <p style={{ marginTop: "1rem" }}>
        Press <b>Next</b> to see the formulas used to combine the 7 products into the final matrix C.
      </p>
    </>
  );

  const CombineFormulaStage = () => (
    <>
      <h2>Combine‑formulas stage</h2>
      <p>Click a quadrant to see how the products are combined.</p>
  
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {[
          { lab: "C11", expr: "M1 + M4 − M5 + M7", mat: Cquads.C11, col: "#f44336" },
          { lab: "C12", expr: "M3 + M5",           mat: Cquads.C12, col: "#2196f3" },
          { lab: "C21", expr: "M2 + M4",           mat: Cquads.C21, col: "#4caf50" },
          { lab: "C22", expr: "M1 + M3 − M2 + M6", mat: Cquads.C22, col: "#ff9800" },
        ].map(({ lab, expr, mat, col }) => (
          <div
            key={lab}
            onClick={() => setOpenCombine(lab)}
            style={{
              border: `3px solid ${col}`,
              padding: "0.4rem",
              cursor: "pointer",
              display: "inline-block",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "0.3rem" }}>
              {lab} = {expr}
            </div>
            {mat.length ? <Mat data={mat} /> : "Loading…"}
          </div>
        ))}
      </div>
  
      {/* pop‑up modal */}
      {openCombine && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -30%)",
            background: "white",
            border: "1px solid #888",
            padding: "1rem",
            zIndex: 15,
            maxWidth: 460,
          }}
        >
          {combineExplanation(openCombine, Mi,Cquads[openCombine])}
          <button onClick={() => setOpenCombine(null)} style={{ marginTop: "0.8rem" }}>
            Close
          </button>
        </div>
      )}
    </>
  );
  
  

  const CombineView = () => (
    <>
      <h2>Combine stage</h2>
      <p>The final product matrix C is computed by combining M1 through M7.</p>
      {C.length ? <Mat data={C} label="Matrix C = A × B" /> : <p>Computing...</p>}
      <p style={{ marginTop: "1rem" }}>
        Press <b>Reset</b> to start over.
      </p>
    </>
  );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 20, maxWidth: 900, margin: "auto" }}>
      <h1>Strassen's Matrix Multiplication Visualizer</h1>

      {/* Input for n */}
      <label>
        Matrix size (n × n, power of 2, min 2):
        <input
          type="number"
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          min={2}
          step={1}
          style={{ width: 60, marginLeft: 8 }}
        />
      </label>

      {/* Buttons */}
      <div style={{ marginTop: 12, marginBottom: 12 }}>
        {stage === 0 && (
          <button onClick={start} style={{ marginRight: 10 }}>  
            Start
          </button>
        )}
        {stage > 0 && stage <= 6 && (
          <>
            <button onClick={prev} disabled={stage <= 1} style={{ marginRight: 10 }}>
              Prev
            </button>
            <button onClick={next} disabled={stage == 6} style={{ marginRight: 10 }}>
              Next
            </button>
            <button onClick={complete} disabled={stage == 6 || stage ==5    } style={{ marginRight: 10 }}>
              Complete
            </button>
            <button onClick={reset} style={{ marginRight: 10 }}>
              Reset
            </button>
          </>
        )}
      </div>  

      {/* Conditional views */}
      {stage === 0 && <p>Set matrix size and press Start.</p>}
      {stage === 1 && <OriginalView />}
      {stage === 2 && <DivideView />}
      {stage === 3 && <FormulaStage />}
      {stage === 4 && <ConquerView />}
      {stage === 5 && <CombineFormulaStage />}
      {stage === 6 && <CombineView />}
    </div>
  );
}
