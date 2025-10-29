import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";
import {
  validateGetUserSavedLists,
  validateCreateSavedList,
  validateGetSavedListById,
  validateUpdateSavedList,
  validateDeleteSavedList,
  validateAddServiceToList,
  validateRemoveServiceFromList,
  validateCheckServiceListStatus,
  validateBulkAddToList,
  validateReorderListItems,
  validateUpdateListItem,
} from "../validators/savedListsValidators";
import {
  getUserSavedLists,
  createSavedList,
  getSavedListById,
  updateSavedList,
  deleteSavedList,
  addServiceToList,
  removeServiceFromList,
  checkServiceListStatus,
  getUserSavedListsWithServiceStatus,
  checkServiceSavedStatus,
} from "../controllers/savedListsController";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     SavedList:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the saved list
 *         userId:
 *           type: string
 *           description: ID of the user who owns this list
 *         name:
 *           type: string
 *           description: Name of the saved list
 *         description:
 *           type: string
 *           description: Optional description of the list
 *         color:
 *           type: string
 *           description: Hex color code for the list
 *         icon:
 *           type: string
 *           description: Icon name for the list
 *         isPublic:
 *           type: boolean
 *           description: Whether the list is public
 *         isDefault:
 *           type: boolean
 *           description: Whether this is the default favorites list
 *         sortOrder:
 *           type: integer
 *           description: Order of the list
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         itemCount:
 *           type: integer
 *           description: Number of services in this list
 *
 *     SavedListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the list item
 *         savedListId:
 *           type: string
 *           description: ID of the saved list
 *         serviceListingId:
 *           type: string
 *           description: ID of the service listing
 *         addedAt:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *           description: User's personal notes for this service
 *         sortOrder:
 *           type: integer
 *           description: Order within the list
 *         serviceListing:
 *           $ref: '#/components/schemas/ServiceListing'
 */

/**
 * @swagger
 * /api/v1/users/{userId}/saved-lists:
 *   get:
 *     summary: Get all user's saved lists
 *     tags: [Saved Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: includeItems
 *         schema:
 *           type: boolean
 *         description: Whether to include list items
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of lists to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Saved lists retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SavedList'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:userId/saved-lists",
  validateGetUserSavedLists,
  validateRequest,
  getUserSavedLists
);

/**
 * @swagger
 * /api/v1/users/{userId}/saved-lists:
 *   post:
 *     summary: Create a new saved list
 *     tags: [Saved Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Name of the saved list
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional description
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 description: Hex color code
 *               icon:
 *                 type: string
 *                 maxLength: 50
 *                 description: Icon name
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the list is public
 *     responses:
 *       201:
 *         description: Saved list created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SavedList'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       409:
 *         description: List name already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:userId/saved-lists",
  validateCreateSavedList,
  validateRequest,
  createSavedList
);

/**
 * @swagger
 * /api/v1/users/{userId}/saved-lists/{listId}:
 *   get:
 *     summary: Get a specific saved list with its items
 *     tags: [Saved Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: List ID
 *     responses:
 *       200:
 *         description: Saved list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/SavedList'
 *                     - type: object
 *                       properties:
 *                         items:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/SavedListItem'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Saved list not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:userId/saved-lists/:listId",
  validateGetSavedListById,
  validateRequest,
  getSavedListById
);

/**
 * @swagger
 * /api/v1/users/{userId}/saved-lists/{listId}:
 *   put:
 *     summary: Update a saved list
 *     tags: [Saved Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: List ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Name of the saved list
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional description
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 description: Hex color code
 *               icon:
 *                 type: string
 *                 maxLength: 50
 *                 description: Icon name
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the list is public
 *               sortOrder:
 *                 type: integer
 *                 minimum: 0
 *                 description: Order of the list
 *     responses:
 *       200:
 *         description: Saved list updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SavedList'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Saved list not found
 *       409:
 *         description: List name already exists
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:userId/saved-lists/:listId",
  validateUpdateSavedList,
  validateRequest,
  updateSavedList
);

/**
 * @swagger
 * /api/v1/users/{userId}/saved-lists/{listId}:
 *   delete:
 *     summary: Delete a saved list
 *     tags: [Saved Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: List ID
 *     responses:
 *       200:
 *         description: Saved list deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     listId:
 *                       type: string
 *                     listName:
 *                       type: string
 *                     deletedItemsCount:
 *                       type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or cannot delete default list
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Saved list not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:userId/saved-lists/:listId",
  validateDeleteSavedList,
  validateRequest,
  deleteSavedList
);

/**
 * @swagger
 * /api/v1/users/{userId}/saved-lists/{listId}/items:
 *   post:
 *     summary: Add a service to a saved list
 *     tags: [Saved Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: List ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceListingId
 *             properties:
 *               serviceListingId:
 *                 type: string
 *                 description: ID of the service listing to add
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Optional personal notes
 *     responses:
 *       201:
 *         description: Service added to list successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SavedListItem'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or inactive service
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Saved list or service not found
 *       409:
 *         description: Service already exists in list
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:userId/saved-lists/:listId/items",
  validateAddServiceToList,
  validateRequest,
  addServiceToList
);

/**
 * @swagger
 * /api/v1/users/{userId}/saved-lists/{listId}/items/{itemId}:
 *   delete:
 *     summary: Remove a service from a saved list
 *     tags: [Saved Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *         description: List ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Service removed from list successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     serviceListingId:
 *                       type: string
 *                     serviceTitle:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service not found in list
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:userId/saved-lists/:listId/items/:itemId",
  validateRemoveServiceFromList,
  validateRequest,
  removeServiceFromList
);

/**
 * @swagger
 * /api/v1/users/{userId}/saved-lists/status/{serviceId}:
 *   get:
 *     summary: Check which lists contain a specific service
 *     tags: [Saved Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service list status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     serviceId:
 *                       type: string
 *                     isInAnyList:
 *                       type: boolean
 *                     lists:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           listId:
 *                             type: string
 *                           listName:
 *                             type: string
 *                           isDefault:
 *                             type: boolean
 *                           addedAt:
 *                             type: string
 *                             format: date-time
 *                           notes:
 *                             type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:userId/saved-lists/status/:serviceId",
  validateCheckServiceListStatus,
  validateRequest,
  checkServiceListStatus
);

/**
 * @swagger
 * /api/v1/users/{userId}/saved-lists/with-service-status/{serviceId}:
 *   get:
 *     summary: Get user's saved lists with service status
 *     tags: [Saved Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of lists to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Saved lists with service status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/SavedList'
 *                       - type: object
 *                         properties:
 *                           hasService:
 *                             type: boolean
 *                             description: Whether this service is in the list
 *                           serviceAddedAt:
 *                             type: string
 *                             format: date-time
 *                             description: When the service was added to this list
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:userId/saved-lists/with-service-status/:serviceId",
  validateGetUserSavedLists,
  validateRequest,
  getUserSavedListsWithServiceStatus
);

// Check if a service is saved by a user (simple boolean check)
router.get(
  "/:userId/services/:serviceId/saved-status",
  validateCheckServiceListStatus,
  validateRequest,
  checkServiceSavedStatus
);

export default router;
