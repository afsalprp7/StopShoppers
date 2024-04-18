const express = require('express');
const router =express.Router();
const adminController = require('../controller/adminController');
const {categoryStg , productStg} = require('../controller/multerController');
const {validateAdmin} = require('../middleware/authMiddleware');
const { validate } = require('uuid');
const offerExpiryCheck = require('../middleware/offerValidtyMiddleware');





router.get('/adminProduct',validateAdmin,adminController.getProductPage);
router.get('/addProduct',validateAdmin,offerExpiryCheck,adminController.getAddProductPage);
router.post('/addProduct',validateAdmin,productStg.array('productPhoto'),adminController.doAddProduct);
router.patch('/deleteProduct/:id',validateAdmin,adminController.DeleteProduct);
router.get('/editProduct/:id',validateAdmin,adminController.getEditProductPage);
router.patch('/editProduct/:id',validateAdmin,productStg.array('productPhoto'),adminController.doEditProduct);
router.patch('/deleteProductPrevImg/:id',validateAdmin,adminController.deleteImageEditProduct);







router.get('/adminCategory',validateAdmin,adminController.getCategoryPage);

router.get('/addCategory',validateAdmin,adminController.getAddCategoryPage);
router.post('/addCategory',validateAdmin,categoryStg.single("productPhoto"),adminController.doAddCategoryPage);

router.get('/editCategory/:id',validateAdmin,adminController.getEditCategoryPage);
router.patch('/deleteEditCat/:id',validateAdmin,adminController.patchDeleteCatImg);
router.patch('/editCategory/:id',validateAdmin,categoryStg.single('productPhoto'),adminController.patchEditCategory);


//delete category
router.patch('/deleteCategory/:id',validateAdmin,adminController.deleteCategory);

router.get('/adminUsers',validateAdmin,adminController.getAdminUsersPage);
router.patch('/blockUser/:id',validateAdmin,adminController.doBlockUsers);

router.get('/adminOrders',validateAdmin,adminController.getAdminOrders);
router.get('/AdminOrderDetails/:id',validateAdmin,validateAdmin,adminController.getAdminOrderDetailpage)

router.patch('/acceptCancel/:id',validateAdmin,adminController.acceptCancelOrder);
router.patch('/declineCancelRequest/:id',validateAdmin,validateAdmin,adminController.declineCancelOrder);

router.get('/adminCoupon',validateAdmin,adminController.getAdminCouponPage);
router.get('/addCoupon',validateAdmin,adminController.getAddCouponForm);
router.post('/addCoupon',validateAdmin,adminController.doAddCouponForm);

router.patch('/deleteCoupon/:id',validateAdmin,adminController.deleteCoupon);
router.get('/editCoupon/:id',validateAdmin,adminController.getEditCoupon);
router.patch('/editCoupon/:id',validateAdmin,adminController.doEditCoupon);


router.get('/adminDashboard',validateAdmin,adminController.getAdminDashboard);

router.post('/createChart',validateAdmin,adminController.createChartSalesReport);
router.post('/downloadAsPdf',validateAdmin,adminController.downloadReportPdf);
router.post('/downloadAsExcel',validateAdmin,adminController.downloadAsExcel);


router.get('/adminOffer',validateAdmin,offerExpiryCheck,adminController.getAdminOffer)
router.get('/getAddOffer',validateAdmin,adminController.getAddOfferPage);
router.post('/addOffer',validateAdmin,adminController.doAddOffer);
router.delete('/deleteOffer/:id',validateAdmin,adminController.deleteOffer);

router.post('/chartCategory',validateAdmin,adminController.getSecondChart);

router.post('/changeOrderStatus/:id',validateAdmin,adminController.changeOrderStatus)


module.exports = router;