import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      email: "customer1@coffeeorder.com",
      password: hashedPassword,
      name: "John Doe",
      phone: "+63 912 345 6789",
      role: "ADMIN",
    },
  });

  await prisma.product.create({
    data: {
      name: "Mt. Apo Arabica (250g)",
      description:
        "Premium 100% Arabica from Mount Apo. Medium Roast. High Altitude: 1,200-1,700 MASL.",
      price: 399.0,
      category: "Arabica Coffee",
      isAvailable: true,
    },
  });

  await prisma.product.create({
    data: {
      name: "Mt. Apo Arabica (500g)",
      description:
        "Premium 100% Arabica from Mount Apo. Medium Roast. High Altitude: 1,200-1,700 MASL.",
      price: 689.0,
      category: "Arabica Coffee",
      isAvailable: true,
    },
  });

  await prisma.product.create({
    data: {
      name: "Mt. Apo Arabica (1kg)",
      description:
        "Premium 100% Arabica from Mount Apo. Medium Roast. High Altitude: 1,200-1,700 MASL.",
      price: 1399.0,
      category: "Arabica Coffee",
      isAvailable: true,
    },
  });

  console.log("✅ Products seeded!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
