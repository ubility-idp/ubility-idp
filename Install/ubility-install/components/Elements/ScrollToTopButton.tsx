import {IconButton} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

function ScrollToTopButton() {
  return (
    <div className="sticky w-full flex justify-end px-[3%] bottom-5">
      <IconButton
        onClick={() => {
          window.scrollTo(0, 0);
        }}
      >
        <ArrowUpwardIcon />
      </IconButton>
    </div>
  );
}

export default ScrollToTopButton;
