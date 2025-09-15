import { Router } from "express";
import { authenticate } from "@/middleware/auth";
import { validateRequest } from "@/middleware/validateRequest";
import {
  getRootCategories,
  getCategoryChildren,
  checkCategoryHasChildren,
  getCategoryById,
  getAllCategoriesFlat,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/controllers/categoryController";
import {
  createCategoryValidation,
  updateCategoryValidation,
  getCategoryByIdValidation,
  getCategoryChildrenValidation,
  checkCategoryHasChildrenValidation,
  deleteCategoryValidation,
  getCategoryTreeValidation,
} from "@/validators/categoryValidators";

const router = Router();

// Public routes (no authentication required)
router.get("/primary", getRootCategories);
router.get("/tree", getAllCategoriesFlat);
router.get(
  "/:id/children",
  getCategoryChildrenValidation,
  validateRequest,
  getCategoryChildren
);
router.get(
  "/:id/has-children",
  checkCategoryHasChildrenValidation,
  validateRequest,
  checkCategoryHasChildren
);
router.get("/:id", getCategoryByIdValidation, validateRequest, getCategoryById);

// Admin-only routes (require authentication and admin role)
router.use(authenticate); // All routes below require authentication

// Admin category management routes
router.get(
  "/admin/tree",
  getCategoryTreeValidation,
  validateRequest,
  getCategoryTree
);
router.post(
  "/admin",
  createCategoryValidation,
  validateRequest,
  createCategory
);
router.put(
  "/admin/:id",
  updateCategoryValidation,
  validateRequest,
  updateCategory
);
router.delete(
  "/admin/:id",
  deleteCategoryValidation,
  validateRequest,
  deleteCategory
);

export default router;
