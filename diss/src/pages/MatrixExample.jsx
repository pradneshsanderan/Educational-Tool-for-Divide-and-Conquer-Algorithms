import React from "react";
import { useNavigate } from "react-router-dom";
import PrevButton from "../PrevButton";
import HomeButton from "../HomeButton";

// Three sets of painted images for cycling
const splitImagesSets = [
  [
    { empty: "/canvas/split1.png", painted: "/canvas/splitpaint1.png" },
    { empty: "/canvas/split2.png", painted: "/canvas/splitpaint2.png" },
    { empty: "/canvas/split3.png", painted: "/canvas/splitpaint3.png" },
    { empty: "/canvas/split4.png", painted: "/canvas/splitpaint4.png" },
  ],
  [
    { empty: "/canvas/split1.png", painted: "/canvas/splitpaint21.png" },
    { empty: "/canvas/split2.png", painted: "/canvas/splitpaint22.png" },
    { empty: "/canvas/split3.png", painted: "/canvas/splitpaint23.png" },
    { empty: "/canvas/split4.png", painted: "/canvas/splitpaint24.png" },
  ],
  [
    { empty: "/canvas/split1.png", painted: "/canvas/splitpaint31.png" },
    { empty: "/canvas/split2.png", painted: "/canvas/splitpaint32.png" },
    { empty: "/canvas/split3.png", painted: "/canvas/splitpaint33.png" },
    { empty: "/canvas/split4.png", painted: "/canvas/splitpaint34.png" },
  ],
];

const paintedFullImages = [
  "/canvas/paintedfull.png",
  "/canvas/paintedfull2.png",
  "/canvas/paintedfull3.png",
];

// Module-level variable to persist across resets
let globalPaintSetIdx = 0;

export default function MatrixExample() {
  const navigate = useNavigate();

  // Cycle through sets on each mount/reset
  const [paintSetIdx, setPaintSetIdx] = React.useState(() => {
    const idx = globalPaintSetIdx;
    globalPaintSetIdx = (globalPaintSetIdx + 1) % splitImagesSets.length;
    return idx;
  });
  const splitImages = splitImagesSets[paintSetIdx];
  const paintedFull = paintedFullImages[paintSetIdx];

  const [step, setStep] = React.useState("full"); // full, split, painted, combining, combined
  const [showSplits, setShowSplits] = React.useState(false);
  const [painted, setPainted] = React.useState([false, false, false, false]);
  const [combineAnim, setCombineAnim] = React.useState(false);
  const [splitGap, setSplitGap] = React.useState(0);
  const [showPaintedFull, setShowPaintedFull] = React.useState(false);
  const [infoStep, setInfoStep] = React.useState("start");

  // Handle Divide
  const handleDivide = () => {
    setStep("split");
    setShowSplits(true);
    setSplitGap(0); // Start with no gap
    setTimeout(() => setSplitGap(24), 500); // Increase gap after 0.5s
    setInfoStep("split");
  };

  // Handle Conquer (paint each split one by one)
  const handleConquer = () => {
    setStep("painted");
    setInfoStep("painted");
    setTimeout(() => {
      let i = 0;
      function paintNext() {
        setPainted(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        i++;
        if (i < 4) {
          setTimeout(paintNext, 400);
        } else {
          setTimeout(() => {
            setPainted(prev => {
              const next = [...prev];
              next[0] = true;
              return next;
            });
          }, 400);
        }
      }
      paintNext();
    }, 0);
  };

  // Handle Combine (move splits close together, then show painted full)
  const handleCombine = () => {
    setStep("combining");
    setCombineAnim(true);
    setSplitGap(0); // Move splits close together
    setInfoStep("combining");
    setTimeout(() => {
      setShowPaintedFull(true); // Show painted full image
      setCombineAnim(false);
      setStep("combined");
      setInfoStep("combined");
    }, 500);
  };

  // Reset for demo purposes (cycle to next set)
  const handleReset = () => {
    setPaintSetIdx(() => {
      const idx = globalPaintSetIdx;
      globalPaintSetIdx = (globalPaintSetIdx + 1) % splitImagesSets.length;
      return idx;
    });
    setStep("full");
    setShowSplits(false);
    setPainted([false, false, false, false]);
    setCombineAnim(false);
    setSplitGap(0);
    setShowPaintedFull(false);
    setInfoStep("start");
  };

  // Button states
  const isDivideActive = step === "full";
  const isConquerActive = step === "split";
  const isCombineActive = step === "painted" && painted.every(Boolean);

  // Info box content based on infoStep
  let infoContent;
  if (infoStep === "start") {
    infoContent = (
      <>
        <b>Why divide</b> <br />
        We want to paint the canvas, but it's too big to paint by ourselves.<br />
        So, we'll divide the canvas into smaller pictures to make it easier to paint.<br />
        <span style={{ color: "#6366f1", fontWeight: 500 }}>
          Click on the <b>Divide</b> button to split the canvas.
        </span>
      </>
    );
  } else if (infoStep === "split") {
    infoContent = (
      <>
        <b>Now we can paint</b> <br />
        Now that we have split the canvas, we can paint each smaller canvas individually and independently.<br />
        <span style={{ color: "#6366f1", fontWeight: 500 }}>
          Click on the <b>Conquer</b> button to paint each smaller canvas.
        </span>
      </>
    );
  } else if (infoStep === "painted") {
    infoContent = (
      <>
        <b>Let's combine</b> <br />
        Now that we have finished painting each canvas, we can combine them to create the bigger canvas.<br />
        <span style={{ color: "#6366f1", fontWeight: 500 }}>
          Click on the <b>Combine</b> button to combine all the smaller canvases.
        </span>
      </>
    );
  } else if (infoStep === "combining" || infoStep === "combined") {
    infoContent = (
      <>
        <b>All done</b> <br />
        We have now combined the canvas and finished painting the entire image.<br />
        <span style={{ color: "#6366f1", fontWeight: 500 }}>
          Click on <b>Reset</b> to try it again.
        </span>
      </>
    );
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center", background: "#F9F6F2", minHeight: "100vh" }}>
      <div
  style={{
    width: 800,
    minHeight: 120,
    marginTop: "2.5rem",
    marginBottom: "2.5rem",
    borderRadius: "24px",
    background: "rgb(229, 226, 221)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 16px 0 rgba(33,150,243,0.08)",
    border: "2px solid #1B1A17",
    marginLeft: "auto",
    marginRight: "auto",
  }}
>
  <div style={{ width: "100%", textAlign: "center" }}>
    <h2
      style={{
        color: "#2e3440",
        fontWeight: 700,
        fontSize: "1.6rem",
        letterSpacing: "0.02em",
        textAlign: "center",
        width: "100%",
        marginBottom: "1rem",
        marginTop: 0,
      }}
    >
      Painting a canvas : Strassens matrix multiplication
    </h2>
    <div
      style={{
        color: "#1B1A17",
        fontSize: "1.08rem",
        fontWeight: 400,
        maxWidth: 700,
        margin: "0 auto",
        opacity: 0.92,
        lineHeight: 1.7,
      }}
    >
      <div>
        <b>Divide</b> – split the canvas into smaller pieces
      </div>
      <div>
        <b>Conquer</b> – paint each piece individually
      </div>
      <div>
        <b>Combine</b> – merge the painted pieces into the full canvas
      </div>
    </div>
  </div>
</div>
      {/* Canvas Display */}
      <div style={{ minHeight: 350, marginBottom: "2rem", position: "relative" }}>
        {/* Full Canvas */}
        {step === "full" && (
          <img
            src="/canvas/fullcanvas.png"
            alt="Full Canvas"
            style={{ width: 400, height: 400, borderRadius: 12, boxShadow: "0 2px 12px #0002" }}
          />
        )}

        {/* Split Canvas */}
        {(step === "split" || step === "painted" || step === "combining") && showSplits && !showPaintedFull && (
          <div
            style={{
              width: 400,
              height: 400,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              gap: `${splitGap}px`,
              position: "relative",
              transition: "gap 0.5s cubic-bezier(.4,2,.6,1)",
              ...(combineAnim
                ? {
                    transform: "scale(0.98)",
                    opacity: 0.9,
                  }
                : {}),
            }}
          >
            {splitImages.map((img, idx) => (
              <img
                key={idx}
                src={
                  step === "painted" || step === "combining"
                    ? painted[idx]
                      ? img.painted
                      : img.empty
                    : img.empty
                }
                alt={`Split ${idx + 1}`}
                style={{
                  width: 200,
                  height: 200,
                  border: "1px solid #bbb",
                  borderRadius: 6,
                  boxSizing: "border-box",
                  transition: "box-shadow 0.3s, filter 0.3s",
                  boxShadow: painted[idx] ? "0 0 16px #f59e42" : "none",
                  filter: painted[idx] ? "brightness(1.08)" : "none",
                  zIndex: 2,
                }}
              />
            ))}
          </div>
        )}

        {/* Painted Full Canvas (after combine) */}
        {showPaintedFull && (
          <img
            src={paintedFull}
            alt="Painted Full Canvas"
            style={{
              width: 400,
              height: 400,
              borderRadius: 12,
              boxShadow: "0 2px 12px #0002",
              display: "block",
              margin: "0 auto",
              animation: "fadein 0.7s",
            }}
          />
        )}
      </div>

      {/* Buttons and Navigation remain unchanged */}
       <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button
          onClick={handleDivide}
          disabled={!isDivideActive}
          style={{
            padding: "0.7rem 1.75rem",
            fontSize: "1rem",
            borderRadius: "1rem",
            border: "1px solid #2A2925",
            background: isDivideActive ? "#e0f2fe" : "#e5e7eb",
            color: isDivideActive ? "#0077cc" : "#888",
            cursor: isDivideActive ? "pointer" : "not-allowed",
            fontWeight: "bold",
            transition: "background 0.2s",
            minWidth: "105px"
          }}
        >
          Divide
        </button>
        <button
          onClick={handleConquer}
          disabled={!isConquerActive}
          style={{
            padding: "0.7rem 1.75rem",
            fontSize: "1rem",
            borderRadius: "1rem",
            border: "1px solid #2A2925",
            background: isConquerActive ? "#dcfce7" : "#e5e7eb",
            color: isConquerActive ? "#166534" : "#888",
            cursor: isConquerActive ? "pointer" : "not-allowed",
            fontWeight: "bold",
            transition: "background 0.2s",
            minWidth: "105px"
          }}
        >
          Conquer
        </button>
        <button
          onClick={handleCombine}
          disabled={!isCombineActive}
          style={{
            padding: "0.7rem 1.75rem",
            fontSize: "1rem",
            borderRadius: "1rem",
            border: "1px solid #2A2925",
            background: isCombineActive ? "#ede9fe" : "#e5e7eb",
            color: isCombineActive ? "#7c3aed" : "#888",
            cursor: isCombineActive ? "pointer" : "not-allowed",
            fontWeight: "bold",
            opacity: isCombineActive ? 1 : 0.5,
            transition: "background 0.2s",
            minWidth: "105px"
          }}
        >
          Combine
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: "0.7rem 1.75rem",
            fontSize: "1rem",
            borderRadius: "1rem",
            border: "1px solid #2A2925",
            background: "#fef9c3",
            color: "#b45309",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background 0.2s",
            minWidth: "105px"
          }}
        >
          Reset
        </button>
      </div>
      {/* ...navigation and style remain unchanged... */}
      <div style={{ position: "absolute", top: "1.5rem", right: "2rem", zIndex: 20, display: "flex", gap: "1rem" }}>
        <PrevButton onClick={() => navigate(-1)} />
        <HomeButton onClick={() => navigate("/")} />
      </div>
      {/* Info Box */}
       <div
        style={{
          margin: "2rem auto 0 auto",
          maxWidth: "600px",
          background: "#f3f4f6",
          border: "2px solid #B0ADA8",
          borderRadius: "1rem",
          padding: "1.5rem",
          color: "#1e293b",
          fontSize: "1.1rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          textAlign: "left",
        }}
      >
        {Array.isArray(infoContent) ? (
          <ul style={{ textAlign: "left", paddingLeft: "1.2em", margin: 0 }}>
            {infoContent.map((step, idx) => (
              <li key={idx} style={{ marginBottom: "0.7em" }} dangerouslySetInnerHTML={{ __html: step }} />
            ))}
          </ul>
        ) : (
          infoContent
        )}
      </div>
      <style>{`
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}