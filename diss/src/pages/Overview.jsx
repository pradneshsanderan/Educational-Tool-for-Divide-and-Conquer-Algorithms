import React from "react";
import { useNavigate } from "react-router-dom";
import Cards from "../Cards"; // Adjust path if needed
import HomeButton from "../HomeButton"; // Import the styled HomeButton

export default function Overview() {
  const navigate = useNavigate();

  // Example card data for the three real-life examples
  const exampleCards = [
    {
      title: "Sorting Exam Papers",
      img: "/home/sortingpaper.png",
      onClick: () => navigate("/mergeExample"),
    },
    {
      title: "Finding a Name",
      img: "/home/studentid.png",
      onClick: () => navigate("/binarysearchExample"),
    },
    {
      title: "Dividing a Canvas",
      img: "/home/canvas.png",
      onClick: () => navigate("/matrixExample"),
    },
  ];

  const cardWidth = 250;
  const cardGap = 32;
  const numCards = exampleCards.length;
  const cardsPerRow = Math.min(3, numCards);
  const boxWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * cardGap;


  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#F9F6F2",
        fontFamily: "sans-serif",
      }}
    >
      {/* Home button in top right */}
      <div style={{ position: "absolute", top: "2rem", right: "2rem", zIndex: 200 }}>
        <HomeButton onClick={() => navigate("/")} />
      </div>

      {/* Info Box */}
      <div
        style={{
          width: boxWidth,
          minHeight: 260,
          marginTop: "2.5rem",
          marginBottom: "2.5rem",
          borderRadius: "24px",
          background: "#88c0d0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 16px 0 rgba(33,150,243,0.08)",
          border: "3px solid #1B1A17",
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
            What is Divide and Conquer?
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
              <b>Divide</b> – break the big problem into smaller subproblems
            </div>
            <div>
              <b>Conquer</b> – solve each subproblem independently (often recursively)
            </div>
            <div>
              <b>Combine</b> – combine the results of the subproblems to solve the original problem
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          fontWeight: 600,
          fontSize: "1.6rem",
          marginBottom: "1.2rem",
          color: "#222",
          letterSpacing: "0.01em",
        }}
      >
        What does this look like in real life? Choose an example to explore:
      </div>
      <div
        style={{
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
          flexWrap: "nowrap",
          width: boxWidth,
        }}
      >
        {exampleCards.map((card) => (
          <Cards
            key={card.title}
            title={card.title}
            img={card.img}
            tags={card.tags}
            onClick={card.onClick}
            fontSize="0.9em"
          />
        ))}
      </div>
    </div>
  );
}