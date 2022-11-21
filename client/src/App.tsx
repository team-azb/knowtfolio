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
import ResetWalletPage from "./components/pages/ResetWalletPage";
import { ThemeProvider } from "@mui/material";
import { theme } from "~/configs/theme";
import "~/global.css";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
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
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Web3Provider>
    </ThemeProvider>
  );
};

export default App;
