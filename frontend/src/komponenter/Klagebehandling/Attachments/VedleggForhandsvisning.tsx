import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import FileFC, { File } from "forhandsvisningsfil";

interface Props {
  files: File[];
  setFiles: (files: File[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

export const FlexWithSpacingContainer = styled.div`
  display: flex;
  flex-flow: row wrap;

  > * {
    margin-right: 10px;
  }
`;

export const FileFlexItem = styled(FileFC)`
  margin-bottom: 24px;
`;

const AttachmentPreview = ({ files, setFiles, setLoading, setError }: Props) => {
  //   const attachmentFiles = useMemo(() => toFiles(attachments), [attachments]);

  if (files.length === 0) {
    return null;
  }

  const deleteAttachmentHandler = async (file: File) => {
    setLoading(true);
    // DO something
  };

  return (
    <FlexWithSpacingContainer>
      {files.map((file) => (
        <FileFlexItem
          key={file.name}
          file={file}
          buttonsVisibility="always"
          buttonsPosition="header"
          viewOnePage
          showDeleteButton
          onDeleteFile={() => deleteAttachmentHandler(file)}
        />
      ))}
    </FlexWithSpacingContainer>
  );
};

// const AttachmentPreviewContainer = styled(FlexCenteredOnMobile)`
//   margin-bottom: 32px;
// `;

export default AttachmentPreview;
