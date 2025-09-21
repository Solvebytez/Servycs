const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVendors() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    console.log('Vendors in database:');
    vendors.forEach(vendor => {
      console.log('- Email:', vendor.user.email);
      console.log('  Name:', vendor.user.name);
      console.log('  Business Name:', vendor.businessName);
      console.log('  Business Type:', vendor.businessType);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVendors();
