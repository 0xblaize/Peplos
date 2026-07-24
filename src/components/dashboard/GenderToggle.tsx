'use client';

export type AvatarGender = 'male' | 'female';

interface GenderToggleProps {
  value: AvatarGender;
  onChange: (gender: AvatarGender) => void;
}

const OPTIONS: Array<{ key: AvatarGender; label: string }> = [
  { key: 'female', label: 'Girl' },
  { key: 'male', label: 'Boy' },
];

export default function GenderToggle({ value, onChange }: GenderToggleProps) {
  return (
    <div className="absolute top-16 right-4 z-10 flex rounded-full bg-white/90 backdrop-blur p-1 shadow-sm text-xs font-semibold">
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          onClick={() => onChange(option.key)}
          aria-pressed={value === option.key}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            value === option.key
              ? 'bg-peplos-pink text-white'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
