function formatCategoryId(name: string) {
	const unixTimestamp = Date.now();
	// Remove spaces, uppercase, then take first 4 chars
	const prefix = name.replace(/\s+/g, '').toUpperCase().slice(0, 4);
	return `${prefix}-${unixTimestamp}`;
}

export const dataCategories = [
	{
		id: formatCategoryId('Appetizers'),
		name: 'Appetizers',
		description: 'E.g., spring rolls, garlic bread, chicken wings',
		imageUrl: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg', // appetizer food
	},
	{
		id: formatCategoryId('Main Courses'),
		name: 'Main Courses',
		description: 'E.g., grilled steak, pasta, curry, burgers',
		imageUrl: 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg', // main course
	},
	{
		id: formatCategoryId('Desserts'),
		name: 'Desserts',
		description: 'E.g., ice cream, cake, pudding, tiramisu',
		imageUrl: 'https://images.pexels.com/photos/302680/pexels-photo-302680.jpeg', // desserts
	},
	{
		id: formatCategoryId('Beverages (Non-Alcoholic)'),
		name: 'Beverages (Non-Alcoholic)',
		description: 'E.g., coffee, tea, smoothies, soft drinks',
		imageUrl: 'https://images.pexels.com/photos/414886/pexels-photo-414886.jpeg', // beverages
	},
	{
		id: formatCategoryId('Alcoholic Beverages'),
		name: 'Alcoholic Beverages',
		description: 'E.g., beer, wine, cocktails, spirits',
		imageUrl: 'https://images.pexels.com/photos/1257079/pexels-photo-1257079.jpeg', // alcoholic drinks
	},
	{
		id: formatCategoryId('Salads'),
		name: 'Salads',
		description: 'E.g., Caesar salad, Greek salad, quinoa salad',
		imageUrl: 'https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg', // salad
	},
	{
		id: formatCategoryId('Soups'),
		name: 'Soups',
		description: 'E.g., miso soup, chicken noodle soup, tom yum',
		imageUrl: 'https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg', // soup
	},
	{
		id: formatCategoryId('Vegan / Vegetarian Dishes'),
		name: 'Vegan / Vegetarian Dishes',
		description: 'E.g., plant-based burgers, tofu stir-fry, lentil curry',
		imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', // vegan dishes
	},
	{
		id: formatCategoryId('Seafood'),
		name: 'Seafood',
		description: 'E.g., grilled salmon, shrimp pasta, sushi',
		imageUrl: 'https://images.pexels.com/photos/3296273/pexels-photo-3296273.jpeg', // seafood
	},
	{
		id: formatCategoryId('Kids Menu'),
		name: 'Kids Menu',
		description: 'E.g., chicken nuggets, mini pizzas, juice boxes',
		imageUrl: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg', // kids menu
	},
];
