# Educational Tool for Divide-and-Conquer Algorithms

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://shiny-cuchufli-7ce4c3.netlify.app/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)

An interactive web-based visualisation tool designed to help students understand divide-and-conquer (D&C) algorithms through phase-explicit visualisations, real-world analogies, and hands-on exploration.

## Overview

This tool addresses a fundamental challenge in computer science education: helping students grasp the recursive structure and multi-phase logic of divide-and-conquer algorithms. Unlike existing tools that focus on line-by-line code execution, this visualiser explicitly separates and highlights the **divide**, **conquer**, and **combine** phases, making the algorithmic strategy clear and accessible.

### Key Features

- **Phase-Explicit Visualisation**: Clear visual separation of divide, conquer, and combine phases
- **Multiple Learning Modes**:
  - **Analogical Views**: Real-world scenarios that ground abstract concepts
  - **Standard Views**: Guided algorithmic exploration with contextual explanations
  - **Explorative Views**: Hands-on manipulation for hypothesis testing
- **Interactive Navigation**: Forward/backward stepping with full state preservation
- **Three Core Algorithms**:
  - Binary Search
  - Merge Sort
  - Strassen's Matrix Multiplication
- **Educational Scaffolding**: Contextual information panels, onboarding tutorials, and progressive disclosure

## Live Demo

Try the tool: [https://shiny-cuchufli-7ce4c3.netlify.app/](https://shiny-cuchufli-7ce4c3.netlify.app/)

## Research Background

This tool was developed as part of a Master's dissertation at the University of Edinburgh (2025). The research demonstrates that phase-explicit visualisation can significantly improve student understanding of D&C algorithms:

- **100% improvement** in merge sort recursion comprehension
- **133% improvement** in base case recognition
- **System Usability Scale score of 85.0** (vs. industry benchmark of 68)

The full dissertation is available in this repository: `Visualizing_Divide_and_Conquer_Algorithms.pdf`

## Technical Architecture

### Built With

- **React 18+** - Component-based UI architecture
- **Framer Motion** - Smooth animations and transitions
- **JavaScript (ES6+)** - Algorithm logic and state management
- **CSS3** - Responsive styling

### Key Design Decisions

1. **Current Stage Approach**: Shows all subproblems at each recursive level simultaneously, rather than using tree diagrams, to reduce cognitive load
2. **Reversible State Machine**: Pre-computes all algorithm states for seamless bidirectional navigation
3. **Metadata Tracking**: Records formation history of every operation to enable dynamic explanation reconstruction
4. **Component-Based Architecture**: Modular, reusable components for maintainability and extensibility

## Installation & Setup

### Prerequisites

- Node.js 16+ and npm/yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Local Development
```bash
# Clone the repository
git clone https://github.com/pradneshsanderan/Educational-Tool-for-Divide-and-Conquer-Algorithms.git

# Navigate to project directory
cd Educational-Tool-for-Divide-and-Conquer-Algorithms

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The application will open at `http://localhost:3000`

##  Using the Tool

### For Students

1. **Start with Analogical Views**: Begin with real-world examples (e.g., sorting exam papers for merge sort) to build intuition
2. **Progress to Standard Views**: Explore the full algorithm with guided phase-by-phase execution
3. **Experiment in Explorative Mode**: Manipulate subproblems directly to test your understanding

### For Educators

- Use **Standard Views** for classroom demonstrations with step-by-step control
- Assign **Explorative Mode** for homework to encourage active learning
- Leverage the **contextual information panels** to explain algorithmic concepts in real-time

##  Algorithm Implementations

### Binary Search
- **Divide**: Select pivot and split array in half
- **Conquer**: Compare pivot with target and discard one half
- **Combine**: Recombine discarded elements to show target position

### Merge Sort
- **Divide**: Recursively split arrays until single elements
- **Conquer**: Elements in individual subarrays are inherently sorted
- **Combine**: Merge sorted subarrays while maintaining order

### Strassen's Matrix Multiplication
- **Divide**: Split matrices into quadrants and apply Strassen's operand formulas
- **Conquer**: Compute M1-M7 intermediate matrices
- **Combine**: Reconstruct result using Strassen's combination formulas

##  Evaluation & Research

The tool was evaluated through:
- **Pre-post knowledge assessments** (n=9) showing measurable learning gains
- **Think-aloud sessions** informing iterative design improvements
- **System Usability Scale** validation (85.0/100 - "Excellent")

Key findings indicate that phase-explicit visualisation significantly improves conceptual understanding without compromising usability.

##  Contributing

Contributions are welcome! This project would benefit from:

- Additional D&C algorithms (QuickSort, Closest Pair, Karatsuba Multiplication)
- Mobile responsiveness improvements
- Accessibility enhancements (WCAG 2.1 compliance)
- Internationalization support
- Performance optimizations for larger inputs

Please open an issue to discuss proposed changes before submitting pull requests.

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Author

**Pradnesh Sanderan**
- MSc Computer Science, University of Edinburgh (2025)
- Supervised by: Dr. Murray Cole

##  Acknowledgements

- Dr. Murray Cole for continuous guidance and support
- Think-aloud session participants for invaluable feedback
- The School of Informatics, University of Edinburgh

##  Citation

If you use this tool in your research or teaching, please cite:
```bibtex
@mastersthesis{sanderan2025visualising,
  title={Visualising Divide-and-Conquer Algorithms},
  author={Sanderan, Pradnesh},
  year={2025},
  school={University of Edinburgh},
  type={MSc Dissertation}
}
```

##  Related Resources

- [Dissertation PDF](Visualizing_Divide_and_Conquer_Algorithms.pdf)
- Ethics Approval (Appendices B & C in dissertation)
- Participant Study Materials (Appendix A in dissertation)

##  Contact

For questions or feedback, please open an issue on GitHub or contact the project maintainer through the repository.

---

**Research Ethics Approval**: Informatics Research Ethics Committee #778012 (2022-10-24)
