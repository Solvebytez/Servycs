import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Listro API',
      version: '1.0.0',
      description: 'A comprehensive service marketplace API with user management, vendor services, bookings, and admin functionality.',
      contact: {
        name: 'Listro Team',
        email: 'support@listro.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:5000`,
        description: 'Development server'
      },
      {
        url: 'https://api.listro.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT access token'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'Refresh token stored in HTTP-only cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            phone: {
              type: 'string',
              description: 'User phone number'
            },
            avatar: {
              type: 'string',
              format: 'uri',
              description: 'User avatar URL'
            },
            role: {
              type: 'string',
              enum: ['USER', 'VENDOR', 'SALESMAN', 'ADMIN'],
              description: 'User role'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'VERIFIED'],
              description: 'User account status'
            },
            provider: {
              type: 'string',
              enum: ['LOCAL', 'GOOGLE'],
              description: 'Authentication provider'
            },
            providerId: {
              type: 'string',
              description: 'Provider-specific user ID'
            },
            isEmailVerified: {
              type: 'boolean',
              description: 'Email verification status'
            },
            isPhoneVerified: {
              type: 'boolean',
              description: 'Phone verification status'
            },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Vendor: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique vendor identifier'
            },
            userId: {
              type: 'string',
              description: 'Associated user ID'
            },
            businessName: {
              type: 'string',
              description: 'Business name'
            },
            businessEmail: {
              type: 'string',
              format: 'email',
              description: 'Business email'
            },
            businessPhone: {
              type: 'string',
              description: 'Business phone number'
            },
            businessAddress: {
              type: 'string',
              description: 'Business address'
            },
            businessCity: {
              type: 'string',
              description: 'Business city'
            },
            businessState: {
              type: 'string',
              description: 'Business state'
            },
            businessCountry: {
              type: 'string',
              description: 'Business country'
            },
            businessDescription: {
              type: 'string',
              description: 'Business description'
            },
            categories: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'HEALTH_CARE', 'FITNESS', 'TRAVEL', 'LOANS', 'DOCTORS', 'BEAUTY',
                  'GYMS', 'REPAIRS_SERVICES', 'RETAIL', 'PROFESSIONAL_SERVICES',
                  'RESTAURANTS', 'HOTEL_SERVICE', 'TECH_SERVICE', 'CAFE_SNACKS',
                  'WEAR_ACC', 'CAR_SERVICE', 'SPA_CENTER'
                ]
              },
              description: 'Service categories'
            },
            isVerified: {
              type: 'boolean',
              description: 'Vendor verification status'
            },
            rating: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 5,
              description: 'Average rating'
            },
            totalReviews: {
              type: 'integer',
              description: 'Total number of reviews'
            },
            totalRevenue: {
              type: 'number',
              format: 'float',
              description: 'Total revenue earned'
            }
          }
        },
        Service: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique service identifier'
            },
            vendorId: {
              type: 'string',
              description: 'Vendor ID who provides this service'
            },
            title: {
              type: 'string',
              description: 'Service title'
            },
            description: {
              type: 'string',
              description: 'Service description'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Service price'
            },
            discountPrice: {
              type: 'number',
              format: 'float',
              description: 'Discounted price'
            },
            category: {
              type: 'string',
              enum: [
                'HEALTH_CARE', 'FITNESS', 'TRAVEL', 'LOANS', 'DOCTORS', 'BEAUTY',
                'GYMS', 'REPAIRS_SERVICES', 'RETAIL', 'PROFESSIONAL_SERVICES',
                'RESTAURANTS', 'HOTEL_SERVICE', 'TECH_SERVICE', 'CAFE_SNACKS',
                'WEAR_ACC', 'CAR_SERVICE', 'SPA_CENTER'
              ],
              description: 'Service category'
            },
            duration: {
              type: 'integer',
              description: 'Service duration in minutes'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Service tags'
            },
            isActive: {
              type: 'boolean',
              description: 'Service availability status'
            },
            isFeatured: {
              type: 'boolean',
              description: 'Featured service status'
            },
            views: {
              type: 'integer',
              description: 'Number of views'
            },
            rating: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 5,
              description: 'Average rating'
            },
            totalReviews: {
              type: 'integer',
              description: 'Total number of reviews'
            }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique booking identifier'
            },
            userId: {
              type: 'string',
              description: 'User who made the booking'
            },
            serviceId: {
              type: 'string',
              description: 'Service being booked'
            },
            vendorId: {
              type: 'string',
              description: 'Vendor providing the service'
            },
            scheduledAt: {
              type: 'string',
              format: 'date-time',
              description: 'Scheduled appointment time'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
              description: 'Booking status'
            },
            notes: {
              type: 'string',
              description: 'Additional notes'
            },
            cancellationReason: {
              type: 'string',
              description: 'Reason for cancellation'
            },
            totalAmount: {
              type: 'number',
              format: 'float',
              description: 'Total booking amount'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Validation errors'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/routes/rootAuth.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
