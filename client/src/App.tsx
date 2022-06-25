import { Routes, Route } from "react-router-dom";
import HelloWeb3 from "./components/pages/HelloWeb3";
import SignUp from "./components/pages/SignUp";
import SignIn from "./components/pages/SignIn";
import Mypage from "./components/pages/Mypage";
import AuthProvider from "./components/contexts/AuthContext";
import AuthRequired from "./components/organisms/AuthRequired";
import Header from "./components/organisms/Header";

const App = () => {
  return (
    <>
      <AuthProvider>
        <Header />
      </AuthProvider>
      <hr />
      <Routes>
        <Route path="/" element={<HelloWeb3 />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route
          path="/mypage"
          element={
            <AuthRequired>
              <Mypage />
            </AuthRequired>
          }
        />
      </Routes>
    </>
  );
};

export default App;
