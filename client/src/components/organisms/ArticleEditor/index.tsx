import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Editor } from "@tinymce/tinymce-react";
import { Editor as TinyMCEEditor } from "tinymce";
import { useS3Client } from "~/apis/s3";
import { ARTICLE_RESOURCES_S3_BUCKET } from "~/configs/s3";
import { TINY_MCE_API_KEY } from "~/configs/tinymce";

type articleEditorProps = {
  onEditorChange?: (a: string, editor: TinyMCEEditor) => void;
  value?: string;
};

const ArticleEditor = ({ onEditorChange, value }: articleEditorProps) => {
  const s3Client = useS3Client();

  return (
    <Editor
      onEditorChange={onEditorChange}
      value={value}
      apiKey={TINY_MCE_API_KEY}
      init={{
        height: 500,
        menubar: true,
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        images_upload_handler: async (blobInfo) => {
          const timestamp = new Date().getTime();
          const filename = `${timestamp}_${blobInfo.filename()}`;
          const command = new PutObjectCommand({
            Bucket: ARTICLE_RESOURCES_S3_BUCKET,
            Key: `images/${filename}`,
            Body: blobInfo.blob(),
            ContentType: blobInfo.blob().type,
          });
          await s3Client.send(command);
          return `https://knowtfolio.com/images/${filename}`;
        },
        text_patterns: [
          { start: "*", end: "*", format: "italic" },
          { start: "**", end: "**", format: "bold" },
          { start: "#", format: "h1" },
          { start: "##", format: "h2" },
          { start: "###", format: "h3" },
          { start: "####", format: "h4" },
          { start: "#####", format: "h5" },
          { start: "######", format: "h6" },
          { start: "`", end: "`", format: "code" },
          // The following text patterns require the `lists` plugin
          { start: "1. ", cmd: "InsertOrderedList" },
          {
            start: "a. ",
            cmd: "InsertOrderedList",
            value: { "list-style-type": "lower-alpha" },
          },
          {
            start: "i. ",
            cmd: "InsertOrderedList",
            value: { "list-style-type": "lower-roman" },
          },
          { start: "* ", cmd: "InsertUnorderedList" },
          { start: "- ", cmd: "InsertUnorderedList" },
        ],
      }}
      toolbar={[
        "undo redo | styles | bold italic codeformat underline | fontfamily fontsize forecolor | alignleft aligncenter alignright",
        "emoticons anchor link image media | numlist bullist table | codesample | wordcount searchreplace preview visualblocks help",
      ]}
      plugins={[
        "image",
        "textpattern",
        "preview",
        "lists",
        "advlist",
        "link",
        "autolink",
        "table",
        "anchor",
        "code",
        "codesample",
        "emoticons",
        "searchreplace",
        "visualblocks",
        "media",
        "wordcount",
        "help",
      ]}
    />
  );
};

export default ArticleEditor;
