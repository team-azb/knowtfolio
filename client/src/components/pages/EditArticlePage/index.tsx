import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Spacer from "~/components/atoms/Spacer";
import EditArticleForm from "~/components/organisms/forms/EditArticleForm";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";

const EditArticlePage = () => {
  const { articleId } = useParams();
  const { contract } = useWeb3Context();
  const { attributes } = useAuthContext();
  const [ownerIdOfArticle, setOwnerIdOfArticle] = useState<null | string>(null);

  const walletAddress = useMemo(() => {
    const walletAddress = attributes.find(
      (atr) => atr.Name === "custom:wallet_address"
    )?.Value;
    return walletAddress || "";
  }, [attributes]);

  const isAuthorized = useMemo(() => {
    return ownerIdOfArticle === walletAddress;
  }, [walletAddress, ownerIdOfArticle]);

  const content = useMemo(() => {
    if (ownerIdOfArticle === null) {
      return <div>編集権限を照会中です</div>;
    } else if (isAuthorized && articleId) {
      return (
        <>
          <h2>Edit article: {articleId}</h2>
          <Spacer height="3rem" />
          <EditArticleForm articleId={articleId} />
        </>
      );
    } else {
      return (
        <div>
          <h2>サインイン中のアカウントに記事の編集権限がありません</h2>
          <p>
            <Link to="/mypage" style={{ color: "#000" }}>
              マイページ
            </Link>
            にてアカウント情報をご確認ください
          </p>
        </div>
      );
    }
  }, [articleId, isAuthorized, ownerIdOfArticle]);

  useEffect(() => {
    (async () => {
      const ownerIdOfArticle = await contract.methods
        .getOwnerOfArticle(articleId)
        .call();
      setOwnerIdOfArticle(ownerIdOfArticle);
    })();
  }, [articleId, contract.methods]);

  return <div style={{ padding: "100px 400px" }}>{content}</div>;
};

export default EditArticlePage;
