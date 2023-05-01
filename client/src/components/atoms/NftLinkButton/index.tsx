import { Button, ButtonProps } from "@mui/material";
import { useMemo } from "react";
import { CONTRACT_ADDRESS } from "~/configs/blockchain";

type props = ButtonProps & {
  tokenId: number;
  isExternal?: boolean;
};

/**
 * tokenIdからBlockchainExplorerへのリンクを生成する
 * @param tokenId NFTのtokenId
 * @returns リンク
 */
export const generateLink = (tokenId: number) => {
  // TODO: 本番環境を実装した場合に、ドメインなどのURIを環境変数にする必要あり
  return `https://mumbai.polygonscan.com/token/${CONTRACT_ADDRESS}?a=${tokenId}`;
};

/**
 * NFTの情報を表示するBlockchainExplorerへの遷移ボタン
 * @tokenId linkを作成するNFTのtokenId
 * @isExternal 外部リンクとして表示するか
 */
const NftLinkButton = ({ tokenId, ...buttonProps }: props) => {
  const nftLink = useMemo(() => {
    return generateLink(tokenId);
  }, [tokenId]);
  return (
    <Button
      onClick={() => {
        window.open(nftLink);
      }}
      {...buttonProps}
    >
      {buttonProps.children}
    </Button>
  );
};

export default NftLinkButton;
