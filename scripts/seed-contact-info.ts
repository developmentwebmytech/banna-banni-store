import { MongoClient } from "mongodb"

const seedDatabase = async () => {
  // Initial contact information data
  const initialContactInfo = [
    {
      type: "address",
      title: "Visit Us",
      content: {
        line1: "123 Banna Banni Store, Suite 100",
        line2: "Gwalior",
        line3: "India",
        mapUrl: "https://maps.google.com",
      },
      icon: "MapPin",
      order: 1,
    },
    {
      type: "phone",
      title: "Call Us",
      content: {
        "Customer Service": "+91 123 456 7890",
        "Order Support": "+91 123 456 7891",
      },
      icon: "Phone",
      order: 2,
    },
    {
      type: "email",
      title: "Email Us",
      content: {
        "General Inquiries": "info@yourbannabannistore.com",
        "Customer Support": "support@yourbannabannistore.com",
      },
      icon: "Mail",
      order: 3,
    },
    {
      type: "hours",
      title: "Business Hours",
      content: {
        "Monday - Friday": "10:00 AM - 7:00 PM",
        Saturday: "11:00 AM - 6:00 PM",
        Sunday: "Closed",
      },
      icon: "Clock",
      order: 4,
    },
  ]

  // Get MongoDB connection string from environment variable
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI environment variable is not set")
    process.exit(1)
  }

  // Connect to MongoDB
  const client = new MongoClient(uri)
  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const database = client.db() // Use the default database specified in the URI
    const contactInfo = database.collection("contactinfos")

    // Check if collection is empty
    const count = await contactInfo.countDocuments()
    if (count === 0) {
      // Insert initial contact info
      const result = await contactInfo.insertMany(initialContactInfo)
      console.log(`${result.insertedCount} contact info records were inserted`)
    } else {
      console.log(`ContactInfo collection already has ${count} documents. Skipping seed.`)
    }
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
    console.log("Disconnected from MongoDB")
  }
}

// Run the seed function
seedDatabase().catch(console.error)
