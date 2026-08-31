import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { listNotices, type Notice } from "@/lib/server/notices";

export function NoticeBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);
  useEffect(() => {
    void listNotices().then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <div className="relative">
      <button type="button" className="notice-bell" aria-label="Avisos" onClick={() => setOpen((v) => !v)}>
        <Bell size={16} strokeWidth={1.8} />
      </button>
      {open ? (
        <div className="notice-panel">
          {items.length === 0 ? (
            <p className="text-sm text-muted">Sin avisos.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="notice-item">
                <div className="text-sm font-medium">{item.title}</div>
                <p className="text-xs text-muted">{item.body}</p>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
