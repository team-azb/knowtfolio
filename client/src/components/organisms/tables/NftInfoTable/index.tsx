import { Grid } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import NftLinkButton from "~/components/atoms/NftLinkButton";
import { useWeb3Context } from "../../providers/Web3Provider";

type nftInfoTableProps = {
  articleId: string;
};

/**
 * 記事のNFT情報を表示するための表
 * @articleId 表示する表の記事のID
 */
const NftInfoTable = ({ articleId }: nftInfoTableProps) => {
  const [tokenId, setTokenId] = useState<number>();
  const { contract, isConnectedToMetamask } = useWeb3Context();

  useEffect(() => {
    (async () => {
      if (isConnectedToMetamask) {
        const id = await contract.methods.getTokenId(articleId).call();
        setTokenId(Number(id));
      }
    })();
  }, [articleId, contract?.methods, isConnectedToMetamask]);

  const tableContent = useMemo(() => {
    if (tokenId) {
      return (
        <>
          <Grid item>Token id: {tokenId}</Grid>
          <Grid item>
            <NftLinkButton tokenId={tokenId}>
              View Token on Mumbai Scan
            </NftLinkButton>
          </Grid>
        </>
      );
    } else if (tokenId === 0) {
      return <Grid item>NFTがまだ作成されていません</Grid>;
    } else {
      return (
        <Grid item>MetamaskでMumbaiに接続するとNFT情報を確認できます</Grid>
      );
    }
  }, [tokenId]);

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      {tableContent}
    </Grid>
  );
};

export default NftInfoTable;
