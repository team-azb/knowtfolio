import NewArticleForm from "~/components/organisms/forms/NewArticleForm";

/**
 * "/articles/new"で表示されるページコンポーネント
 */
const NewArticlePage = () => {
  return (
    <div style={{ padding: "100px 400px" }}>
      <NewArticleForm />
    </div>
  );
};

export default NewArticlePage;
