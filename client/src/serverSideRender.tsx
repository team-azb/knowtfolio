import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const container = document.getElementById("app") as HTMLElement;
hydrateRoot(
  container,
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
