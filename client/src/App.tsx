import { Routes, Route } from "react-router-dom";
import TopPage from "~/components/pages/TopPage";
import SignUpPage from "~/components/pages/SignUpPage";
import SignInPage from "~/components/pages/SignInPage";
import AccountPage from "~/components/pages/AccountPage";
import AuthProvider from "~/components/organisms/providers/AuthProvider";
import UploadImagePage from "~/components/pages/UploadImagePage";
import NotFoundPage from "~/components/pages/NofFoundPage";
import NewArticlePage from "~/components/pages/NewArticlePage";
import EditArticlePage from "~/components/pages/EditArticlePage";
import SearchPage from "~/components/pages/SearchPage";
import Web3Provider from "~/components/organisms/providers/Web3Provider";
import RegisterWalletPage from "./components/pages/RegisterWalletPage";
import ArticlePage from "~/components/pages/ArticlePage";
import UpdatePasswordPage from "~/components/pages/UpdatePasswordPage";
import ResetProfilePage from "~/components/pages/ResetProfilePage";
import ResetPasswordPage from "~/components/pages/ResetPasswordPage";
import { ThemeProvider } from "@mui/material";
import { theme } from "~/configs/theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "~/global.css";
import RevalidationCodePage from "./components/pages/RevalidationCodePage";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Web3Provider>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/revalidation-code" element={<RevalidationCodePage />} />
          <Route path="/settings">
            <Route
              path="wallet"
              element={
                <AuthProvider>
                  <RegisterWalletPage />
                </AuthProvider>
              }
            />
            <Route
              path="profile"
              element={
                <AuthProvider>
                  <ResetProfilePage />
                </AuthProvider>
              }
            />
            <Route
              path="password"
              element={
                <AuthProvider>
                  <UpdatePasswordPage />
                </AuthProvider>
              }
            />
          </Route>
          <Route path="/users">
            <Route path=":userId" element={<AccountPage />} />
          </Route>
          <Route
            path="/upload-image"
            element={
              <AuthProvider>
                <UploadImagePage />
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
          <Route path="/articles/:articleId" element={<ArticlePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Web3Provider>
      <ToastContainer style={{ top: 100 }} />
    </ThemeProvider>
  );
};

export default App;
