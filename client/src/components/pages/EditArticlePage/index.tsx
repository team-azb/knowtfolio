import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getArticle } from "~/apis/knowtfolio";
import LoadingDisplay from "~/components/atoms/LoadingDisplay";
import EditArticleForm from "~/components/organisms/forms/EditArticleForm";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";

const ContentOnEditable = ({ articleId }: { articleId: string }) => {
  return <EditArticleForm articleId={articleId} />;
};

const ContentOnNotEditable = () => {
  const { user } = useAuthContext();
  return (
    <div style={{ padding: "100px 400px" }}>
      <h2>サインイン中のアカウントに記事の編集権限がありません</h2>
      <p>
        <Link to={`/users/${user.getUsername()}`} style={{ color: "#000" }}>
          マイページ
        </Link>
        にて編集可能な記事をご確認ください
      </p>
    </div>
  );
};

/**
 * "/articles/:ariticleId/edit"で表示されるページコンポーネント
 */
const EditArticlePage = () => {
  const { articleId } = useParams();
  const { isConnectedToMetamask, contract } = useWeb3Context();
  const { user } = useAuthContext();
  const [ownerIdOfArticle, setOwnerIdOfArticle] = useState<null | string>(null);

  const isAuthorized = useMemo(() => {
    return ownerIdOfArticle === user.getUsername();
  }, [ownerIdOfArticle, user]);

  const content = useMemo(() => {
    if (ownerIdOfArticle === null) {
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
      return <ContentOnNotEditable />;
    }
  }, [articleId, isAuthorized, ownerIdOfArticle]);

  useEffect(() => {
    (async () => {
      const resp = await getArticle(articleId || "");
      setOwnerIdOfArticle(resp.owner_id || null);
    })();
  }, [articleId, contract, isConnectedToMetamask]);

  return <div>{content}</div>;
};

export default EditArticlePage;
