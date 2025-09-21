const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSampleServices() {
  try {
    // First, get a vendor and category
    const vendor = await prisma.vendor.findFirst({
      include: { user: true }
    });
    
    const category = await prisma.category.findFirst();
    
    if (!vendor || !category) {
      console.log('No vendor or category found. Please create them first.');
      return;
    }

    // Get a business address
    const address = await prisma.businessAddress.findFirst({
      where: { vendorId: vendor.id }
    });

    if (!address) {
      console.log('No business address found for vendor. Please create one first.');
      return;
    }

    const sampleServices = [
      {
        title: "AC Servicing & Repair",
        description: "Professional AC servicing, repair, and maintenance services. We provide comprehensive air conditioning solutions for homes and offices.",
        categoryId: category.id,
        categoryPath: [category.name],
        contactNumber: "9876543210",
        whatsappNumber: "9876543210",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
        addressId: address.id,
        status: "ACTIVE",
        isServiceOn: true,
        isFeatured: true,
        services: [
          {
            name: "AC General Service",
            description: "Complete AC cleaning and maintenance",
            price: 500
          },
          {
            name: "AC Repair",
            description: "AC repair and troubleshooting",
            price: 800
          }
        ]
      },
      {
        title: "Salon at Home",
        description: "Professional beauty services at your doorstep. Haircut, styling, makeup, and other beauty treatments in the comfort of your home.",
        categoryId: category.id,
        categoryPath: [category.name],
        contactNumber: "9876543211",
        whatsappNumber: "9876543211",
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
        addressId: address.id,
        status: "ACTIVE",
        isServiceOn: true,
        isFeatured: true,
        services: [
          {
            name: "Haircut & Styling",
            description: "Professional haircut and styling",
            price: 300
          },
          {
            name: "Makeup Service",
            description: "Bridal and party makeup",
            price: 1500
          }
        ]
      },
      {
        title: "Home Cleaning",
        description: "Complete home cleaning services including deep cleaning, regular maintenance, and specialized cleaning for different areas.",
        categoryId: category.id,
        categoryPath: [category.name],
        contactNumber: "9876543212",
        whatsappNumber: "9876543212",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
        addressId: address.id,
        status: "ACTIVE",
        isServiceOn: true,
        isFeatured: true,
        services: [
          {
            name: "Regular Cleaning",
            description: "Weekly or monthly cleaning service",
            price: 800
          },
          {
            name: "Deep Cleaning",
            description: "Complete deep cleaning of entire home",
            price: 2000
          }
        ]
      },
      {
        title: "Plumbing Services",
        description: "Expert plumbing services for all your home and office needs. Leak repairs, pipe installation, and emergency plumbing services.",
        categoryId: category.id,
        categoryPath: [category.name],
        contactNumber: "9876543213",
        whatsappNumber: "9876543213",
        image: "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?w=400&h=300&fit=crop",
        addressId: address.id,
        status: "ACTIVE",
        isServiceOn: true,
        isFeatured: true,
        services: [
          {
            name: "Leak Repair",
            description: "Fix water leaks and pipe issues",
            price: 400
          },
          {
            name: "Pipe Installation",
            description: "New pipe installation and replacement",
            price: 600
          }
        ]
      },
      {
        title: "Personal Trainer",
        description: "Certified personal trainer for fitness coaching, weight loss, muscle building, and overall health improvement.",
        categoryId: category.id,
        categoryPath: [category.name],
        contactNumber: "9876543214",
        whatsappNumber: "9876543214",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        addressId: address.id,
        status: "ACTIVE",
        isServiceOn: true,
        isFeatured: true,
        services: [
          {
            name: "Personal Training Session",
            description: "One-on-one fitness training",
            price: 1000
          },
          {
            name: "Group Training",
            description: "Group fitness sessions",
            price: 500
          }
        ]
      }
    ];

    console.log('Adding sample services...');
    
    for (const serviceData of sampleServices) {
      const { services, ...listingData } = serviceData;
      
      // Create service listing
      const serviceListing = await prisma.serviceListing.create({
        data: {
          ...listingData,
          vendorId: vendor.id,
        }
      });

      // Create individual services
      for (const service of services) {
        await prisma.service.create({
          data: {
            ...service,
            listingId: serviceListing.id,
          }
        });
      }

      console.log(`✅ Created service: ${serviceListing.title}`);
    }

    console.log('🎉 Sample services added successfully!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error adding sample services:', error);
    await prisma.$disconnect();
  }
}

addSampleServices();
