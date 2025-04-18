import { cloneElement } from "react";

import { cn } from "@/helpers";

import { Button } from "../Button";

const CarouselItem = ({
  children,
  innerRef,
  src,
  alt,
  index = 0,
  width,
  hasButtons,
  buttonStyle,
  onPrev,
  onNext,
  className,
  ...props
}) => {
  const classes = cn("carousel-item relative", className, {
    "w-full": width === "full",
    "w-1/2": width === "half",
    "h-full": true,
  });

  const imageClasses = cn({
    "w-full": width === "full",
  });

  const renderButtons = () => {
    if (buttonStyle != null) {
      return (
        <>
          {cloneElement(buttonStyle("❮"), {
            onClick: onPrev,
          })}
          {cloneElement(buttonStyle("❯"), {
            onClick: onNext,
          })}
        </>
      );
    }

    return (
      <>
        <Button onClick={onPrev} shape="circle">
          ❮
        </Button>
        <Button onClick={onNext} shape="circle">
          ❯
        </Button>
      </>
    );
  };

  return (
    <div {...props} id={`item${index}`} ref={innerRef} className={classes}>
      {src ? <img src={src} alt={alt} className={imageClasses} /> : children}
      {hasButtons && (
        <div className="absolute inset-x-5 top-1/2 flex -translate-y-1/2 justify-between">
          {renderButtons()}
        </div>
      )}
    </div>
  );
};

export default CarouselItem;
