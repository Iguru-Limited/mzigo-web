import { use } from "react";
import { ExpressResultForm } from "@/components/express/express-result-form";

interface ExpressResultPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default function ExpressResultPage({ searchParams }: ExpressResultPageProps) {
  const params = use(searchParams);
  const query = params?.q ?? null;
  return <ExpressResultForm query={query} />;
}
