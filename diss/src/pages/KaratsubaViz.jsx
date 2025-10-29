// pages/ExponentiationViz.jsx
import React, { useState } from "react";

export default function ExponentiationViz() {
  const [base, setBase] = useState(2);
  const [exponent, setExponent] = useState(10);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState(null);

  // Recursive exponentiation by squaring with step recording
  function expBySquaring(b, e, depth = 0) {
    if (e === 0) {
      return {
        value: 1,
        explanation: `Base case: exponent = 0, return 1`,
        depth,
        left: null,
        right: null,
      };
    }
    if (e === 1) {
      return {
        value: b,
        explanation: `Base case: exponent = 1, return base (${b})`,
        depth,
        left: null,
        right: null,
      };
    }

    const half = Math.floor(e / 2);
    const left = expBySquaring(b, half, depth + 1);

    let right = null;
    if (e % 2 === 1) {
      right = {
        value: b,
        explanation: `Exponent is odd, multiply by base (${b}) one extra time`,
        depth: depth + 1,
        left: null,
        right: null,
      };
    }

    let combinedValue = left.value * left.value;
    let explanation = `Square result of b^${half} (${left.value}² = ${combinedValue})`;
    if (right) {
      combinedValue *= right.value;
      explanation += `, then multiply by base (${right.value}) because exponent is odd`;
    }

    return {
      value: combinedValue,
      explanation,
      depth,
      left,
      right,
    };
  }

  // Flatten the recursive tree into a steps array for manual stepping
  function flattenSteps(node, arr = []) {
    if (!node) return arr;
    arr.push(node);
    flattenSteps(node.left, arr);
    flattenSteps(node.right, arr);
    return arr;
  }

  // Prepare steps and reset current step
  function startAnimation() {
    setResult(null);
    const tree = expBySquaring(base, exponent);
    const flatSteps = flattenSteps(tree);
    setSteps(flatSteps);
    setCurrentStep(0);
  }

  // Handle next step click
  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (currentStep + 1 === 0) setResult(null); // Clear result when starting
      if (currentStep + 1 === steps.length - 1) {
        setResult(steps[0].value); // At last step, set final result
      }
    }
  }

  // Handle previous step click
  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setResult(null); // Clear final result if going back
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Exponentiation by Squaring Visualizer</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Base:{" "}
          <input
            type="number"
            value={base}
            onChange={(e) => setBase(parseInt(e.target.value, 10) || 0)}
          />
        </label>
        <label style={{ marginLeft: "1rem" }}>
          Exponent:{" "}
          <input
            type="number"
            min="0"
            value={exponent}
            onChange={(e) => setExponent(parseInt(e.target.value, 10) || 0)}
          />
        </label>
        <button onClick={startAnimation} style={{ marginLeft: "1rem" }}>
          Start
        </button>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          minHeight: "6rem",
          marginBottom: "1rem",
        }}
      >
        {currentStep === -1 ? (
          <p>Click Start to see the steps of exponentiation by squaring.</p>
        ) : currentStep < steps.length ? (
          <>
            <p>
              <b>Step {currentStep + 1} of {steps.length}:</b>
            </p>
            <p style={{ marginLeft: `${steps[currentStep]?.depth * 20}px` }}>
              {steps[currentStep]?.explanation}
            </p>
            <p
              style={{
                marginLeft: `${steps[currentStep]?.depth * 20}px`,
                color: "blue",
                fontWeight: "bold",
              }}
            >
              Value: {steps[currentStep]?.value}
            </p>
          </>
        ) : (
          <p>
            <b>Final result:</b> {result}
          </p>
        )}
      </div>

      <div>
        <button onClick={handlePrev} disabled={currentStep <= 0}>
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === -1 || currentStep >= steps.length - 1}
          style={{ marginLeft: "1rem" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
