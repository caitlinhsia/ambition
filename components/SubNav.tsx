"use client";

/** Switches between modes inside one section, so the top nav stays short. */
export default function SubNav<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { k: T; label: string }[];
  value: T;
  onChange: (k: T) => void;
}) {
  return (
    <div className="subnav" role="tablist">
      {items.map((it) => (
        <button
          key={it.k}
          role="tab"
          aria-selected={value === it.k}
          onClick={() => onChange(it.k)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
