import React from "react";

interface TypingDotsProps {
  color?: string;
}

export const TypingDots: React.FC<TypingDotsProps> = ({ color = "#f59e0b" }) => {
  return (
    <span className="inline-flex items-end gap-[3px]" aria-label="Typing…">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block rounded-full"
          style={{
            width: 7,
            height: 7,
            background: color,
            animation: "typing-bounce 1.1s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </span>
  );
};

export default TypingDots;
