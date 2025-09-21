const http = require("http");

// Test if the server is running
const testServer = () => {
  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/v1/health",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const req = http.request(options, (res) => {
    console.log("✅ Backend server is running!");
    console.log("Status:", res.statusCode);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("Response:", data);

      // Test app reviews endpoint
      testAppReviews();
    });
  });

  req.on("error", (err) => {
    console.log("❌ Backend server is not running");
    console.log("Error:", err.message);
    console.log("\nTo start the server, run: npm run dev");
  });

  req.end();
};

const testAppReviews = () => {
  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/v1/app-reviews?limit=5&status=APPROVED&isPublic=true",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const req = http.request(options, (res) => {
    console.log("\n🧪 Testing App Reviews API...");
    console.log("Status:", res.statusCode);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const response = JSON.parse(data);
        if (response.success) {
          console.log("✅ App Reviews API is working!");
          console.log("📊 Total reviews:", response.data.pagination.total);
          console.log(
            "⭐ Average rating:",
            response.data.statistics.averageRating
          );
          console.log("📝 Reviews found:", response.data.reviews.length);
        } else {
          console.log("❌ API returned error:", response.message);
        }
      } catch (err) {
        console.log("❌ Failed to parse response:", data);
      }
    });
  });

  req.on("error", (err) => {
    console.log("❌ App Reviews API test failed:", err.message);
  });

  req.end();
};

console.log("🔍 Testing backend server connection...");
testServer();
