import React from "react";
import { useNavigate } from "react-router-dom";
import HomeButton from "../HomeButton";
import PrevButton from "../PrevButton";

// Sorted list of student names (match filenames in /public/ids)
const studentNames = [
  "aiden",
  "alice",
  "avery",
  "awen",
  "benam",
  "benjamin",
  "chloe",
  "daniel",
  "ella",
  "emma",
  "ethan",
  "grace",
  "jack",
  "james",
  "leah",
  "lelan",
  "logan",
  "matthew",
  "mia",
  "natalie",
  "noah",
  "owen",
  "samuel",
  "scarlett",
  "sophia",
  "violet",
];

// Helper to pick N unique random names and sort them
function getRandomNames(n) {
  const arr = [...studentNames];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n).sort();
}
function getExplanation({ phase, pivot, ids, targetName, found, low, high }) {
  if (phase === "divide") {
    return (
      <>
        <b>Divide step</b> <br />
        We split the list of student cards into two halves at the <b>pivot</b>.<br />
        The pivot is the middle card in the current search range.<br />
        <span style={{ color: "#6366f1", fontWeight: 500 }}>
          Click <b>Divide</b> to highlight the pivot card.
        </span>
      </>
    );
  }
  if (phase === "conquer" && pivot !== null) {
    const midName = ids[pivot].name;
    if (targetName === midName) {
      return (
        <>
          <b>Found!</b> <br />
          The target name <b>{targetName.toUpperCase()}</b> matches the pivot card.<br />
          <span style={{ color: "#388e3c", fontWeight: 500 }}>
            You have found the student!
          </span>
        </>
      );
    }
    if (targetName < midName) {
      return (
        <>
          <b>Conquer step</b> <br />
          The target name <b>{targetName.toUpperCase()}</b> comes <b>before</b> the pivot card <b>{midName.toUpperCase()}</b>.<br />
          We can ignore all cards <b>after</b> the pivot.<br />
          <span style={{ color: "#6366f1", fontWeight: 500 }}>
            Click <b>Conquer</b> to remove the right half.
          </span>
        </>
      );
    } else {
      return (
        <>
          <b>Conquer step</b> <br />
          The target name <b>{targetName.toUpperCase()}</b> comes <b>after</b> the pivot card <b>{midName.toUpperCase()}</b>.<br />
          We can ignore all cards <b>before</b> the pivot.<br />
          <span style={{ color: "#6366f1", fontWeight: 500 }}>
            Click <b>Conquer</b> to remove the left half.
          </span>
        </>
      );
    }
  }
  if (phase === "done" && found) {
    return (
      <>
        <b>Search complete!</b> <br />
        The student <b>{targetName.toUpperCase()}</b> has been found and is highlighted.<br />
        <span style={{ color: "#6366f1", fontWeight: 500 }}>
          Click <b>Combine</b> to see the original list with the found student highlighted.
        </span>
      </>
    );
  }
  if (phase === "done" && !found) {
    return (
      <>
        <b>Not found</b> <br />
        The student <b>{targetName.toUpperCase()}</b> is not in the list.<br />
        <span style={{ color: "#b91c1c", fontWeight: 500 }}>
          Try again with a different list.
        </span>
      </>
    );
  }
  if (phase === "combined") {
    return (
      <>
        <b>Combine step</b> <br />
        Here is the original list again, with <b>{targetName.toUpperCase()}</b> highlighted at its original position.<br />
        <span style={{ color: "#6366f1", fontWeight: 500 }}>
          Click <b>Reset</b> to try another search.
        </span>
      </>
    );
  }
  return (
    <>
      <b>Ready to search</b> <br />
      Click <b>Divide</b> to start searching for the student.
    </>
  );
}


export default function BinarySearchGrid() {
  const navigate = useNavigate();

  // Helper to initialize a new round of cards and target
  function getInitialState() {
    const chosenNames = getRandomNames(15);
    const idsArr = chosenNames.map((name) => ({ name, status: "active" }));
    const target = chosenNames[Math.floor(Math.random() * chosenNames.length)];
    return {
      chosenNames,
      idsArr,
      target,
    };
  }

  // Only call getInitialState once for all initial states
  const initial = React.useRef(getInitialState()).current;

  const [chosenNames, setChosenNames] = React.useState(initial.chosenNames);
  const [ids, setIds] = React.useState(initial.idsArr);
  const [targetName, setTargetName] = React.useState(initial.target);
  const [discarded, setDiscarded] = React.useState([]); // Store discarded cards
  const [low, setLow] = React.useState(0);
  const [high, setHigh] = React.useState(initial.idsArr.length - 1);
  const [pivot, setPivot] = React.useState(null);
  const [found, setFound] = React.useState(false);
  const [explanation, setExplanation] = React.useState(
    "Click Divide to start searching for the student."
  );
  const [dividing, setDividing] = React.useState(false); // disables divide/conquer during animation
  const [phase, setPhase] = React.useState("divide"); // "divide", "conquer", "done", "combined"

  // Reset everything with new random cards and target
  const handleReset = () => {
    const { chosenNames, idsArr, target } = getInitialState();
    setChosenNames(chosenNames);
    setIds(idsArr);
    setTargetName(target);
    setDiscarded([]);
    setLow(0);
    setHigh(idsArr.length - 1);
    setPivot(null);
    setFound(false);
    setExplanation("Click Divide to start searching for the student.");
    setDividing(false);
    setPhase("divide");
  };

  // Divide: Show pivot and update explanation
  const handleDivide = () => {
    if (found || low > high || dividing || phase !== "divide") return;
    setDividing(true);

    const mid = Math.floor((low + high) / 2);
    setPivot(mid);

    setExplanation(
      `We divide the cards into two groups. The pivot is "${ids[
        mid
      ].name.toUpperCase()}". Click Conquer to decide which half to keep.`
    );

    setTimeout(() => {
      setDividing(false);
      setPhase("conquer");
    }, 500);
  };

  // Conquer: Black out and remove irrelevant side, update explanation
  const handleConquer = () => {
    if (
      found ||
      low > high ||
      dividing ||
      phase !== "conquer" ||
      pivot === null
    )
      return;
    setDividing(true);

    const mid = pivot;
    const midName = ids[mid].name;

    if (midName === targetName) {
      setExplanation(
        `Found ${targetName.toUpperCase()} at position ${mid + 1}!`
      );
      setIds(
        ids.map((id, idx) =>
          idx === mid
            ? { ...id, status: "found" }
            : { ...id, status: id.status }
        )
      );
      setFound(true);
      setDividing(false);
      setPhase("done");
      setPivot(null);
      return;
    }

    let newExplanation = "";
    let toDiscard = [];
    if (targetName < midName) {
      // Black out right side
      toDiscard = ids
        .map((id, idx) =>
          idx > mid && id.status === "active" ? { ...id, idx } : null
        )
        .filter(Boolean);
      newExplanation = `"${targetName.toUpperCase()}" comes before "${midName.toUpperCase()}". We can ignore everyone after the pivot.`;
      setIds((current) =>
        current.map((id, idx) =>
          idx > mid && id.status === "active" ? { ...id, status: "out" } : id
        )
      );
    } else {
      // Black out left side
      toDiscard = ids
        .map((id, idx) =>
          idx < mid && id.status === "active" ? { ...id, idx } : null
        )
        .filter(Boolean);
      newExplanation = `"${targetName.toUpperCase()}" comes after "${midName.toUpperCase()}". We can ignore everyone before the pivot.`;
      setIds((current) =>
        current.map((id, idx) =>
          idx < mid && id.status === "active" ? { ...id, status: "out" } : id
        )
      );
    }
    setExplanation(newExplanation);

    setTimeout(() => {
      // Remove blacked out ids and update low/high, and store discarded
      let newIds;
      let newDiscarded = [...discarded];
      if (targetName < midName) {
        newIds = ids.filter((id, idx) => {
          if (idx > mid && id.status === "active") {
            newDiscarded.push({ ...id, idx });
            return false;
          }
          return true;
        });
      } else {
        newIds = ids.filter((id, idx) => {
          if (idx < mid && id.status === "active") {
            newDiscarded.push({ ...id, idx });
            return false;
          }
          return true;
        });
      }
      setIds(newIds);
      setDiscarded(newDiscarded);
      setLow(0);
      setHigh(newIds.length - 1);
      setPivot(null);

      if (!newIds.some((id) => id.name === targetName)) {
        setExplanation(`"${targetName.toUpperCase()}" is not in the list.`);
        setFound(true);
        setPhase("done");
        setDividing(false);
      } else {
        // Show the explanation and append "Click Divide to continue searching."
        setExplanation(newExplanation + " Click Divide to continue searching.");
        setTimeout(() => {
          setDividing(false);
          setPhase("divide");
        }, 1000); // 1 second
      }
    }, 1000); // 1 second
  };

  // Combine: Add back discarded cards, highlight found
  const handleCombine = () => {
    if (!found || phase === "combined") return;

    // Merge ids and discarded, sort by original index in chosenNames
    const allCards = [
      ...ids.map((id) => ({
        ...id,
        origIdx: chosenNames.findIndex((name) => name === id.name),
      })),
      ...discarded.map((id) => ({
        ...id,
        origIdx: chosenNames.findIndex((name) => name === id.name),
      })),
    ];

    const sorted = allCards
      .sort((a, b) => a.origIdx - b.origIdx)
      .map((id) => ({
        ...id,
        status: id.name === targetName ? "found" : "active",
      }));

    // Find the position of the found name in the original list (1-based)
    const originalPos = chosenNames.findIndex((name) => name === targetName) + 1;

    setIds(sorted);
    setExplanation(
      `Here is the original list again. "${targetName.toUpperCase()}" is highlighted at its original position (position ${originalPos}).`
    );
    setPhase("combined");
  };

  return (
  <div style={{ padding: "2rem", textAlign: "center", background: "#F9F6F2", minHeight: "100vh" }}>
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
          Finding a Name (Binary Search)
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
            <b>Divide</b> – split the list into two halves at the pivot
          </div>
          <div>
            <b>Conquer</b> – decide which half to keep based on the target
          </div>
          <div>
            <b>Combine</b> – combine the discarded cards to show the relative positions
          </div>
        </div>
      </div>
    </div>
    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
      Looking for:{" "}
      <span style={{ color: "#0077cc" }}>{targetName.toUpperCase()}</span>
    </h2>

    <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    maxWidth: "calc(8 * 120px + 7 * 1.5rem)",
    gap: "1.5rem",
    justifyItems: "center",
    marginBottom: "2rem",
    position: "relative",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
    minHeight: "180px",
  }}
>
      {ids.map((id, idx) => (
        <div
          key={id.name}
          style={{
            border:
              id.status === "found"
                ? "3px solid gold"
                : id.status === "out"
                ? "2px solid #2A2925"
                : "2px solid #2A2925",
            borderRadius: "8px",
            padding: "0.5rem",
            background: id.status === "out" ? "#222" : "#fafafa",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "120px",
            opacity: id.status === "out" ? 0.4 : 1,
            position: "relative",
            transition: "all 0.3s",
          }}
        >
          {/* Downward arrow for pivot */}
          {pivot === idx && !found && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: "-2.2rem",
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#f59e42",
                lineHeight: "1",
                pointerEvents: "none",
                textShadow: "0 2px 4px #fff",
              }}
            >
              ▼
            </div>
          )}
          <img
            src={`/ids/${id.name}.png`}
            alt={id.name}
            style={{
              width: "100%",
              borderRadius: "4px",
              filter:
                id.status === "out" ? "grayscale(1) brightness(0.5)" : "none",
              border: id.status === "found" ? "2px solid gold" : "none",
            }}
          />
          <p
            style={{
              marginTop: "0.5rem",
              fontWeight: "bold",
              color: id.status === "out" ? "#bbb" : "#222",
            }}
          >
            {id.name.charAt(0).toUpperCase() + id.name.slice(1)}
          </p>
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
      cursor: phase !== "conquer" || dividing || found ? "not-allowed" : "pointer",
      fontWeight: "bold",
      transition: "background 0.2s",
      minWidth: "105px",
      opacity: phase !== "conquer" || dividing || found ? 0.5 : 1,
    }}
    disabled={phase !== "conquer" || dividing || found}
  >
    Conquer
  </button>
 <button
  onClick={handleCombine}
  disabled={!found || phase === "combined"}
  style={{
    padding: "0.7rem 1.75rem",
    fontSize: "1rem",
    borderRadius: "1rem",
    border: "1px solid #2A2925",
    background: "#ede9fe",
    color: "#7c3aed",
    cursor: !found || phase === "combined" ? "not-allowed" : "pointer",
    fontWeight: "bold",
    opacity: !found || phase === "combined" ? 0.5 : 1,
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


    <div
      style={{
        margin: "2rem auto 0 auto",
        maxWidth: "600px",
        border: "2px solid #B0ADA8",
        borderRadius: "1rem",
        padding: "1.5rem",
        color: "#1e293b",
        fontSize: "1.1rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {getExplanation({ phase, pivot, ids, targetName, found, low, high })}
</div>

    <div style={{ position: "absolute", top: "1.5rem", right: "2rem", zIndex: 20, display: "flex", gap: "1rem" }}>
      <PrevButton onClick={() => navigate(-1)} />
      <HomeButton onClick={() => navigate("/")} />
    </div>
  </div>
);
}