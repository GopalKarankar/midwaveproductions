import { ROLES } from "@/constants/roles";

export function RoleCheckboxGroup({ value = [], onChange, disabled }) {
  const toggle = (role) => {
    const next = value.includes(role)
      ? value.filter((r) => r !== role)
      : [...value, role];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1">
      {Object.values(ROLES).map((role) => (
        <label
          key={role}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent cursor-pointer"
        >
          <input
            type="checkbox"
            checked={value.includes(role)}
            disabled={disabled || (value.includes(role) && value.length === 1)}
            onChange={() => toggle(role)}
            className="accent-accent cursor-pointer disabled:cursor-not-allowed"
          />
          {role}
        </label>
      ))}
    </div>
  );
}
