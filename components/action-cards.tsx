"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faPlus,
  faFileLines,
  faEye,
  faMagnifyingGlass,
  faTruck,
  faBell,
  faBox,
  faChartBar,
  faQrcode,
  faClockRotateLeft,
  faListCheck,
  faBolt,
  faCopy,
  faClipboardList,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface ActionCardConfig {
  id: string;
  label: string;
  icon: IconProp;
  href: string;
  color: string;
  primaryRight: string; // The role name to use for access control and rank sorting
}

const ACTION_CARDS: ActionCardConfig[] = [
  {
    id: "create",
    label: "New Mzigo",
    icon: faPlus,
    href: "/mzigo/create",
    color: "bg-slate-700",
    primaryRight: "create",
  },
  {
    id: "loading-sheets",
    label: "Loading Sheets",
    icon: faClipboardList,
    href: "/loading-sheets",
    color: "bg-slate-700",
    primaryRight: "loading_sheet",
  },
  {
    id: "browse",
    label: "Browse",
    icon: faEye,
    href: "/mzigo/browse",
    color: "bg-slate-700",
    primaryRight: "browse",
  },
  {
    id: "report",
    label: "View Report",
    icon: faFileLines,
    href: "/report",
    color: "bg-slate-700",
    primaryRight: "report",
  },
  {
    id: "search",
    label: "Search",
    icon: faMagnifyingGlass,
    href: "/mzigo/search",
    color: "bg-slate-700",
    primaryRight: "search",
  },
  {
    id: "load-direct",
    label: "Direct Loading",
    icon: faBolt,
    href: "/load?mode=direct",
    color: "bg-slate-700",
    primaryRight: "direct_load",
  },
  {
    id: "load-legacy",
    label: "Legacy Loading",
    icon: faClockRotateLeft,
    href: "/load?mode=legacy",
    color: "bg-slate-700",
    primaryRight: "legacy_loading",
  },
  {
    id: "load-detailed",
    label: "Detailed Loading",
    icon: faListCheck,
    href: "/load?mode=detailed",
    color: "bg-slate-700",
    primaryRight: "detailed_loading",
  },
  {
    id: "reprint",
    label: "Duplicate",
    icon: faCopy,
    href: "/duplicate",
    color: "bg-slate-700",
    primaryRight: "reprint",
  },
  {
    id: "dispatch",
    label: "Dispatch",
    icon: faChartBar,
    href: "/dispatch",
    color: "bg-slate-700",
    primaryRight: "dispatch",
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: faTruck,
    href: "/delivery",
    color: "bg-slate-700",
    primaryRight: "delivery",
  },
  {
    id: "collection",
    label: "Collections",
    icon: faBox,
    href: "/collections",
    color: "bg-slate-700",
    primaryRight: "collection",
  },
  {
    id: "notify",
    label: "Notifications",
    icon: faBell,
    href: "/notifications",
    color: "bg-slate-700",
    primaryRight: "notify",
  },
  {
    id: "lookup",
    label: "Look Up",
    icon: faQrcode,
    href: "/lookup",
    color: "bg-slate-700",
    primaryRight: "qr_scanner",
  },
  {
    id: "express",
    label: "Express",
    icon: faRocket,
    href: "/express",
    color: "bg-slate-700",
    primaryRight: "express",
  },
];

export function ActionCards() {
  const { data: session } = useSession();

  if (!session?.user?.rights || session.user.rights.length === 0) {
    return null;
  }

  const userRights = session.user.rights;
  const rolesObject = session.rolesObject || [];

  // Create a map of role rank to rank for sorting
  const rankMap = new Map<number, number>();
  rolesObject.forEach((role) => {
    const rank = parseInt(role.rank, 10);
    if (!isNaN(rank)) {
      // Store the rank for each rank value
      rankMap.set(rank, rank);
    }
  });

  // Create a map of primaryRight to rank for lookup during sort
  const primaryRightToRankMap = new Map<string, number>();
  rolesObject.forEach((role) => {
    const rank = parseInt(role.rank, 10);
    if (!isNaN(rank)) {
      primaryRightToRankMap.set(role.name, rank);
    }
  });

  
  // Filter cards based on user rights and sort by rank (ascending order)
  const availableCards = ACTION_CARDS.filter((card) =>
    userRights.includes(card.primaryRight)
  ).sort((a, b) => {
    const aRank = primaryRightToRankMap.get(a.primaryRight) ?? Infinity;
    const bRank = primaryRightToRankMap.get(b.primaryRight) ?? Infinity;
    
    console.log(`🔍 DEBUG - Comparing: "${a.label}" (${a.primaryRight}, rank: ${aRank}) vs "${b.label}" (${b.primaryRight}, rank: ${bRank})`);
    
    // If ranks are equal, maintain original order by using card index
    if (aRank === bRank) {
      return ACTION_CARDS.indexOf(a) - ACTION_CARDS.indexOf(b);
    }
    
    // Sort by rank in ascending order (1, 2, 3, ...)
    return aRank - bRank;
  });

  console.log("🔍 DEBUG - availableCards after sorting:", availableCards.map((c) => ({
    label: c.label,
    primaryRight: c.primaryRight,
    rank: primaryRightToRankMap.get(c.primaryRight),
  })));

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
