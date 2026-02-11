"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MzigoSearcher } from "@/components/mzigo-search/mzigo-searcher";

export default function SearchMzigosPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 items-center">
        <h1 className="text-2xl font-bold md:text-3xl">Search Mzigos</h1>

      <div className="grid gap-4 md:gap-6 max-w-5xl w-full mx-auto">
         <MzigoSearcher />       
      </div>
    </div>
  );
}
