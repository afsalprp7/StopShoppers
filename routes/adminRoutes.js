const express = require('express');
const router =express.Router();
const adminController = require('../controller/adminController');
const {categoryStg , productStg} = require('../controller/multerController');
const {validateAdmin} = require('../middleware/authMiddleware');






router.get('/adminProduct',validateAdmin,adminController.getProductPage);
router.get('/addProduct',validateAdmin,adminController.getAddProductPage);
router.post('/addProduct',productStg.array('productPhoto'),adminController.doAddProduct);
router.patch('/deleteProduct/:id',adminController.DeleteProduct);
router.get('/editProduct/:id',validateAdmin,adminController.getEditProductPage);
router.patch('/editProduct/:id',productStg.array('productPhoto'),adminController.doEditProduct);
router.patch('/deleteProductPrevImg/:id',adminController.deleteImageEditProduct);







router.get('/adminCategory',validateAdmin,adminController.getCategoryPage);

router.get('/addCategory',validateAdmin,adminController.getAddCategoryPage);
router.post('/addCategory',categoryStg.single("productPhoto"),adminController.doAddCategoryPage);

router.get('/editCategory/:id',validateAdmin,adminController.getEditCategoryPage);
router.patch('/deleteEditCat/:id',adminController.patchDeleteCatImg);
router.patch('/editCategory/:id',categoryStg.single('productPhoto'),adminController.patchEditCategory);


//delete category
router.patch('/deleteCategory/:id',adminController.deleteCategory);

router.get('/adminUsers',validateAdmin,adminController.getAdminUsersPage);
router.patch('/blockUser/:id',adminController.doBlockUsers);

router.get('/adminOrders',validateAdmin,adminController.getAdminOrders);
router.get('/AdminOrderDetails/:id',validateAdmin,adminController.getAdminOrderDetailpage)

router.patch('/acceptCancel/:id',validateAdmin,adminController.acceptCancelOrder);
router.patch('/declineCancelRequest/:id',validateAdmin,adminController.declineCancelOrder);

module.exports = router;