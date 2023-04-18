import { useCallback } from "react";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import {
  assertMetamask,
  useWeb3Context,
} from "~/components/organisms/providers/Web3Provider";
import Form from "~/components/atoms/authForm/Form";
import WalletAddressDisplay from "~/components/organisms/WalletAddressDisplay";
import { Button, Grid } from "@mui/material";
import Spacer from "~/components/atoms/Spacer";
import { useNavigate } from "react-router-dom";
import { postWalletAddress } from "~/apis/lambda";
import { noteOnWalletAddress } from "~/components/organisms/forms/SignUpForm";
import RequireWeb3Wrapper from "~/components/organisms/RequireWeb3Wrapper";
import { toast } from "react-toastify";

/**
 * wallet addressがすでに登録されていた場合に表示するメッセージ
 */
const RegisteredWalletAddressMessage = () => {
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
            navigate(`/users/${user.getUsername()}`);
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
 * walletを登録するフォームの本体
 */
const RegisterWalletFormContent = () => {
  const { user, session } = useAuthContext();
  const { isConnectedToMetamask, account, web3 } = useWeb3Context();
  const navigate = useNavigate();

  const registerWalletAddress = useCallback(async () => {
    assertMetamask(isConnectedToMetamask);
    const signature = await web3.eth.personal.sign(
      "Register wallet address",
      account,
      ""
    );
    try {
      await postWalletAddress(
        {
          userId: user.getUsername(),
          walletAddress: account,
          signature: signature,
        },
        session
      );
      toast.success("Wallet addressの登録に成功しました。");
      navigate("/settings/wallet", {
        state: {
          shouldLoadCurrentUser: true,
        },
      });
    } catch (error) {
      toast.error("Wallet addressの登録に失敗しました。");
    }
  }, [account, isConnectedToMetamask, navigate, user, web3, session]);

  return (
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
          <RequireWeb3Wrapper isConnectedToMetamask={isConnectedToMetamask}>
            <Button
              variant="outlined"
              onClick={registerWalletAddress}
              style={{ fontSize: "1.4rem" }}
            >
              register wallet address
            </Button>
          </RequireWeb3Wrapper>
        </Grid>
        <Grid item container xs={2} direction="row-reverse">
          <Button
            onClick={() => {
              navigate(`/users/${user.getUsername()}`);
            }}
            variant="contained"
            style={{ fontSize: "1.4rem" }}
          >
            cancel
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

/**
 * walletを登録するためのフォーム。
 * ※既にwalletが登録されている場合は登録ができない仕様
 */
const RegisterWalletForm = () => {
  const { userWalletAddress } = useAuthContext();
  return (
    <Form>
      <h2>Wallet addressを登録する</h2>
      <hr />
      <Spacer height="3rem" />
      {userWalletAddress ? (
        <RegisteredWalletAddressMessage />
      ) : (
        <RegisterWalletFormContent />
      )}
    </Form>
  );
};

export default RegisterWalletForm;
