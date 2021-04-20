import React, { useState } from "react";
import "nav-frontend-tabell-style";
import styled from "styled-components";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import AttachmentPreview from "./Attachments/VedleggForhandsvisning";
import NavFrontendSpinner from "nav-frontend-spinner";
import Alertstripe from "nav-frontend-alertstriper";
import UploadButton from "./Attachments/upload-button";
import { File } from "forhandsvisningsfil";

const FullfoerVedtakContainer = styled.div`
  margin: 0.5em 1em;
  padding: 24px;
  background: white;
  width: fit-content;
  p {
    font-size: 16px;
  }
  h2 {
    font-size: 24px;
  }
  p,
  h2 {
    margin: 0;
  }
  button {
    width: 100%;
    margin-right: 16px;
  }
  div {
    margin-bottom: 24px;
  }
  &.skjult {
    display: none;
  }
`;
interface Props {
  skjult: boolean;
  files: File[];
  setFiles: (files: File[]) => void;
}

const FILE_INPUT_ID = "file-upload-input";

const FullfoerVedtak = ({ skjult, files: files, setFiles: setFiles }: Props): JSX.Element => {
  const [attachmentsLoading, setAttachmentsLoading] = useState<boolean>(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [loading, setIsLoading] = useState<boolean>(false);

  console.log("setFiles: ----> ", files);
  return (
    <FullfoerVedtakContainer className={`${skjult ? "skjult" : ""}`}>
      <h2>Fullfør vedtak</h2>
      <div>
        <UploadButton
          inputId={FILE_INPUT_ID}
          files={files}
          setFiles={setFiles}
          setLoading={setAttachmentsLoading}
          setError={setAttachmentError}
        />
        <Hovedknapp disabled={true}>Fullfør og send ut vedtak</Hovedknapp>
      </div>

      <AttachmentPreview
        files={files}
        setFiles={setFiles}
        setLoading={setIsLoading}
        setError={setAttachmentError}
      />
      {showAttachmentLoader(attachmentsLoading)}

      {getAttachmentError(attachmentError)}
    </FullfoerVedtakContainer>
  );
};

const showAttachmentLoader = (loading: boolean) => {
  if (!loading) {
    return null;
  }
  return <NavFrontendSpinner type={"XL"} />;
};

const getAttachmentError = (error: string | null) => {
  if (error === null) {
    return null;
  }

  return <Alertstripe type="feil">{error}</Alertstripe>;
};

export default FullfoerVedtak;
