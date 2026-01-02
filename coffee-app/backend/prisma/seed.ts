import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  // ============================================================================
  // CLEAR EXISTING DATA
  // ============================================================================

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productCustomization.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // ============================================================================
  // CREATE USERS
  // ============================================================================

  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@coffeeorder.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '1234567890',
      role: Role.ADMIN,
      address: '123 Admin St',
      city: 'New York',
      postalCode: '10001'
    }
  });

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@coffeeorder.com',
      password: hashedPassword,
      name: 'Staff User',
      phone: '0987654321',
      role: Role.STAFF,
      address: '456 Staff Ave',
      city: 'Los Angeles',
      postalCode: '90001'
    }
  });

  const customerUser1 = await prisma.user.create({
    data: {
      email: 'customer1@coffeeorder.com',
      password: hashedPassword,
      name: 'John Doe',
      phone: '5551234567',
      role: Role.CUSTOMER,
      address: '789 Customer Rd',
      city: 'Chicago',
      postalCode: '60601'
    }
  });

  const customerUser2 = await prisma.user.create({
    data: {
      email: 'customer2@coffeeorder.com',
      password: hashedPassword,
      name: 'Jane Smith',
      phone: '5559876543',
      role: Role.CUSTOMER,
      address: '321 Customer Ln',
      city: 'Houston',
      postalCode: '77001'
    }
  });

  console.log('✅ Created 4 test users');

  // ============================================================================
  // CREATE PRODUCTS
  // ============================================================================

  const espresso = await prisma.product.create({
    data: {
      name: 'Espresso',
      description: 'Strong and concentrated coffee',
      price: 2.50,
      category: 'Espresso',
      image: '/images/espresso.jpg',
      isAvailable: true
    }
  });

  const americano = await prisma.product.create({
    data: {
      name: 'Americano',
      description: 'Espresso with hot water',
      price: 3.00,
      category: 'Espresso',
      image: '/images/americano.jpg',
      isAvailable: true
    }
  });

  const cappuccino = await prisma.product.create({
    data: {
      name: 'Cappuccino',
      description: 'Espresso with steamed milk and foam',
      price: 4.00,
      category: 'Milk Coffee',
      image: '/images/cappuccino.jpg',
      isAvailable: true
    }
  });

  const latte = await prisma.product.create({
    data: {
      name: 'Latte',
      description: 'Espresso with steamed milk',
      price: 4.00,
      category: 'Milk Coffee',
      image: '/images/latte.jpg',
      isAvailable: true
    }
  });

  const mocha = await prisma.product.create({
    data: {
      name: 'Mocha',
      description: 'Espresso with chocolate and milk',
      price: 4.50,
      category: 'Specialty',
      image: '/images/mocha.jpg',
      isAvailable: true
    }
  });

  const macchiato = await prisma.product.create({
    data: {
      name: 'Macchiato',
      description: 'Espresso with a dash of milk',
      price: 3.50,
      category: 'Espresso',
      image: '/images/macchiato.jpg',
      isAvailable: true
    }
  });

  console.log('✅ Created 6 test products');

  // ============================================================================
  // CREATE PRODUCT CUSTOMIZATIONS
  // ============================================================================

  await prisma.productCustomization.createMany({
    data: [
      // Size customizations
      { productId: cappuccino.id, type: 'size', name: 'Small (8oz)', priceAdd: 0 },
      { productId: cappuccino.id, type: 'size', name: 'Medium (12oz)', priceAdd: 0.5 },
      { productId: cappuccino.id, type: 'size', name: 'Large (16oz)', priceAdd: 1.0 },
      
      // Milk customizations
      { productId: latte.id, type: 'milk', name: 'Whole Milk', priceAdd: 0 },
      { productId: latte.id, type: 'milk', name: 'Almond Milk', priceAdd: 0.5 },
      { productId: latte.id, type: 'milk', name: 'Oat Milk', priceAdd: 0.5 },
      { productId: latte.id, type: 'milk', name: 'Soy Milk', priceAdd: 0.5 },
      
      // Extra customizations
      { productId: mocha.id, type: 'extra', name: 'Extra Shot', priceAdd: 0.75 },
      { productId: mocha.id, type: 'extra', name: 'Whipped Cream', priceAdd: 0.5 },
      { productId: mocha.id, type: 'extra', name: 'Chocolate Drizzle', priceAdd: 0.5 }
    ]
  });

  console.log('✅ Created product customizations');

  // ============================================================================
  // CREATE SAMPLE ORDERS
  // ============================================================================

  const order1 = await prisma.order.create({
    data: {
      customerId: customerUser1.id,
      status: 'DELIVERED',
      totalPrice: 8.50,
      deliveryAddress: '789 Customer Rd, Chicago, IL 60601',
      items: {
        create: [
          {
            productId: cappuccino.id,
            quantity: 2,
            price: 4.00,
            customizations: 'Size: Large, Milk: Oat Milk'
          },
          {
            productId: espresso.id,
            quantity: 1,
            price: 2.50,
            customizations: 'Size: Small'
          }
        ]
      }
    }
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: customerUser2.id,
      status: 'PENDING',
      totalPrice: 12.00,
      deliveryAddress: '321 Customer Ln, Houston, TX 77001',
      items: {
        create: [
          {
            productId: latte.id,
            quantity: 2,
            price: 4.00,
            customizations: 'Milk: Almond Milk'
          },
          {
            productId: mocha.id,
            quantity: 2,
            price: 4.50,
            customizations: 'Extra: Whipped Cream'
          }
        ]
      }
    }
  });

  console.log('✅ Created sample orders');

  // ============================================================================
  // SUMMARY
  // ============================================================================

  console.log('\n🌱 Database seeded successfully!\n');
  console.log('Test Accounts:');
  console.log('  Admin:    admin@coffeeorder.com / password123');
  console.log('  Staff:    staff@coffeeorder.com / password123');
  console.log('  Customer: customer1@coffeeorder.com / password123');
  console.log('  Customer: customer2@coffeeorder.com / password123');
  console.log('\n✨ Ready to use!\n');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });