import { useNavigate } from "react-router-dom";
import Cards from "../Cards"; // Import your new Cards component

export default function Home() {
  const navigate = useNavigate();

  const cards = [
    { title: "Introduction", path: "/overview", img: "/home/intro.png" },
    { title: "Merge Sort", path: "/merge-sort", img: "/home/mergesort.png" },
    { title: "Binary Search", path: "/binary-search", img: "/home/binarysearch.png"},
    { title: "Matrix Multiplication", path: "/testing", img: "/home/matrix.png"},
    
    // { title: "Matrix Mult", path: "/matrix", img: "https://heroui.com/images/hero-card-complete.jpeg", tags: ["• Matrix", "• Math"] },
    // { title: "Quicksort", path: "/quicksort", img: "https://heroui.com/images/hero-card-complete.jpeg", tags: ["• Sorting"] },
  ];

  // Card size + padding/gap
  const cardWidth = 250; // Match your Cards.jsx width
  const cardGap = 32; // 2rem
  const numCards = cards.length;
  // For 4 cards per row, adjust as needed
  const cardsPerRow = Math.min(4, numCards);
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
      }}
    >
      {/* Info Box */}
      <div
        style={{
    width: boxWidth,
    minHeight: 200,
    marginTop: "2rem",
    marginBottom: "2.5rem",
    borderRadius: "24px",
    background: "#88c0d0",
    display: "flex",
    flexDirection: "column",         // add this
    alignItems: "center",            // add this
    justifyContent: "flex-start",    // add this
    boxShadow: "0 2px 16px 0 rgba(33,150,243,0.08)",
    border: "3px solid #1B1A17",
  }}
      >
        <div style={{ width: "100%", textAlign: "center" }}>
          <h2
            style={{
              color: "#2e3440",
              fontWeight: 700,
              
              fontSize: "2.5rem",
              letterSpacing: "0.02em",
              textAlign: "center",
              width: "100%",
              marginBottom: "1rem",
            }}
          >
            Divide and Conquer Algorithm Visualizer
          </h2>
          <div
            style={{
              color: "#1B1A17",
              fontSize: "1.08rem",
              fontFamily: "'Fira Mono', monospace",
              fontWeight: 400,
              maxWidth: 840,
              margin: "0 auto",
              opacity: 0.92,
            }}
          >
            An interactive tool to explore and understand divide and conquer algorithms. Click on the Introduction section to get started,
            then choose one of the algorithms to see how it works step by step.
          </div>
        </div>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "nowrap",
          justifyContent: "center",
          width: boxWidth,
        }}
      >
        {cards.map((c) => (
          <Cards
            key={c.path}
            title={c.title}
            img={c.img}
            tags={c.tags}
            onClick={() => navigate(c.path)}
          />
        ))}
      </div>
    </div>
  );
}



// https://uiverse.io/Voxybuns/lucky-fireant-71
// https://uiverse.io/cssbuttons-io/stale-rattlesnake-87