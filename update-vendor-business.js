const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateVendorBusiness() {
  try {
    // First find the vendor by user email
    const vendor = await prisma.vendor.findFirst({
      where: {
        user: {
          email: 'vendor@example.com'
        }
      }
    });
    
    if (!vendor) {
      console.log('Vendor not found');
      return;
    }
    
    // Update vendor@example.com business name
    const updatedVendor = await prisma.vendor.update({
      where: {
        id: vendor.id
      },
      data: {
        businessName: 'Tech Solutions Pro'
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    console.log('Updated vendor:');
    console.log('- Email:', updatedVendor.user.email);
    console.log('  Name:', updatedVendor.user.name);
    console.log('  Business Name:', updatedVendor.businessName);
    console.log('---');
    
    // Also update the other vendors for variety
    const vendor2 = await prisma.vendor.findFirst({
      where: {
        user: {
          email: 'vendor2@example.com'
        }
      }
    });
    
    if (vendor2) {
      const updatedVendor2 = await prisma.vendor.update({
        where: {
          id: vendor2.id
        },
      data: {
        businessName: 'Home Services Plus'
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    console.log('Updated vendor2:');
    console.log('- Email:', updatedVendor2.user.email);
    console.log('  Name:', updatedVendor2.user.name);
    console.log('  Business Name:', updatedVendor2.businessName);
    console.log('---');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateVendorBusiness();
