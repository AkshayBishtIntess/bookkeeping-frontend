import React from "react";
import {
  UploadOutlined,
  FilePdfFilled,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Button, Upload, message } from "antd";

const FileUpload = ({ value, onChange }) => {
  // Convert file size from bytes to KB and format it
  const formatFileSize = (size) => `${(size / 1024).toFixed(2)} KB`;

  // Props for the Upload component
  const props = {
    // action: "//jsonplaceholder.typicode.com/posts/",
    accept: ".pdf", // Only allow PDF files
    listType: "picture", // Sets the list type for file items
    // beforeUpload: (file) => {
    //   const isPdf = file.type === "application/pdf";
    //   if (!isPdf) {
    //     message.error('You can only upload PDF files!');
    //   }
    //   return isPdf || Upload.LIST_IGNORE; // Ignore files that are not PDF
    // },

    beforeUpload: (file) => {
      const isPdf = file.type === "application/pdf";
      if (!isPdf) {
        message.error('You can only upload PDF files!');
        return Upload.LIST_IGNORE;
      }
      // Store the file without uploading
      onChange && onChange(file);
      return false; // Prevent automatic upload
    },

    onChange(info) {
      if (info.file.status === "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
        // Pass the file information to the form
        onChange && onChange(info.file);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    itemRender: (originNode, file, fileList, actions) => (
      <div className="custom-upload-item">
        <FilePdfFilled style={{ color: "#fa4f4e", fontSize: "26px" }} />
        <div style={{ marginLeft: "8px", flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{file.name}</div>
          <div style={{ fontSize: "12px", color: "gray" }}>
            {formatFileSize(file.size)}
          </div>
        </div>
        <EditOutlined
          className="upload-action-buttons"
          onClick={() => message.info("Edit action")}
        />
        <DeleteOutlined
          className="upload-action-buttons"
          onClick={() => {
            actions.remove();
            onChange && onChange(undefined);
          }}
        />
      </div>
    ),
  };

  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  );
};

export default FileUpload;