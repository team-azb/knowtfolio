import { useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { Editor as TinyMCEEditor } from "tinymce";
import { TINY_MCE_API_KEY } from "~/configs/tinymce";
import { useCallback, useState } from "react";

const EditArticlePage = () => {
  const { articleId } = useParams();
  const [content, setContent] = useState("");
  const handleEditorChange = useCallback<
    (a: string, editor: TinyMCEEditor) => void
  >((value) => {
    setContent(value);
  }, []);
  return (
    <>
      <h1>Edit Articles: {articleId}</h1>
      <Editor
        onEditorChange={handleEditorChange}
        value={content}
        apiKey={TINY_MCE_API_KEY}
        init={{
          height: 500,
          menubar: true,
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />
      <p>preview</p>
      <div>{content}</div>
    </>
  );
};

export default EditArticlePage;
