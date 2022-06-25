import { Routes, Route } from "react-router-dom";
import HelloWeb3 from "./components/pages/HelloWeb3";
import SignUp from "./components/pages/SignUp";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HelloWeb3 />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
};

export default App;
