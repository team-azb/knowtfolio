import { Button, ButtonProps } from "@mui/material";
import metamaskSvg from "~/assets/metamask.svg";

/**
 * Metamaskのキツネのアイコンがくっついたボタン
 * @param props ButtonPropsと同一
 */
const MetamaskButton = (props: ButtonProps) => {
  return (
    <Button variant="outlined" style={{ fontSize: "1.4rem" }} {...props}>
      <img
        src={metamaskSvg}
        alt="metamask_icon"
        style={{ height: 40, marginRight: 10 }}
      />
      {props.children}
    </Button>
  );
};

export default MetamaskButton;
