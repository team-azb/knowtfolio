import { useCallback } from "react";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import Form from "~/components/atoms/authForm/Form";
import WalletAddressDisplay from "~/components/organisms/WalletAddressDisplay";
import { Button, Grid } from "@mui/material";
import Spacer from "~/components/atoms/Spacer";
import { useNavigate } from "react-router-dom";
import { postWalletAddress } from "~/apis/lambda";
import { noteOnWalletAddress } from "~/components/organisms/forms/SignUpForm";

/**
 * wallet addressがすでに登録されていた場合に表示するメッセージ
 */
const MessageToRejectRegistration = () => {
  const { user, userWalletAddress } = useAuthContext();
  const navigate = useNavigate();

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item>
        {
          "すでに下記のwallet addressが登録されています。登録したwallet addressを後から変更することはできません。"
        }
      </Grid>
      <Grid item container alignItems="center">
        <Grid item xs={2.5}>
          <p>ユーザーid</p>
        </Grid>
        <Grid item xs={9.5}>
          {user.getUsername()}
        </Grid>
      </Grid>
      <Grid item container alignItems="flex-start">
        <Grid item xs={2.5}>
          wallet address
        </Grid>
        <Grid item xs={9.5}>
          <WalletAddressDisplay
            address={userWalletAddress}
            shouldTruncate={false}
          />
        </Grid>
      </Grid>
      <Grid item container xs={2} direction="row-reverse">
        <Button
          onClick={() => {
            navigate("/mypage");
          }}
          variant="contained"
          style={{ fontSize: "1.4rem" }}
        >
          cancel
        </Button>
      </Grid>
    </Grid>
  );
};

/**
 * walletを再設定するためのフォーム
 */
const ResetWalletForm = () => {
  const { user, userWalletAddress } = useAuthContext();
  const { account, web3 } = useWeb3Context();

  const resetWalletAddress = useCallback(async () => {
    const signature = await web3.eth.personal.sign(
      "Register wallet address",
      account,
      ""
    );
    try {
      await postWalletAddress({
        userId: user.getUsername(),
        walletAddress: account,
        signature: signature,
      });
      // TODO: toastで実装する
      alert("Walletの登録が完了しました。");
      window.location.reload();
    } catch (error) {
      // TODO: toastで実装する
      alert("Walletの登録に失敗しました。");
    }
  }, [account, user, web3.eth.personal]);

  const navigate = useNavigate();

  return (
    <Form>
      <h2>Wallet addressを登録する</h2>
      <hr />
      <Spacer height="3rem" />
      {userWalletAddress ? (
        <MessageToRejectRegistration />
      ) : (
        <Grid container direction="column" spacing={3}>
          <Grid item>
            表示されているwallet addressとユーザーidを連携します。
            <br />
            <b>{noteOnWalletAddress}</b>
          </Grid>
          <Grid item container alignItems="center">
            <Grid item xs={2.5}>
              <p>ユーザーid</p>
            </Grid>
            <Grid item xs={9.5}>
              {user.getUsername()}
            </Grid>
          </Grid>
          <Grid item container alignItems="flex-start">
            <Grid item xs={2.5}>
              wallet address
            </Grid>
            <Grid item xs={9.5}>
              <WalletAddressDisplay address={account} shouldTruncate={false} />
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
                  navigate("/mypage");
                }}
                variant="contained"
                style={{ fontSize: "1.4rem" }}
              >
                cancel
              </Button>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Form>
  );
};

export default ResetWalletForm;
