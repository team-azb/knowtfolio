import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingDisplay from "~/components/atoms/LoadingDisplay";
import EditArticleForm from "~/components/organisms/forms/EditArticleForm";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";

const ContentOnEditable = ({ articleId }: { articleId: string }) => {
  return (
    <div>
      <EditArticleForm articleId={articleId} />
    </div>
  );
};

const contentOnNotEditable = (
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

/**
 * "/articles/:ariticleId/edit"で表示されるページコンポーネント
 */
const EditArticlePage = () => {
  const { articleId } = useParams();
  const { account, contract } = useWeb3Context();
  const [ownerIdOfArticle, setOwnerIdOfArticle] = useState<null | string>(null);
  const isAuthorized = useMemo(() => {
    return ownerIdOfArticle === account;
  }, [account, ownerIdOfArticle]);

  const content = useMemo(() => {
    if (ownerIdOfArticle === null) {
      return <LoadingDisplay message="編集権限を照会中" />;
    } else if (isAuthorized && articleId) {
      return <ContentOnEditable articleId={articleId} />;
    } else {
      return contentOnNotEditable;
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
