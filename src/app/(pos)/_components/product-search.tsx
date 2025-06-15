import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePOSFilters } from '@/modules/pos/hooks/use-pos-filter';
import { Search } from 'lucide-react';
import React, { useState } from 'react';

const ProductSearch = () => {
    const [filters, setFilters] = usePOSFilters();
    const [inputValue, setInputValue] = useState(filters.search || "");
    const handleSearchClick = () => {
		setFilters({ search: inputValue });
	};
	return (
        <div className='w-full relative'>
            <Search className='absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground ' />
            <Input 
                onChange={(e) => setInputValue(e.target.value)}
                placeholder='Search for a product...' 
                className='pl-10 pr-16 py-4 h-12 rounded-full shadow-none text-gray-500 focus-visible:outline-0 focus-visible:ring-0 focus-visible:border-green-700 focus-visible:border-r-green-700 focus-visible:shadow-none transition-all duration-300 ease-in-out'
            />
            <Button 
                onClick={handleSearchClick} 
                className='rounded-full absolute top-1/2 right-2 -translate-y-1/2 bg-green-700 text-white hover:bg-green-800 transition-all duration-300 ease-in-out'
            >
                Search
            </Button>
        </div>
    );
};

export default ProductSearch;
