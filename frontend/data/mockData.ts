import { Product, NewsItem } from '../types';

export const PRODUCTS: Product[] = [
  { id: 1, title: 'Lumina Noise-Cancel Headphones', price: 299, category: 'Audio', description: 'Experience pure silence with our top-tier noise cancellation.', image: 'https://picsum.photos/seed/tech1/600/600' },
  { id: 2, title: 'Ergonomic Mesh Office Chair', price: 189, category: 'Furniture', description: 'Work in comfort all day long with breathable mesh.', image: 'https://picsum.photos/seed/furn1/600/600' },
  { id: 3, title: 'Minimalist Analog Watch', price: 129, category: 'Wearables', description: 'Timeless design meeting modern durability.', image: 'https://picsum.photos/seed/acc1/600/600' },
  { id: 4, title: 'Smart Fitness Tracker', price: 89, category: 'Wearables', description: 'Track your steps, heart rate, and sleep patterns.', image: 'https://picsum.photos/seed/tech2/600/600' },
  { id: 5, title: 'Leather Weekend Bag', price: 249, category: 'Travel', description: 'Handcrafted premium leather bag perfect for short getaways.', image: 'https://picsum.photos/seed/bag1/600/600' },
  { id: 6, title: 'Wireless Charging Dock', price: 49, category: 'Gadgets', description: 'Charge all your devices simultaneously.', image: 'https://picsum.photos/seed/tech3/600/600' },
  { id: 7, title: 'Premium Coffee Maker', price: 159, category: 'Kitchen', description: 'Barista-quality coffee in the comfort of your kitchen.', image: 'https://picsum.photos/seed/home1/600/600' },
  { id: 8, title: 'Urban Daypack', price: 79, category: 'Travel', description: 'Stylish and functional backpack for the daily commuter.', image: 'https://picsum.photos/seed/bag2/600/600' },
  { id: 9, title: 'Mechanical Keyboard', price: 149, category: 'Hobbies', description: 'Tactile switches for the ultimate typing experience.', image: 'https://picsum.photos/seed/tech4/600/600' },
  { id: 10, title: 'Ceramic Vase Set', price: 65, category: 'Decor', description: 'Minimalist ceramic vases to elevate your home decor.', image: 'https://picsum.photos/seed/home2/600/600' },
  { id: 11, title: 'Designer Sunglasses', price: 199, category: 'Accessories', description: 'UV protection with a classic frame design.', image: 'https://picsum.photos/seed/acc2/600/600' },
  { id: 12, title: 'Bluetooth Speaker', price: 119, category: 'Audio', description: '360-degree sound for your outdoor adventures.', image: 'https://picsum.photos/seed/tech5/600/600' },
  { id: 13, title: 'Cotton Throw Blanket', price: 45, category: 'Decor', description: 'Soft, breathable cotton for cozy evenings.', image: 'https://picsum.photos/seed/home3/600/600' },
  { id: 14, title: 'Leather Wallet', price: 55, category: 'Accessories', description: 'Slim profile with RFID blocking technology.', image: 'https://picsum.photos/seed/acc3/600/600' },
  { id: 15, title: 'Desk Lamp', price: 39, category: 'Furniture', description: 'Adjustable LED brightness for late night work.', image: 'https://picsum.photos/seed/furn2/600/600' },
  { id: 16, title: 'Yoga Mat', price: 29, category: 'Fitness', description: 'Non-slip surface for perfect stability.', image: 'https://picsum.photos/seed/fit1/600/600' },
  { id: 17, title: 'Running Shoes', price: 110, category: 'Fitness', description: 'Lightweight and breathable for long distance runs.', image: 'https://picsum.photos/seed/fit2/600/600' },
  { id: 18, title: 'Smart Home Hub', price: 129, category: 'Gadgets', description: 'Control your entire home with voice commands.', image: 'https://picsum.photos/seed/tech6/600/600' },
  { id: 19, title: 'Cookware Set', price: 299, category: 'Kitchen', description: 'Non-stick professional grade pots and pans.', image: 'https://picsum.photos/seed/home4/600/600' },
  { id: 20, title: 'Winter Scarf', price: 35, category: 'Accessories', description: 'Warm wool blend for the colder months.', image: 'https://picsum.photos/seed/fash1/600/600' },
  // New Products (Total 18 added)
  { id: 21, title: 'Pro Laptop 15"', price: 1299, category: 'Computers', description: 'High performance laptop for professionals.', image: 'https://picsum.photos/seed/comp1/600/600' },
  { id: 22, title: 'Gaming Desktop', price: 1899, category: 'Computers', description: 'Ultimate gaming experience with RTX graphics.', image: 'https://picsum.photos/seed/comp2/600/600' },
  { id: 23, title: 'Curved Monitor 34"', price: 499, category: 'Computers', description: 'Immersive ultrawide display.', image: 'https://picsum.photos/seed/comp3/600/600' },
  { id: 24, title: 'RGB Mechanical Keyboard', price: 159, category: 'Computers', description: 'Customizable lighting and clicky switches.', image: 'https://picsum.photos/seed/comp4/600/600' },
  { id: 25, title: 'Wireless Mouse', price: 79, category: 'Computers', description: 'Precision tracking with long battery life.', image: 'https://picsum.photos/seed/comp5/600/600' },
  { id: 26, title: 'Portable SSD 2TB', price: 229, category: 'Computers', description: 'Rugged and fast external storage.', image: 'https://picsum.photos/seed/comp6/600/600' },
  { id: 27, title: 'HD Webcam', price: 69, category: 'Computers', description: 'Crystal clear video conferencing.', image: 'https://picsum.photos/seed/comp7/600/600' },
  { id: 28, title: 'USB-C Docking Station', price: 149, category: 'Computers', description: 'Connect all your peripherals with one cable.', image: 'https://picsum.photos/seed/comp8/600/600' },
  { id: 29, title: 'Laptop Cooling Pad', price: 39, category: 'Computers', description: 'Keep your device cool under load.', image: 'https://picsum.photos/seed/comp9/600/600' },
  { id: 30, title: 'Drawing Tablet', price: 299, category: 'Computers', description: 'Professional grade pen display.', image: 'https://picsum.photos/seed/comp10/600/600' },
  { id: 31, title: 'Wireless Earbuds Pro', price: 199, category: 'Audio', description: 'Active noise cancellation in a compact form.', image: 'https://picsum.photos/seed/audio3/600/600' },
  { id: 32, title: 'Smart Doorbell', price: 149, category: 'Gadgets', description: 'Video security for your front door.', image: 'https://picsum.photos/seed/gadget7/600/600' },
  { id: 33, title: 'Robot Vacuum Cleaner', price: 349, category: 'Gadgets', description: 'Automated cleaning with mapping technology.', image: 'https://picsum.photos/seed/gadget8/600/600' },
  { id: 34, title: 'Mini Drone', price: 89, category: 'Hobbies', description: 'Fun flying for beginners.', image: 'https://picsum.photos/seed/hobby3/600/600' },
  { id: 35, title: 'VR Headset', price: 399, category: 'Gadgets', description: 'Standalone virtual reality system.', image: 'https://picsum.photos/seed/gadget9/600/600' },
  { id: 36, title: 'Smart Thermostat', price: 179, category: 'Gadgets', description: 'Save energy with intelligent climate control.', image: 'https://picsum.photos/seed/gadget10/600/600' },
  { id: 37, title: 'Action Camera', price: 299, category: 'Hobbies', description: 'Capture your adventures in 4K.', image: 'https://picsum.photos/seed/hobby4/600/600' },
  { id: 38, title: 'WiFi 6 Router', price: 199, category: 'Computers', description: 'High speed internet for the whole home.', image: 'https://picsum.photos/seed/comp11/600/600' },
];

export const NEWS_ITEMS: NewsItem[] = [
    { 
      id: 1, 
      title: "The Future of Smart Homes", 
      date: "Oct 12, 2024", 
      image: "https://images.unsplash.com/photo-1558002038-109155713917?auto=format&fit=crop&w=800&q=80", 
      excerpt: "Discover how AI is transforming the way we interact with our living spaces.",
      content: "Artificial Intelligence is rapidly reshaping the landscape of home automation. From predictive climate control that learns your preferences to security systems that can distinguish between a family member and a stranger, the smart home of the future is more intuitive than ever.\n\nIn this report, we explore the latest gadgets that not only make life easier but also contribute to energy efficiency and sustainability. Companies are now focusing on interoperability, ensuring that your smart fridge can talk to your oven, and your car can communicate with your garage door seamlessly.\n\nWe also take a look at privacy concerns and how the industry is addressing the need for secure, local processing of data to keep your personal life private while still enjoying the benefits of a connected home."
    },
    { 
      id: 2, 
      title: "Sustainable Fashion Trends", 
      date: "Oct 08, 2024", 
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80", 
      excerpt: "Why eco-friendly materials are becoming the new standard in luxury apparel.",
      content: "The fashion industry is undergoing a massive shift towards sustainability. Gone are the days when 'eco-friendly' meant sacrificing style. Today, luxury brands are pioneering the use of recycled materials, organic cotton, and even lab-grown leather alternatives.\n\nThis article dives deep into the processes behind these new materials. We interview top designers who are committing to zero-waste manufacturing and explore how consumer demand is driving this change. \n\nLearn how you can build a wardrobe that looks good and feels good, knowing that you are supporting ethical labor practices and reducing your carbon footprint."
    },
    { 
      id: 3, 
      title: "Minimalism in 2025", 
      date: "Sep 28, 2024", 
      image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80", 
      excerpt: "Exploring the aesthetic shift towards cleaner lines and functional design.",
      content: "Minimalism is more than just a design trend; it's a lifestyle. As we move into 2025, the clutter of the digital age is driving a desire for physical spaces that offer calm and clarity.\n\nWe analyze the architectural and interior design trends that emphasize open spaces, natural light, and multi-functional furniture. 'Less is more' has never been more relevant.\n\nDiscover how decluttering your space can lead to a less cluttered mind, and see examples of stunning minimalist homes from around the world that prove simplicity is the ultimate sophistication."
    }
];

export const ITEMS_PER_PAGE = 9;

