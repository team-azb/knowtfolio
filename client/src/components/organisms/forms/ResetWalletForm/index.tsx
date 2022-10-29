import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { useCallback, useMemo, useState } from "react";
import { RadioGroup, Radio, FormControlLabel } from "@mui/material";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import Form from "~/components/atoms/authForm/Form";
import WalletAddressDisplay from "~/components/organisms/WalletAddressDisplay";
import { Button, Grid } from "@mui/material";
import Spacer from "~/components/atoms/Spacer";
import { useNavigate } from "react-router-dom";

const ResetWalletForm = () => {
  const [walletAddressInput, setWalletAddressInput] = useState<string>("");
  const { user, attributes } = useAuthContext();
  const walletAddress = useMemo(() => {
    const walletAddress = attributes.find(
      (atr) => atr.Name === "custom:wallet_address"
    )?.Value;
    return walletAddress;
  }, [attributes]);
  const { account } = useWeb3Context();

  const resetWalletAddress = useCallback(() => {
    user.updateAttributes(
      [
        new CognitoUserAttribute({
          Name: "custom:wallet_address",
          Value: walletAddressInput,
        }),
      ],
      (err) => {
        if (err) {
          alert(err.message || JSON.stringify(err));
          return;
        }
        alert("wallet addressの更新に成功しました");
        window.location.reload();
      }
    );
  }, [user, walletAddressInput]);

  const onChangeWalletAddressInput = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setWalletAddressInput(event.target.value);
  }, []);

  const navigate = useNavigate();

  return (
    <Form>
      <h2>Wallet addressを再設定する</h2>
      <hr />
      <Spacer height="3rem" />
      <Grid container direction="column" spacing={3}>
        <Grid item container alignItems="center">
          <Grid item xs={2.5}>
            <p>現在のwallet address</p>
          </Grid>
          <Grid item xs={9.5}>
            <WalletAddressDisplay
              style={{ display: "inline" }}
              address={walletAddress || "未登録"}
              shouldTruncate={false}
            />
          </Grid>
        </Grid>
        <Grid item container alignItems="flex-start">
          <Grid item xs={2.5}>
            <p>新しいwallet address</p>
          </Grid>
          <Grid item container direction="column" xs={9.5} spacing={1}>
            <RadioGroup
              value={walletAddressInput}
              onChange={onChangeWalletAddressInput}
            >
              <FormControlLabel
                value={account}
                control={<Radio />}
                label={
                  <p>
                    <WalletAddressDisplay
                      address={account}
                      shouldTruncate={false}
                      style={{ display: "inline" }}
                    />
                    を登録する
                  </p>
                }
              />
              <FormControlLabel
                value={""}
                control={<Radio />}
                label={<p>Wallet addressを登録解除する</p>}
              />
            </RadioGroup>
          </Grid>
        </Grid>
        <Grid item container justifyContent="center">
          <Grid item xs={2.5}></Grid>
          <Grid item xs={7.5}>
            <Button
              variant="outlined"
              onClick={resetWalletAddress}
              style={{ fontSize: "1.4rem" }}
            >
              update wallet address
            </Button>
          </Grid>
          <Grid item container xs={2} direction="row-reverse">
            <Button
              onClick={() => {
                navigate(-1);
              }}
              variant="contained"
              style={{ fontSize: "1.4rem" }}
            >
              cancel
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Form>
  );
};

export default ResetWalletForm;
