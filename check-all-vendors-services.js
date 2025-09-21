const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllVendorsServices() {
  try {
    // Check all service listings in the database
    const allServices = await prisma.serviceListing.findMany({
      include: {
        vendor: {
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        },
        services: {
          where: {
            status: "ACTIVE",
            isServiceOn: true,
          },
          select: {
            name: true,
            price: true,
            status: true,
            isServiceOn: true
          }
        }
      }
    });

    console.log('ALL Service listings in database:');
    allServices.forEach((service, index) => {
      console.log(`\n--- Service ${index + 1}: ${service.title} ---`);
      console.log(`Vendor Email: ${service.vendor.user.email}`);
      console.log(`Vendor Name: ${service.vendor.user.name}`);
      console.log(`Business Name: ${service.vendor.businessName}`);
      console.log(`Listing Status: ${service.status}`);
      console.log(`Is Service On: ${service.isServiceOn}`);
      console.log(`Active Services Count: ${service.services.length}`);
      
      if (service.services.length > 0) {
        service.services.forEach((svc, svcIndex) => {
          console.log(`  ${svcIndex + 1}. Name: ${svc.name} (Price: ${svc.price})`);
        });
      } else {
        console.log('  ❌ NO ACTIVE SERVICES');
      }
    });

  } catch (error) {
    console.error('Error checking all vendors services:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllVendorsServices();
