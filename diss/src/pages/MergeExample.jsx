import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HomeButton from "../HomeButton";
import PrevButton from "../PrevButton";

// List all available test paper numbers here:
const allTestPapers = [10, 25, 40, 55, 70, 74, 86, 88, 93, 94];

// Helper to pick 6 random unique papers
function getRandomPapers() {
  const arr = [...allTestPapers];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 6);
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function divideGroups(groups) {
  // Split each group with more than 1 element into two
  let divided = [];
  for (const group of groups) {
    if (group.length > 1) {
      const mid = Math.floor(group.length / 2);
      divided.push(group.slice(0, mid));
      divided.push(group.slice(mid));
    } else {
      divided.push(group);
    }
  }
  return divided;
}

function combineGroups(groups) {
  // Merge adjacent groups and sort each merged group
  let combined = [];
  for (let i = 0; i < groups.length; i += 2) {
    if (i + 1 < groups.length) {
      const mergedGroup = [...groups[i], ...groups[i + 1]].sort((a, b) => a - b);
      combined.push(mergedGroup);
    } else {
      combined.push(groups[i]);
    }
  }
  return combined;
}

function groupToString(group) {
  return group.length === 1
    ? group[0].toString()
    : group.join(" and ");
}

export default function PaperRow() {
  const navigate = useNavigate();
  // Use getRandomPapers() for initial state
  const [groups, setGroups] = React.useState(() => [getRandomPapers()]);
  const [explanation, setExplanation] = React.useState(
    <>
      <b>Welcome!</b> <br />
      We have a shuffled set of exam papers. Let's sort them using the <b>Divide and Conquer</b> approach, just like Merge Sort.<br /><br />
      <span style={{ color: "#6366f1", fontWeight: 500 }}>
        Click <b>Divide</b> to split the shuffled exam papers into smaller groups.
      </span>
    </>
  );
  const [rotating, setRotating] = React.useState(false);

  const handleDivide = () => {
    const newGroups = divideGroups(groups);
    setGroups(newGroups);

    // Explanation for divide
    if (newGroups.length === groups.length) {
      setExplanation(
        <>
          <b>Divide complete!</b> <br />
          All exam papers are now in their own groups.<br />
          <span style={{ color: "#6366f1", fontWeight: 500 }}>
            Now, let's <b>conquer</b> by sorting each group as we combine them.
          </span>
        </>
      );
    } else {
      setExplanation(
        <>
          <b>Dividing the groups</b> <br />
          We split the shuffled exam papers into smaller groups. This makes it easier to sort them.<br />
          <span style={{ color: "#6366f1", fontWeight: 500 }}>
            Click <b>Divide</b> again until all papers are in their own groups, then <b>Conquer</b>.
          </span>
        </>
      );
    }
  };

  const handleConquer = () => {
    setRotating(true);
    setExplanation(
      <>
        <b>Conquer step</b> <br />
        In Merge Sort, the conquer step is handled during the combine phase. As we combine groups, we sort them.<br />
        <span style={{ color: "#6366f1", fontWeight: 500 }}>
          After conquering, click <b>Combine</b> to merge and sort the groups.
        </span>
      </>
    );
    setTimeout(() => {
      setRotating(false);
      setExplanation(
        <>
          <b>Ready to combine!</b> <br />
          Now that each group is ready, let's merge them together in sorted order.<br />
          <span style={{ color: "#6366f1", fontWeight: 500 }}>
            Click <b>Combine</b> to merge the groups.
          </span>
        </>
      );
    }, 3500);
  };

  const handleCombine = () => {
    let combineSteps = [];
    let combinePairs = [];
    for (let i = 0; i < groups.length; i += 2) {
      if (i + 1 < groups.length) {
        combinePairs.push(
          `the group of papers with scores <b>${groupToString(groups[i])}</b> and the group with scores <b>${groupToString(groups[i + 1])}</b>`
        );
      }
    }
    const newGroups = combineGroups(groups);
    setGroups(newGroups);

    if (newGroups.length === 1) {
      combineSteps = [
        ...combinePairs.map(
          (pair) => `We combine and sort ${pair} to form a new group.`
        ),
        `<b>All groups have been combined and sorted:</b> <span style="color:#166534"><b>${newGroups[0].join(", ")}</b></span>.<br /><br />You have completed the Merge Sort process!<br /><span style="color:#6366f1;font-weight:500;">Click <b>Reset</b> to try again with a new set of papers.</span>`
      ];
    } else if (combinePairs.length > 0) {
      combineSteps = combinePairs.map(
        (pair) => `We combine and sort ${pair} to form a new group.`
      );
      combineSteps.push(
        `<span style="color:#6366f1;font-weight:500;">Keep combining until all papers are in one sorted group.</span>`
      );
    } else {
      combineSteps = [
        "No more groups to combine.",
        `<span style="color:#6366f1;font-weight:500;">Click <b>Reset</b> to start over.</span>`
      ];
    }
    setExplanation(
      <ul style={{ textAlign: "left", paddingLeft: "1.2em", margin: 0 }}>
        {combineSteps.map((step, idx) => (
          <li key={idx} style={{ marginBottom: "0.7em" }} dangerouslySetInnerHTML={{ __html: step }} />
        ))}
      </ul>
    );
  };

  const handleReset = () => {
    setGroups([getRandomPapers()]);
    setExplanation(
      <>
        <b>Reset!</b> <br />
        The exam papers have been shuffled again.<br />
        <span style={{ color: "#6366f1", fontWeight: 500 }}>
          Click <b>Divide</b> to start sorting again.
        </span>
      </>
    );
    setRotating(false);
  };

  const handleHome = () => navigate("/");
  const handlePrevious = () => navigate("/Overview");

  return (
      <div style={{ minHeight: "100vh", width: "98%",padding: "2rem", textAlign: "center",background: "#F9F6F2" }}>
      <div style={{ position: "relative", minHeight: "2.5rem" }}>
        <div style={{ position: "absolute", top: "0.2rem", right: "0.2rem", zIndex: 10, display: "flex", gap: "1.5rem" }}>
          <PrevButton onClick={handlePrevious} />
          <HomeButton onClick={handleHome} />
        </div>
      </div>
      <div
  style={{
    width: 700,
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
        fontSize: "2rem",
        letterSpacing: "0.02em",
        textAlign: "center",
        width: "100%",
        marginBottom: "1rem",
        marginTop: 0,
      }}
    >
      Sorting Exam Papers (Merge Sort)
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
        <b>Divide</b> – split the shuffled exam papers into smaller groups
      </div>
      <div>
        <b>Conquer</b> – sort each group as you combine them (Also handled in combine)
      </div>
      <div>
        <b>Combine</b> – merge the sorted groups into one sorted list
      </div>
    </div>
  </div>
</div>
      <p className="text-gray-600" style={{ marginTop: "2rem" }}>
        These are shuffled exam papers. Let’s sort them using Divide and Conquer
      </p>
      {/* Row of Papers, grouped */}
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: "6rem",
          flexWrap: "nowrap"
        }}
      >
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
            {group.map((score, index) => (
              <motion.div
                key={score}
                className="relative"
                style={{ width: "100px", height: "133px" }}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: rotating ? 360 : 0
                }}
                transition={{
                  delay: index * 0.1,
                  duration: rotating ? 1 : 0.4
                }}
              >
                <img
                  src={`/papers/${score}test.png`}
                  alt={`Test score ${score}`}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
                <div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-bold text-black bg-white bg-opacity-70 px-1 py-0.5 rounded"
                  style={{ lineHeight: "1" }}
                >
                  {score}
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
  <button
    onClick={handleDivide}
    style={{
      padding: "0.7rem 1.75rem",           // 30% smaller
      fontSize: "1rem",                    // 30% smaller
      borderRadius: "1rem",
      border: "1px solid #2A2925",
      background: "#e0f2fe",
      color: "#0077cc",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "background 0.2s",
      minWidth: "105px"                    // 30% smaller
    }}
  >
    Divide
  </button>
  <button
    onClick={handleConquer}
    style={{
      padding: "0.7rem 1.75rem",
      fontSize: "1rem",
      borderRadius: "1rem",
      border: "1px solid #2A2925",
      background: "#dcfce7",
      color: "#166534",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "background 0.2s",
      minWidth: "105px"
    }}
  >
    Conquer
  </button>
  <button
    onClick={handleCombine}
    disabled={groups.length < 2}
    style={{
      padding: "0.7rem 1.75rem",
      fontSize: "1rem",
      borderRadius: "1rem",
      border: "1px solid #2A2925",
      background: "#ede9fe",
      color: "#7c3aed",
      cursor: groups.length < 2 ? "not-allowed" : "pointer",
      fontWeight: "bold",
      opacity: groups.length < 2 ? 0.5 : 1,
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

      {/* Stylized explanation box */}
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
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
  }}
>
  {Array.isArray(explanation) ? (
    <ul style={{ textAlign: "left", paddingLeft: "1.2em", margin: 0 }}>
      {explanation.map((step, idx) => (
        <li key={idx} style={{ marginBottom: "0.7em" }} dangerouslySetInnerHTML={{ __html: step }} />
      ))}
    </ul>
  ) : (
    explanation
  )}
</div>
      
    </div>
  );
}