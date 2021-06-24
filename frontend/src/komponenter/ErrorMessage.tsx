import * as React from "react";
import styled from "styled-components";

const StyledError = styled.div`
  margin: 1em;
`;

export const ErrorMessage: React.FC<{ onReset: () => void }> = () => {
  return (
    <StyledError>
      <h2>{`Beklager, men en uventet feil har oppstått`}</h2>
      Forsøk å laste siden på nytt.
    </StyledError>
  );
};

export function test(props: any) {
  const Container = props.componentClass;
  return <Container />;
}
