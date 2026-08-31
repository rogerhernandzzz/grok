import type { CSSProperties, ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { Zap, MessagesSquare, Radio, LineChart, Cpu, Brain, Shield } from "lucide-react";
import { MENU } from "@/lib/nav";
import { DroneIcon } from "@/components/drone-icon";
import { Mark350 } from "@/components/mark-350";

const ICONS: ComponentType<{ className?: string; strokeWidth?: number }>[] = [
  Mark350,
  DroneIcon,
  Zap,
  MessagesSquare,
  Radio,
  LineChart,
  Cpu,
  Brain,
];

export function RadialMenu() {
  return (
    <nav className="radial-stage" aria-label="Navegación principal">
      {MENU.map((item, i) => {
        const Icon = ICONS[i] ?? Shield;
        return (
          <Link
            key={item.to}
            to={item.to}
            className="radial-item"
            style={{ "--angle": `${i * 45}deg` } as CSSProperties}
          >
            <Icon className={i === 0 ? "mark-350-icon" : "radial-icon"} strokeWidth={1.6} />
            <span className="radial-label">{item.label}</span>
          </Link>
        );
      })}
      <div className="radial-core">
        <div>
          <div className="radial-brand">SKYNET</div>
          <div className="radial-tag">La Resistencia</div>
        </div>
      </div>
    </nav>
  );
}
