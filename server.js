const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB database
mongoose
  .connect('mongodb://localhost:27017/billing', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB database');
    startServer();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Define the schemas
const productSchema = new mongoose.Schema({
  // _id: {
  //   type: Number,
  //   required: true,
  // },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});


const serviceSchema = new mongoose.Schema({
  // _id: { type: Number }, // Define _id as a Number type
  name: {
    type: String,
    required: true,
  },
  price: Number,
});


const orderSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  items: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      tax: {
        type: Number,
        required: true,
      },
    },
  ],
  totalBill: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create the models
const Product = mongoose.model('Product', productSchema);
const Service = mongoose.model('Service', serviceSchema);
const Order = mongoose.model('Order', orderSchema);

// Sample data for products and services
const products = [
  { name: 'Product A', price: 1300 },
  { name: 'Product B', price: 5700 },
  { name: 'Product C', price: 850 },
];

const services = [
  { name: 'Service A', price: 1800 },
  { name: 'Service B', price: 8650 },
  { name: 'Service C', price: 550 },
];

// Function to insert sample products and services
async function insertSampleData() {
  try {
    const productCount = await Product.countDocuments();
    const serviceCount = await Service.countDocuments();

    if (productCount === 0) {
      await Product.insertMany(products);
      console.log('Sample products data inserted successfully');
    } else {
      console.log('Products already exist in the database');
    }

    if (serviceCount === 0) {
      await Service.insertMany(services);
      console.log('Sample services data inserted successfully');
    } else {
      console.log('Services already exist in the database');
    }
  } catch (error) {
    console.error('Failed to insert data:', error);
  }
}

// Start the server
function startServer() {
  // Insert sample data
  insertSampleData();

// Create an account (not using MongoDB)
app.post('/account', (req, res) => {
  const { username } = req.body;
  // Add your account creation logic here
  res.status(200).json({ message: `Account created successfully for ${username}` });
});

// Fetch all products and services from the database
// Fetch all products from the database
app.get('/products', async (req, res) => {
  try {
    // Fetch products using a promise
    const products = await Product.find().exec();

    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});
// Fetch all services from the database
app.get('/services', async (req, res) => {
  try {
    // Fetch services using a promise
    const services = await Service.find().exec();

    res.status(200).json({ services });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});
  // Initialize the cart and total bill
  let cart = [];
  let totalBill = 0;

  // Add a product or service to the cart
  app.post('/cart/add', async (req, res) => {
    const { type, id } = req.body;
    let itemModel;

    if (type === 'product') {
      itemModel = Product;
    } else if (type === 'service') {
      itemModel = Service;
    }

    if (itemModel) {
      try {
        const item = await itemModel.findById(id).exec();

        if (!item) {
          res.status(404).json({ error: 'Item not found' });
        } else {
          let tax;
          cart.push(item);
          if (item instanceof Product) {
            if (item.price > 1000 && item.price <= 5000) {
              tax = item.price * 0.12; // Apply Tax PA
            } else if (item.price > 5000) {
              tax = item.price * 0.18; // Apply Tax PB
            } else {
              tax = 200; // Apply Tax PC
            }
          } else if (item instanceof Service) {
            if (item.price > 1000 && item.price <= 8000) {
              tax = item.price * 0.10; // Apply Tax SA
            } else if (item.price > 8000) {
              tax = item.price * 0.15; // Apply Tax SB
            } else {
              tax = 100; // Apply Tax SC
            }
          }
          totalBill += item.price+tax;
          res.status(200).json({ message: 'Item added to the cart successfully' });
        }
      } catch (error) {
        console.error('Failed to add item to the cart:', error);
        res.status(500).json({ error: 'Failed to add item to the cart' });
      }
    } else {
      res.status(400).json({ error: 'Invalid item type' });
    }
  });

  // Remove a product or service from the cart
  app.delete('/cart/remove', (req, res) => {
    const { type, id } = req.body;
    let index;

    if (type === 'product') {
      index = cart.findIndex((item) => item.id === id && item instanceof Product);
    } else if (type === 'service') {
      index = cart.findIndex((item) => item.id === id && item instanceof Service);
    }

    if (index !== -1) {
      let tax;
      const removedItem = cart.splice(index, 1)[0];
      if (removedItem instanceof Product) {
        if (removedItem.price > 1000 && removedItem.price <= 5000) {
          tax = removedItem.price * 0.12; // Apply Tax PA
        } else if (removedItem.price > 5000) {
          tax = removedItem.price * 0.18; // Apply Tax PB
        } else {
          tax = 200; // Apply Tax PC
        }
      } else if (removedItem instanceof Service) {
        if (removedItem.price > 1000 && removedItem.price <= 8000) {
          tax = removedItem.price * 0.10; // Apply Tax SA
        } else if (removedItem.price > 8000) {
          tax = removedItem.price * 0.15; // Apply Tax SB
        } else {
          tax = 100; // Apply Tax SC
        }
      }
      totalBill -= removedItem.price+tax;
      res.status(200).json({ message: 'Item removed from the cart successfully' });
    } else {
      res.status(404).json({ error: 'Item not found in the cart' });
    }
  });

  // Clear the cart
  app.delete('/cart/clear', (req, res) => {
    cart = [];
    totalBill = 0;
    res.status(200).json({ message: 'Cart cleared successfully' });
  });

  // View the total bill
  app.get('/cart/total', (req, res) => {
    const billDetails = cart.map((item) => {
      let tax;
      if (item instanceof Product) {
        if (item.price > 1000 && item.price <= 5000) {
          tax = item.price * 0.12; // Apply Tax PA
        } else if (item.price > 5000) {
          tax = item.price * 0.18; // Apply Tax PB
        } else {
          tax = 200; // Apply Tax PC
        }
      } else if (item instanceof Service) {
        if (item.price > 1000 && item.price <= 8000) {
          tax = item.price * 0.10; // Apply Tax SA
        } else if (item.price > 8000) {
          tax = item.price * 0.15; // Apply Tax SB
        } else {
          tax = 100; // Apply Tax SC
        }
      }
      // totalBill+= tax; // Add item price and tax to the total bill
      return {
        name: item.name,
        price: item.price,
        quantity: 1,
        tax,
      };
    });

    res.status(200).json({ items: billDetails, totalBill });
  });

  // Fetch all orders from the database (admin only)
  app.get('/orders', async (req, res) => {
    try {
      const orders = await Order.find({});
      res.status(200).json({ orders });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Start listening
  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
}
