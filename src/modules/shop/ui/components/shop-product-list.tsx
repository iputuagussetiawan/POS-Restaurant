import ShopCardProduct from './shop-card-product';
import type { ShopProduct } from '../../types';

interface ShopProductListProps {
	data: ShopProduct[];
	taxRate: number;
	serviceRate: number;
}

const ShopProductList = ({ data, taxRate, serviceRate }: ShopProductListProps) => {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
			{data.map((item) => (
				<ShopCardProduct
					key={item.id}
					data={item}
					taxRate={taxRate}
					serviceRate={serviceRate}
				/>
			))}
		</div>
	);
};

export default ShopProductList;
