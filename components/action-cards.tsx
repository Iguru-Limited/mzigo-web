"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faFileLines,
  faEye,
  faMagnifyingGlass,
  faTruck,
  faBell,
  faBox,
  faChartBar,
  faGear,
  faQrcode,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface ActionCardConfig {
  id: string;
  label: string;
  icon: any;
  href: string;
  color: string;
  requiredRights: string[];
}

const ACTION_CARDS: ActionCardConfig[] = [
  {
    id: "create",
    label: "New Mzigo",
    icon: faPlus,
    href: "/mzigo/create",
    color: "bg-slate-700",
    requiredRights: ["create"],
  },
  {
    id: "report",
    label: "View Report",
    icon: faFileLines,
    href: "/report",
    color: "bg-slate-700",
    requiredRights: ["report"],
  },
  {
    id: "browse",
    label: "Browse",
    icon: faEye,
    href: "/mzigo/browse",
    color: "bg-slate-700",
    requiredRights: ["browse", "search", "report"],
  },
  {
    id: "search",
    label: "Search",
    icon: faMagnifyingGlass,
    href: "/mzigo/search",
    color: "bg-slate-700",
    requiredRights: ["search"],
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: faTruck,
    href: "/delivery",
    color: "bg-slate-700",
    requiredRights: ["delivery"],
  },
  {
    id: "notify",
    label: "Notifications",
    icon: faBell,
    href: "/notifications",
    color: "bg-slate-700",
    requiredRights: ["notify"],
  },
  {
    id: "collection",
    label: "Collections",
    icon: faBox,
    href: "/collections",
    color: "bg-slate-700",
    requiredRights: ["collection"],
  },
  {
    id: "dispatch",
    label: "Dispatch",
    icon: faChartBar,
    href: "/dispatch",
    color: "bg-slate-700",
    requiredRights: ["dispatch"],
  },
  {
    id: "load",
    label: "Loading",
    icon: faGear,
    href: "/load",
    color: "bg-slate-700",
    requiredRights: ["load"],
  },
  {
    id: "lookup",
    label: "Look Up",
    icon: faQrcode,
    href: "/lookup",
    color: "bg-slate-700",
    requiredRights: ["search"],
  },
];

export function ActionCards() {
  const { data: session } = useSession();

  if (!session?.user?.rights || session.user.rights.length === 0) {
    return null;
  }

  const userRights = session.user.rights;

  // Filter cards based on user rights
  const availableCards = ACTION_CARDS.filter((card) =>
    card.requiredRights.some((right) => userRights.includes(right))
  );

  if (availableCards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* <div>
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">
          Available actions based on your rights
        </p>
      </div> */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
        {availableCards.map((card) => (
          <Link key={card.id} href={card.href}>
            <div className="group cursor-pointer rounded-lg border border-border/50 p-6 transition-all hover:border-primary/50 hover:bg-accent hover:shadow-md">
              <div className="flex flex-col items-center gap-4 text-center">
                <div
                  className={cn(
                    "rounded-lg p-4 text-white transition-transform group-hover:scale-110",
                    card.color
                  )}
                >
                  <FontAwesomeIcon icon={card.icon} className="text-2xl" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                  {card.label}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
