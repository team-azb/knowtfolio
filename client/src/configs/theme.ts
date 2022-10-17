import { createTheme } from "@mui/material";
import { grey } from "@mui/material/colors";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#000",
      dark: "#001",
      light: grey[200],
      contrastText: "#fff",
    },
  },
});
