import { nanoid } from 'nanoid';
import { faker } from '@faker-js/faker';
export const dataCategories = [
    {
        id: nanoid(),
        name: 'Appetizers',
        description: 'E.g., spring rolls, garlic bread, chicken wings',
        imageUrl: faker.image.url(),
    },
    {
        id: nanoid(),
        name: 'Main Courses',
        description: 'E.g., grilled steak, pasta, curry, burgers',
        imageUrl: faker.image.url(),
    },
    {
        id: nanoid(),
        name: 'Desserts',
        description: 'E.g., ice cream, cake, pudding, tiramisu',
        imageUrl: faker.image.url(),
    },
    {
        id: nanoid(),
        name: 'Beverages (Non-Alcoholic)',
        description: 'E.g., coffee, tea, smoothies, soft drinks',
        imageUrl: faker.image.url(),
    },
    {
        id: nanoid(),
        name: 'Alcoholic Beverages',
        description: 'E.g., beer, wine, cocktails, spirits',
        imageUrl: faker.image.url(),
    },
    {
        id: nanoid(),
        name: 'Salads',
        description: 'E.g., Caesar salad, Greek salad, quinoa salad',
        imageUrl: faker.image.url(),
    },
    {
        id: nanoid(),
        name: 'Soups',
        description: 'E.g., miso soup, chicken noodle soup, tom yum',
        imageUrl: faker.image.url(),
    },
    {
        id: nanoid(),
        name: 'Vegan / Vegetarian Dishes',
        description: 'E.g., plant-based burgers, tofu stir-fry, lentil curry',
        imageUrl: faker.image.url(),
    },
    {
        id: nanoid(),
        name: 'Seafood',
        description: 'E.g., grilled salmon, shrimp pasta, sushi',
        imageUrl: faker.image.url(),
    },
    {
        id: nanoid(),
        name: 'Kids Menu',
        description: 'E.g., chicken nuggets, mini pizzas, juice boxes',
        imageUrl: faker.image.url(),
    },
];