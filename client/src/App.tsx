import { Routes, Route } from "react-router-dom";
import HelloWeb3 from "./components/pages/HelloWeb3";
import SignUp from "./components/pages/SignUp";
import SignIn from "./components/pages/SignIn";
import Mypage from "./components/pages/Mypage";
import AuthProvider from "./components/contexts/AuthContext";
import AuthRequired from "./components/organisms/AuthRequired";
import ImageUpload from "./components/pages/ImageUpload";
import Header from "./components/organisms/Header";
import NotFound from "./components/pages/NofFound";

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
        <Route path="/mypage" element={<AuthRequired element={<Mypage />} />} />
        <Route
          path="/image-upload"
          element={<AuthRequired element={<ImageUpload />} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
