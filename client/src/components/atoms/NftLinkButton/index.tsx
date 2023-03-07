import { Button, ButtonProps } from "@mui/material";
import { useMemo } from "react";
import { CONTRACT_ADDRESS } from "~/configs/blockchain";

type props = ButtonProps & {
  tokenId: number;
  isExternal?: boolean;
};

export const generateLink = (tokenId: number) => {
  return `https://mumbai.polygonscan.com/token/${CONTRACT_ADDRESS}?a=${tokenId}`;
};

const NftLinkButton = ({
  tokenId,
  isExternal = true,
  ...buttonProps
}: props) => {
  const nftLink = useMemo(() => {
    return generateLink(tokenId);
  }, [tokenId]);
  return (
    <Button
      onClick={() => {
        isExternal ? window.open(nftLink) : window.location.replace(nftLink);
      }}
      {...buttonProps}
    >
      {buttonProps.children}
    </Button>
  );
};

export default NftLinkButton;
