const fetch = require('node-fetch');

async function testPromotionDetails() {
  try {
    // Get a promotion ID first
    console.log('Fetching active promotions...');
    const activeResponse = await fetch('http://localhost:5000/api/v1/promotions/active');
    const activeData = await activeResponse.json();
    
    if (activeData.success && activeData.data.length > 0) {
      const promotionId = activeData.data[0].id;
      console.log('Testing promotion details for ID:', promotionId);
      
      const detailsResponse = await fetch(`http://localhost:5000/api/v1/promotions/details/${promotionId}`);
      const detailsData = await detailsResponse.json();
      
      console.log('\nResponse Status:', detailsResponse.status);
      console.log('Success:', detailsData.success);
      console.log('Message:', detailsData.message);
      
      if (detailsData.success) {
        console.log('\nPromotion Details:');
        console.log('Title:', detailsData.data.title);
        console.log('Discount:', detailsData.data.discountValue, detailsData.data.discountType);
        console.log('Services Count:', detailsData.data.serviceListings.length);
        console.log('Vendor:', detailsData.data.vendor.businessName);
        
        console.log('\nServices:');
        detailsData.data.serviceListings.forEach((service, index) => {
          console.log(`${index + 1}. ${service.title}`);
          console.log(`   Services with discount: ${service.servicesWithDiscount.length}`);
          if (service.servicesWithDiscount.length > 0) {
            const firstService = service.servicesWithDiscount[0];
            console.log(`   Price: ₹${firstService.originalPrice} → ₹${firstService.discountedPrice}`);
            console.log(`   Savings: ₹${firstService.savings}`);
          }
        });
      }
    } else {
      console.log('No active promotions found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPromotionDetails();
