// Use require statement
const { MongoClient } = require("mongodb");
// Import dotenv to load environment variables
require("dotenv").config();

const seedDatabase = async () => {
  // Initial FAQs data for Rabhas Enterprises Pharmacy
  const initialFaqs = [
    {
      question: "Do you offer custom tailoring or stitching services?",
      answer:
        "Yes, we offer custom stitching for select outfits. You can choose 'Stitching Required' while placing the order and submit your measurements online.",
      category: "Custom Orders",
    },
    {
      question: "How can I track my Banna Banni order?",
      answer:
        "You can track your order using the tracking link sent via SMS and email, or by visiting the 'My Orders' section in your account.",
      category: "Orders",
    },
    {
      question: "What is your return and exchange policy?",
      answer:
        "We offer a 7-day return or exchange on eligible products. Items must be unused, with tags intact. Customized products are not returnable.",
      category: "Returns",
    },
    {
      question: "Do you provide international shipping?",
      answer:
        "Yes, we ship internationally. Shipping charges and delivery timelines vary based on destination and will be shown at checkout.",
      category: "Delivery",
    },
    {
      question: "Can I get the product in a different size or color?",
      answer:
        "Product availability depends on stock. If a variant is available, you’ll see the options on the product page. For restock updates, click 'Notify Me'.",
      category: "Products",
    },
    {
      question: "What payment methods are supported?",
      answer:
        "We accept UPI, debit/credit cards, net banking, wallets (PhonePe, Paytm), and cash on delivery in select locations.",
      category: "Payment",
    },
    {
      question: "Do you offer gift packaging or messages?",
      answer:
        "Yes! You can select 'Gift Wrap' during checkout and add a custom message. Charges may apply based on your selection.",
      category: "Gifting",
    },
    {
      question: "Can I cancel or modify my order after placing it?",
      answer:
        "Orders can be modified or canceled within 1 hour of placement from 'My Orders'. Beyond that, we begin processing and may not allow changes.",
      category: "Orders",
    },
    {
      question: "Is my personal and payment data secure?",
      answer:
        "Absolutely. We use SSL encryption and comply with industry standards to ensure your personal and financial data is safe.",
      category: "Privacy",
    },
    {
      question: "Do you offer discounts or coupons?",
      answer:
        "Yes, we regularly run promotions and coupon codes. Subscribe to our newsletter or follow us on social media to stay updated.",
      category: "Offers",
    },
    {
      question: "How do I care for my Banna Banni outfit?",
      answer:
        "Each product includes care instructions on the tag or product page. Most items are dry-clean recommended unless mentioned otherwise.",
      category: "Product Care",
    },
    {
      question: "Can I schedule delivery for a specific date?",
      answer:
        "Yes, scheduled delivery is available for prepaid orders in major cities. Choose a delivery slot during checkout, if applicable.",
      category: "Delivery",
    },
  ];

  // Get MongoDB connection string from environment variable
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI environment variable is not set");
    process.exit(1);
  }

  // Connect to MongoDB
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db(); // Use default database from URI
    const faqs = database.collection("faqs");

    // Check if collection is empty
    const count = await faqs.countDocuments();
    if (count === 0) {
      const result = await faqs.insertMany(initialFaqs);
      console.log(`${result.insertedCount} FAQs were inserted`);
    } else {
      console.log(
        `FAQs collection already has ${count} documents. Skipping seed.`
      );
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
};

// Run the seed function
seedDatabase().catch(console.error);
