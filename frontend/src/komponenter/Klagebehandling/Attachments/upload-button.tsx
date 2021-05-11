import React, { useRef } from "react";
import { Knapp } from "nav-frontend-knapper";
import styled from "styled-components";
import { File } from "forhandsvisningsfil";
import { addAttachment } from "./upload";

interface UploadError {
  timestamp: string;
  status: number;
  error: string;
  path: string;
  detail: string;
}

interface Props {
  files: File[];
  inputId: string;
  setFiles: (files: File[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

export const Row = styled.div`
  margin-bottom: 32px;
`;

const UploadButton = ({ inputId, files, setFiles: setFiles, setLoading, setError }: Props) => {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleAttachmentClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    fileInput.current?.click();
  };

  const uploadAttachment = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const files = event.target.files;
    if (files === null || files.length === 0) {
      return;
    }

    const uploads = Array.from(files).map(async (file) => {
      try {
        return await addAttachment(file);
      } catch (err) {
        // if (err instanceof ApiError) {
        //   const errorBody: UploadError = await err.response.json();
        //   const errorMessage = getAttachmentErrorMessage(errorBody.detail);
        //   setError(upload_error(file, errorMessage));
        // } else if (err instanceof Error) {
        //   setError(upload_error(file, err.message));
        // } else {
        //   setError(upload_error(file));
        // }
        return null;
      }
    });
    console.log("uploads:", uploads);
    const addedAttachmentList = uploads.filter(notNull);
    console.log("addedAttachmentList:", addedAttachmentList);
    // TODO
    // setFiles(addedAttachmentList);
    // setAttachments(files.concat(addedAttachmentList));
  };

  return (
    <Row>
      <Knapp onClick={handleAttachmentClick}>Last opp vedtak</Knapp>
      <input
        id={inputId}
        type="file"
        accept=".pdf"
        ref={fileInput}
        onChange={(e) => {
          uploadAttachment(e);
          e.currentTarget.value = "";
        }}
        style={{ display: "none" }}
      />
    </Row>
  );
};

function notNull<T>(v: T | null): v is T {
  return v !== null;
}

export default UploadButton;
