import { css } from "@emotion/react";
import { useState } from "react";

export const Button = ({ color }: { color: string }) => {
  const [count, setCount] = useState(0);

  return (
    <button
      css={css`
        padding: 10px 16px;
        background-color: #d26ac2;
        font-size: 20px;
        border-radius: 4px;
        border: 0px;
        &:hover {
          color: ${color};
        }
      `}
      onClick={() => setCount(count + 1)}
    >
      count is {count}
    </button>
  );
};
