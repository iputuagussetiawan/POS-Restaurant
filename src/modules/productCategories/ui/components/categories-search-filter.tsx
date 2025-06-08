import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCategoriesFilters } from '../../hooks/use-categories-filter';

export const CategoriesSearchFilter = () => {
    const [filters, setFilters] = useCategoriesFilters();

    return (
        <div className="relative">
            <Input
                className="h-9 w-[200px] bg-white pl-7"
                type="text"
                placeholder="Filter by name..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
            />
            <SearchIcon className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
    );
};
