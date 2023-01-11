import PdfPrinter from "pdfmake";

export const getPdfReadableStream = (blogPost) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
    },
  };

  const printer = new PdfPrinter(fonts);
  console.log("blogPost.title: ", blogPost.title);
  const docDefinition = {
    content: [
      {
        text: blogPost.title,
        style: "header",
        alignment: "center",
        fontSize: 28,
      },
      "\n\n",
      {
        alignment: "justify",
        columns: [
          {
            width: 150,
            text: "Content: " + blogPost.content,
          },
          {
            width: 150,
            text: "Category: " + blogPost.category,
          },
        ],
      },
    ],
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();

  return pdfReadableStream;
};
