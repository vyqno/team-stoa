import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentCard, type AgentCardData } from "@/components/AgentCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices, useServiceSearch } from "@/hooks/use-services";

const CATEGORIES = [
  "all",
  "medical",
  "finance",
  "legal",
  "code",
  "data",
  "creative",
  "research",
  "security",
  "agriculture",
  "other",
];

const PRICE_RANGES = [
  { label: "Any", max: Infinity },
  { label: "Free", max: 0 },
  { label: "Under $0.01", max: 0.01 },
  { label: "Under $0.05", max: 0.05 },
  { label: "Under $0.10", max: 0.10 },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Used" },
  { value: "cheapest", label: "Cheapest" },
];

function toAgentCard(service: any): AgentCardData {
  return {
    id: service.id,
    name: service.name,
    category: service.category,
    description: service.description,
    pricePerCall: Number(service.priceUsdcPerCall ?? 0),
    rating: Number(service.successRate ?? 100) / 20,
    totalCalls: service.totalCalls ?? 0,
    verified: Boolean(service.isVerified),
  };
}

const Explore = () => {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState("Any");
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const isSearching = search.trim().length >= 2;

  // API category: if one category selected (not "all"), pass to API
  const apiCategory = selectedCategories.length === 1 && selectedCategories[0] !== "all"
    ? selectedCategories[0]
    : undefined;

  const { data: listData, isLoading: listLoading } = useServices({
    category: apiCategory,
    sort,
    limit: 60,
  });

  const { data: searchData, isLoading: searchLoading } = useServiceSearch(
    search,
    apiCategory
  );

  const rawServices = isSearching ? searchData?.services ?? [] : listData?.services ?? [];

  // Client-side filtering for multi-category + price range
  const services = useMemo(() => {
    let filtered = rawServices;

    // Multi-category client-side filter (when multiple selected)
    if (selectedCategories.length > 1) {
      filtered = filtered.filter((s: any) =>
        selectedCategories.includes(s.category?.toLowerCase())
      );
    }

    // Price range filter (always client-side)
    const priceConfig = PRICE_RANGES.find((p) => p.label === priceRange);
    if (priceConfig && priceConfig.max !== Infinity) {
      if (priceConfig.max === 0) {
        filtered = filtered.filter((s: any) => Number(s.priceUsdcPerCall ?? 0) === 0);
      } else {
        filtered = filtered.filter((s: any) => Number(s.priceUsdcPerCall ?? 0) < priceConfig.max);
      }
    }

    return filtered.map(toAgentCard);
  }, [rawServices, selectedCategories, priceRange]);

  const isLoading = isSearching ? searchLoading : listLoading;

  const toggleCategory = (cat: string) => {
    if (cat === "all") {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange("Any");
    setSearch("");
  };

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h4 className="font-body text-body-sm font-semibold text-foreground mb-3">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCategories.length === 0}
              onChange={() => setSelectedCategories([])}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="font-body text-body-sm text-muted-foreground capitalize">all</span>
          </label>
          {CATEGORIES.filter((c) => c !== "all").map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <span className="font-body text-body-sm text-muted-foreground capitalize">{cat}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-body text-body-sm font-semibold text-foreground mb-3">Price Range</h4>
        <div className="space-y-2">
          {PRICE_RANGES.map((pr) => (
            <label key={pr.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                checked={priceRange === pr.label}
                onChange={() => setPriceRange(pr.label)}
                className="h-4 w-4 accent-primary"
              />
              <span className="font-body text-body-sm text-muted-foreground">{pr.label}</span>
            </label>
          ))}
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );

  return (
    <main className="min-h-screen bg-background pt-[72px]">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <ScrollReveal>
          <h1 className="font-display text-display-md font-bold text-foreground mb-6">Explore</h1>
        </ScrollReveal>

        <div className="relative max-w-xl mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="pl-12 h-14 text-body-md rounded-2xl"
          />
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-[260px] flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Mobile filter toggle */}
          <div className="md:hidden mb-4">
            <Button variant="outline" size="sm" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Mobile filter drawer */}
          {filtersOpen && (
            <div className="fixed inset-0 z-[var(--z-modal)] bg-background p-6 md:hidden overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-body text-heading-md font-semibold">Filters</h3>
                <button onClick={() => setFiltersOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <FilterSidebar />
              <Button variant="default" className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>
                Apply Filters
              </Button>
            </div>
          )}

          {/* Agent Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <span className="font-body text-body-sm text-muted-foreground">
                {services.length} agents found
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="font-body text-body-sm bg-transparent border border-border rounded-lg px-3 py-2"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : services.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <Link key={service.id} to={`/explore/${service.id}`}>
                    <AgentCard agent={service} className="max-w-none" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="font-body text-body-lg text-muted-foreground mb-4">
                  No agents match your filters.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Explore;
