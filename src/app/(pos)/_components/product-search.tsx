import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React from 'react';

const ProductSearch = () => {
	return (
        <div className='w-full relative'>
            <Search className='absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground ' />
            <Input 
  placeholder='Search for a product...' 
  className='pl-10 py-4 h-10 rounded-full shadow-none text-gray-500 focus-visible:outline-0 focus-visible:ring-0 focus-visible:border-green-700 focus-visible:border-r-green-700 focus-visible:shadow-none transition-all duration-300 ease-in-out'
/>
        </div>
    );
};

export default ProductSearch;
