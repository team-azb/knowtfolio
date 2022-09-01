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
import IndexArticlesPage from "./components/pages/IndexArticlesPage";
import Web3Provider from "~/components/organisms/providers/Web3Provider";

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
          <Route
            path="/articles/new"
            element={
              <AuthProvider>
                <NewArticlePage />
              </AuthProvider>
            }
          />
          <Route
            path="/articles/:articleId/edit"
            element={
              <AuthProvider>
                <EditArticlePage />
              </AuthProvider>
            }
          />
          <Route path="/articles" element={<IndexArticlesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Web3Provider>
    </>
  );
};

export default App;
