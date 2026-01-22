/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create sample products
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Mt. Apo Arabica 250g",
        description:
          "100% Premium Arabica beans from Mt. Apo. Medium roast with a smooth, balanced flavor profile. Perfect for daily brewing.",
        price: 399,
        roastLevel: "Medium",
        grind: "Whole Beans",
        size: "250g",
        image:
          "https://images.unsplash.com/photo-1599599810694-b5ac4dd994b5?w=400&h=400&fit=crop",
        stock: 50,
      },
      {
        name: "Mt. Apo Arabica 500g",
        description:
          "100% Premium Arabica beans from Mt. Apo. Medium roast with a smooth, balanced flavor profile. Perfect for coffee enthusiasts.",
        price: 689,
        roastLevel: "Medium",
        grind: "Ground",
        size: "500g",
        image:
          "https://images.unsplash.com/photo-1599599810694-b5ac4dd994b5?w=400&h=400&fit=crop",
        stock: 45,
      },
      {
        name: "Mt. Apo Arabica 1kg",
        description:
          "100% Premium Arabica beans from Mt. Apo. Medium roast with a smooth, balanced flavor profile. Bulk option for regular customers.",
        price: 1399,
        roastLevel: "Medium",
        grind: "Whole Beans",
        size: "1kg",
        image:
          "https://images.unsplash.com/photo-1599599810694-b5ac4dd994b5?w=400&h=400&fit=crop",
        stock: 30,
      },
      {
        name: "Mt. Apo Dark Roast 250g",
        description:
          "100% Premium Arabica with a bold, rich dark roast. Deep flavor notes with lower acidity. For espresso lovers.",
        price: 399,
        roastLevel: "Dark",
        grind: "Espresso",
        size: "250g",
        image:
          "https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=400&h=400&fit=crop",
        stock: 35,
      },
      {
        name: "Mt. Apo Light Roast 250g",
        description:
          "100% Premium Arabica with a light roast. Bright, acidic notes with complex flavors. For pour-over enthusiasts.",
        price: 399,
        roastLevel: "Light",
        grind: "Whole Beans",
        size: "250g",
        image:
          "https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=400&h=400&fit=crop",
        stock: 40,
      },
      {
        name: "Mt. Apo Premium Blend 500g",
        description:
          "Expertly blended Premium Arabica beans. Medium roast with a perfect balance of smoothness and complexity.",
        price: 749,
        roastLevel: "Medium",
        grind: "Ground",
        size: "500g",
        image:
          "https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=400&h=400&fit=crop",
        stock: 25,
      },
    ],
  });

  // Create demo admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      email: "admin@apocoffee.com",
      password: hashedPassword,
      name: "Admin",
      role: "admin",
    },
  });

  // Create demo customer user
  const customerPassword = await bcrypt.hash("customer123", 10);

  await prisma.user.create({
    data: {
      email: "customer@apocoffee.com",
      password: customerPassword,
      name: "Juan Dela Cruz",
      role: "customer",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("Products created:", products.count);
  console.log("\nDemo Accounts:");
  console.log("Admin: admin@apocoffee.com / admin123");
  console.log("Customer: customer@apocoffee.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
