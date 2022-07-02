import { useParams } from "react-router-dom";

const EditArticlePage = () => {
  const { articleId } = useParams();
  return (
    <>
      <h1>Edit Articles: {articleId}</h1>
    </>
  );
};

export default EditArticlePage;
