import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  // Admin user
  await prisma.user.create({
    data: {
      email: "admin@apocoffee.com",
      password: adminPassword,
      name: "Admin User",
      role: "admin",
    },
  });

  // Customer user
  await prisma.user.create({
    data: {
      email: "customer@apocoffee.com",
      password: customerPassword,
      name: "John Doe",
      role: "customer",
    },
  });

  // Sample products with proper fields
  const baseImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%238B4513'/%3E%3C/svg%3E";

  await prisma.product.create({
    data: {
      name: "Mt. Apo Arabica (250g)",
      description:
        "Premium 100% Arabica from Mount Apo. Medium Roast. High Altitude: 1,200-1,700 MASL.",
      price: 399.0,
      roastLevel: "medium",
      grind: "whole",
      size: "250g",
      image: baseImage,
      stock: 50,
    },
  });

  await prisma.product.create({
    data: {
      name: "Mt. Apo Arabica (500g)",
      description:
        "Premium 100% Arabica from Mount Apo. Medium Roast. High Altitude: 1,200-1,700 MASL.",
      price: 689.0,
      roastLevel: "medium",
      grind: "whole",
      size: "500g",
      image: baseImage,
      stock: 30,
    },
  });

  await prisma.product.create({
    data: {
      name: "Mt. Apo Arabica (1kg)",
      description:
        "Premium 100% Arabica from Mount Apo. Medium Roast. High Altitude: 1,200-1,700 MASL.",
      price: 1399.0,
      roastLevel: "medium",
      grind: "whole",
      size: "1kg",
      image: baseImage,
      stock: 20,
    },
  });

  await prisma.product.create({
    data: {
      name: "Mt. Apo Dark Roast (250g)",
      description:
        "Bold and rich dark roast from Mount Apo. Perfect for espresso lovers.",
      price: 449.0,
      roastLevel: "dark",
      grind: "ground",
      size: "250g",
      image: baseImage,
      stock: 35,
    },
  });

  await prisma.product.create({
    data: {
      name: "Mt. Apo Light Roast (250g)",
      description:
        "Bright and fruity light roast from Mount Apo. Great for filter brewing.",
      price: 379.0,
      roastLevel: "light",
      grind: "whole",
      size: "250g",
      image: baseImage,
      stock: 45,
    },
  });

  await prisma.product.create({
    data: {
      name: "Mt. Apo Specialty Blend (500g)",
      description:
        "A unique blend of Mt. Apo Arabica with hints of chocolate and caramel.",
      price: 799.0,
      roastLevel: "medium",
      grind: "ground",
      size: "500g",
      image: baseImage,
      stock: 25,
    },
  });

  console.log("✅ Products and users seeded!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
