/**
 * Represents a single button (key) in the calculator.
 * It displays a label, applies a neon gradient style,
 * and triggers a click handler when pressed.
 */
// eslint-disable-next-line react/prop-types
const Key = ({ label, isEqual, onClick, neonStyle }) => {
  // Base Tailwind classes for all buttons: layout, padding, rounded corners, etc.
  const baseClasses =
    "flex cursor-pointer items-center justify-center p-4 rounded-[5px] text-white font-bold transform transition hover:scale-105";

  // Conditional classes: apply special or default neon gradient styles
  const buttonClasses = isEqual
    ? `bg-gradient-to-br ${neonStyle} shadow-[0_0_10px_rgba(255,255,255,0.7)] animate-neon`
    : `bg-gradient-to-br ${neonStyle} shadow-[0_0_10px_rgba(255,255,255,0.7)] animate-neon`;

  return (
    <div
      className={`${baseClasses} ${buttonClasses}`}
      onClick={() => onClick(label)}
    >
      {label}
    </div>
  );
};

export default Key;
