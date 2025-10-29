import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MergeSortViz from './pages/MergeSortViz';
import BinarySearchViz from './pages/BinarySearchViz';
import TestingViz from './pages/testing';
import StrassenMatrixViz from './pages/StrassenMatrixViz';
import Overview from './pages/Overview';
import MergeExample from './pages/MergeExample';
import BinarySearchExample from './pages/BinarySearchExample';
import MatrixExample from './pages/MatrixExample';
import Sandbox from './pages/sandbox';
import Sandbox2 from './pages/sandbox2';
import Quicksort from './pages/quicksortviz';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merge-sort"   element={<MergeSortViz />} />
        <Route path="/binary-search" element={<BinarySearchViz />} />
        <Route path="/testing"     element={<TestingViz />} /> 
        <Route path="/matrix"     element={<StrassenMatrixViz />} />
        <Route path="/overview"     element={<Overview />} />
        <Route path="/mergeExample"     element={<MergeExample />} /> 
        <Route path="/binarysearchExample"     element={<BinarySearchExample />} /> 
        <Route path="/matrixExample"     element={<MatrixExample/>} /> 
        <Route path="/sandbox"     element={<Sandbox/>} /> 
        <Route path="/sandbox2"     element={<Sandbox2/>} /> 
        <Route path="/quicksort"     element={<Quicksort/>} /> 
      </Routes>
    </BrowserRouter>
  );
}