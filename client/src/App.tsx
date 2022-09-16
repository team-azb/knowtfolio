import { Routes, Route } from "react-router-dom";
import TopPage from "~/components/pages/TopPage";
import SignUpPage from "~/components/pages/SignUpPage";
import SignInPage from "~/components/pages/SignInPage";
import AccountPage from "~/components/pages/AccountPage";
import AuthProvider from "~/components/organisms/providers/AuthProvider";
import ImageUploadPage from "~/components/pages/ImageUploadPage";
import Header from "~/components/organisms/Header";
import NotFoundPage from "~/components/pages/NofFoundPage";
import NewArticlePage from "~/components/pages/NewArticlePage";
import EditArticlePage from "~/components/pages/EditArticlePage";
import Web3Provider from "~/components/organisms/providers/Web3Provider";
import ResetWalletPage from "./components/pages/ResetWalletPage";

const App = () => {
  return (
    <>
      <Header />
      <hr />
      <Web3Provider>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route
            path="/reset-wallet"
            element={
              <AuthProvider>
                <ResetWalletPage />
              </AuthProvider>
            }
          />
          <Route
            path="/mypage"
            element={
              <AuthProvider>
                <AccountPage />
              </AuthProvider>
            }
          />
          <Route
            path="/image-upload"
            element={
              <AuthProvider>
                <ImageUploadPage />
              </AuthProvider>
            }
          />
          <Route path="/articles/new" element={<NewArticlePage />} />
          <Route
            path="/articles/:articleId/edit"
            element={<EditArticlePage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Web3Provider>
    </>
  );
};

export default App;
