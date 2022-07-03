import { Routes, Route } from "react-router-dom";
import HelloWeb3 from "./components/pages/HelloWeb3";
import SignUp from "./components/pages/SignUp";
import SignIn from "./components/pages/SignIn";
import Mypage from "./components/pages/Mypage";
import OptionalAuthProvider from "./components/organisms/OptionalAuthProvider";
import AuthProvider from "./components/organisms/AuthProvider";
import ImageUpload from "./components/pages/ImageUpload";
import Header from "./components/organisms/Header";
import NotFound from "./components/pages/NofFound";
import NewArticlePage from "./components/pages/NewArticlePage";
import EditArticlePage from "./components/pages/EditArticlePage";
import Web3Provider from "./components/organisms/Web3Provider";

const App = () => {
  return (
    <>
      <OptionalAuthProvider>
        <Header />
      </OptionalAuthProvider>
      <hr />
      <Web3Provider>
        <Routes>
          <Route path="/" element={<HelloWeb3 />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/mypage"
            element={<AuthProvider element={<Mypage />} />}
          />
          <Route path="/new" element={<NewArticlePage />} />
          <Route path="/edit/:articleId" element={<EditArticlePage />} />
          <Route
            path="/image-upload"
            element={<AuthProvider element={<ImageUpload />} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Web3Provider>
    </>
  );
};

export default App;
