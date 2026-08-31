import { useEffect, useState } from "react";
import { searchLuzPeers, type LuzPeer } from "@/lib/server/luz";
import { Input } from "@/components/ui/input";

export function LuzNameField({
  picked,
  onPick,
  placeholder = "Escribe el nombre del miembro",
}: {
  picked: LuzPeer | null;
  onPick: (peer: LuzPeer | null) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(picked?.displayName ?? "");
  const [hits, setHits] = useState<LuzPeer[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    if (picked && q === picked.displayName) {
      setHits([]);
      return;
    }
    const id = window.setTimeout(() => {
      void searchLuzPeers({ data: { query: q } })
        .then(setHits)
        .catch(() => setHits([]));
    }, 220);
    return () => window.clearTimeout(id);
  }, [query, picked]);

  return (
    <div className="relative">
      <Input
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          onPick(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {picked ? (
        <p className="mt-1 text-xs text-ok">Seleccionado: {picked.displayName}</p>
      ) : query.trim().length >= 2 && hits.length === 0 ? (
        <p className="mt-1 text-xs text-muted">Sin coincidencias.</p>
      ) : null}
      {open && hits.length > 0 ? (
        <ul className="luz-hits">
          {hits.map((hit) => (
            <li key={hit.userId}>
              <button
                type="button"
                onClick={() => {
                  onPick(hit);
                  setQuery(hit.displayName);
                  setHits([]);
                  setOpen(false);
                }}
              >
                <span>{hit.displayName}</span>
                {typeof hit.luz === "number" ? <span className="font-mono text-muted">{hit.luz.toFixed(0)} LUZ</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
