import React from "react";
import styled from "styled-components";

interface Props {
  className?: string;
}

function Success(props: Props) {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 18 18"
      role="presentation"
    >
      <path
        stroke="#78706A"
        d="M9 1C4.589 1 1 4.59 1 9s3.589 8 8 8c4.41 0 8-3.59 8-8s-3.59-8-8-8z"
      ></path>
      <path
        fill="#78706A"
        d="M7.427 10.628l4.306-3.893a.665.665 0 01.918.03.615.615 0 01-.031.889l-4.766 4.309a.662.662 0 01-.902-.016l-1.588-1.539a.615.615 0 010-.889.664.664 0 01.918 0l1.145 1.109z"
      ></path>
    </svg>
  );
}

export default styled(Success)`
  width: 18px;
`;
