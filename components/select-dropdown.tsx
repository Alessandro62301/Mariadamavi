"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

export type SelectOption = { value: string; label: string };

export function SelectDropdown({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  className = "",
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);
  const listaId = useId();
  const selecionada = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!aberto) return;
    function fecharFora(event: PointerEvent) {
      if (!raizRef.current?.contains(event.target as Node)) setAberto(false);
    }
    function fecharEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setAberto(false);
    }
    document.addEventListener("pointerdown", fecharFora);
    document.addEventListener("keydown", fecharEscape);
    return () => {
      document.removeEventListener("pointerdown", fecharFora);
      document.removeEventListener("keydown", fecharEscape);
    };
  }, [aberto]);

  return (
    <div className={`select-dropdown ${aberto ? "aberto" : ""} ${className}`} ref={raizRef}>
      <button
        type="button"
        className="select-dropdown__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={listaId}
        disabled={disabled}
        onClick={() => setAberto((atual) => !atual)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setAberto(true);
          }
        }}
      >
        <span>{selecionada?.label ?? "Selecione"}</span>
        <ChevronDownIcon className="ic" />
      </button>
      {aberto && (
        <div className="select-dropdown__menu" id={listaId} role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={option.value === value ? "selecionado" : ""}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setAberto(false);
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <span className="select-dropdown__check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
