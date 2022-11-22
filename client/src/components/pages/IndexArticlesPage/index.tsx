import ArticleCardList from "~/components/organisms/ArticleCardList";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

const IndexArticlesPage = () => {
  return (
    <HeaderLayout>
      <h1>articles</h1>
      <ArticleCardList />
    </HeaderLayout>
  );
};

export default IndexArticlesPage;
