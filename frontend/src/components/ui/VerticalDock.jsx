import { useState } from "react";
import "./VerticalDock.css";

export default function VerticalDock({ items }) {
  const [hovered, setHovered] = useState(null);

  return (
    <aside className="dock-outer">
      <div className="dock-panel">
        {items.map((item, i) => (
          <button
            key={i}
            className={`dock-item ${hovered === i ? "dock-hovered" : ""}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={item.onClick}
            aria-label={item.label}
          >
            <span className="dock-icon">{item.icon}</span>
            {hovered === i && (
              <span className="dock-label">{item.label}</span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
