import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ArticleEditForm from "~/components/organisms/ArticleEditForm";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";

const EditArticlePage = () => {
  const { articleId } = useParams();
  const { account, contract } = useWeb3Context();
  const [ownerIdOfArticle, setOwnerIdOfArticle] = useState<null | string>(null);
  const isAuthorized = useMemo(() => {
    return ownerIdOfArticle === account;
  }, [account, ownerIdOfArticle]);

  const content = useMemo(() => {
    if (ownerIdOfArticle === null) {
      return <div>編集権限を照会中です</div>;
    } else if (isAuthorized) {
      return <ArticleEditForm />;
    } else {
      return <div>編集権限がありません</div>;
    }
  }, [isAuthorized, ownerIdOfArticle]);

  useEffect(() => {
    (async () => {
      const ownerIdOfArticle = await contract.methods
        .getOwnerOfArticle(articleId)
        .call();
      setOwnerIdOfArticle(ownerIdOfArticle);
    })();
  }, [articleId, contract.methods]);

  return <>{content}</>;
};

export default EditArticlePage;
