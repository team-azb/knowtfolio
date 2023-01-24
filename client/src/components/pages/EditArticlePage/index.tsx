import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingDisplay from "~/components/atoms/LoadingDisplay";
import EditArticleForm from "~/components/organisms/forms/EditArticleForm";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import {
  assertMetamask,
  useWeb3Context,
} from "~/components/organisms/providers/Web3Provider";

const ContentOnEditable = ({ articleId }: { articleId: string }) => {
  return <EditArticleForm articleId={articleId} />;
};

const contentOnNotEditable = (
  <div style={{ padding: "100px 400px" }}>
    <h2>サインイン中のアカウントに記事の編集権限がありません</h2>
    <p>
      <Link to="/mypage" style={{ color: "#000" }}>
        マイページ
      </Link>
      にて編集可能な記事をご確認ください
    </p>
  </div>
);

/**
 * "/articles/:ariticleId/edit"で表示されるページコンポーネント
 */
const EditArticlePage = () => {
  const { articleId } = useParams();
  const { isConnectedMetamask, contract } = useWeb3Context();
  const { userWalletAddress } = useAuthContext();
  const [ownerIdOfArticle, setOwnerIdOfArticle] = useState<null | string>(null);

  const isAuthorized = useMemo(() => {
    return ownerIdOfArticle === userWalletAddress;
  }, [ownerIdOfArticle, userWalletAddress]);

  const content = useMemo(() => {
    if (isConnectedMetamask && ownerIdOfArticle === null) {
      return (
        <div style={{ padding: "100px 400px" }}>
          <LoadingDisplay message="編集権限を検証中" />
        </div>
      );
    } else if (isAuthorized && articleId) {
      return (
        <div style={{ padding: "100px 400px" }}>
          <ContentOnEditable articleId={articleId} />
        </div>
      );
    } else {
      return contentOnNotEditable;
    }
  }, [articleId, isAuthorized, isConnectedMetamask, ownerIdOfArticle]);

  useEffect(() => {
    (async () => {
      assertMetamask(isConnectedMetamask);
      // TODO: コントラクトではなくバックエンド経由で取得する
      const ownerIdOfArticle = await contract.methods
        .getOwnerOfArticle(articleId)
        .call();
      setOwnerIdOfArticle(ownerIdOfArticle);
    })();
  }, [articleId, contract, isConnectedMetamask]);

  return <div>{content}</div>;
};

export default EditArticlePage;
