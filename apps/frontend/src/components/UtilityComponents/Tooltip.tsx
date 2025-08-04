import React from "react"

import "./Tooltip.css" // CSS for styling the tooltip

interface TooltipProps {
  content: string // The text to display inside the tooltip
  position?: "top" | "bottom" | "left" | "right" // The position of the tooltip relative to the target
  children: React.ReactNode // The target element that triggers the tooltip
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "top",
  children,
}) => {
  return (
    <div className="tooltip-container">
      {children}
      <div className={`tooltip tooltip-${position}`} role="tooltip">
        {content}
      </div>
    </div>
  )
}

export default Tooltip
