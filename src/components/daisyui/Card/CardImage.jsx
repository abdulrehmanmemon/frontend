import { forwardRef } from "react";

const CardImage = forwardRef(({ ...props }, ref) => {
  return (
    <figure ref={ref}>
      <img alt="Card Image" {...props} />
    </figure>
  );
});

CardImage.displayName = "Card image";

export default CardImage;
