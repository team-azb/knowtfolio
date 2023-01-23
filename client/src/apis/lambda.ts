import axios from "axios";

type postWalletForm = {
  userId: string;
  walletAddress: string;
  signature: string;
};
export const postWalletAddress = async (form: postWalletForm) => {
  await axios.post("/api/wallet_address", {
    user_id: form.userId,
    wallet_address: form.walletAddress,
    signature: form.signature,
  });
};
