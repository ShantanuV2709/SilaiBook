import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef
} from "react";
import gsap from "gsap";
import "./CardSwap.css";

export const Card = forwardRef(({ className = "", ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`card ${className}`.trim()}
  />
));

Card.displayName = "Card";
const BASE_Y_OFFSET = 60; // tune: 20–80
// Shift cards LEFT (-x) and UP (-y) to build the stack from the corner
const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: BASE_Y_OFFSET - i * distY,
  z: -i * 80,

  rotateY: -14,
  rotateX: 6 + i * 1.2,
  rotateZ: -0.6 * i,

  zIndex: total - i
});


const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    // REMOVED -50% centering to keep cards anchored to the bottom-right
    xPercent: 0,
    yPercent: 0,
    skewY: skew,
    transformOrigin: "bottom right",
    zIndex: slot.zIndex,
    force3D: true
  });

const CardSwap = ({
  width = 680,
  height = 440,
  cardDistance = 80,
  verticalDistance = 40,
  delay = 5000,
  skewAmount = 2,
  children
}) => {
  const config = {
    ease: "expo.out", // Smoother "weighty" feel for large cards
    durDrop: 1.2,
    durMove: 1.2,
    durReturn: 1.2,
    promoteOverlap: 0.8
  };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(() => childArr.map(() => React.createRef()), [childArr.length]);
  const order = useRef(childArr.map((_, i) => i));
  const tlRef = useRef(null);
  const intervalRef = useRef();

  useEffect(() => {
    const total = refs.length;
    
    // Initial Placement
    refs.forEach((r, i) =>
      placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount)
    );

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      const tl = gsap.timeline();
      tlRef.current = tl;

      // 1. Drop the front card down off the screen
      tl.to(elFront, { 
        y: "+=600", 
        opacity: 0,
        duration: config.durDrop, 
        ease: "power2.in" 
      });

      // 2. Promote the next cards in the stack
      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(refs[idx].current, { zIndex: slot.zIndex }, "promote");
        tl.to(
          refs[idx].current,
          { ...slot, duration: config.durMove, ease: config.ease },
          "promote"
        );
      });

      // 3. Bring the old front card back to the very end of the stack
      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.set(elFront, { zIndex: backSlot.zIndex, opacity: 1 }, "return");
      tl.fromTo(elFront, 
        { x: backSlot.x + 100, y: backSlot.y - 100 }, // Slide in from the side
        { ...backSlot, duration: config.durReturn, ease: config.ease }, 
        "return"
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    intervalRef.current = setInterval(swap, delay);
    return () => clearInterval(intervalRef.current);
  }, [cardDistance, verticalDistance, delay, skewAmount]);

  return (
    <div className="card-swap-container">
      {childArr.map((child, i) =>
        isValidElement(child)
          ? cloneElement(child, {
              ref: refs[i],
              style: { width, height, ...(child.props.style ?? {}) }
            })
          : child
      )}
    </div>
  );
};

export default CardSwap;