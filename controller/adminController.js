const { ObjectId } = require("mongodb");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const flash = require("connect-flash");
const fs = require("fs");
const adminModel = require('../models/adminModel');
const { name } = require("ejs");


module.exports = {

    //get category pageṭ
    getCategoryPage: async (req, res) => {
      const admin = await adminModel.findOne();
      req.session.adminName = admin.name;
    const data = await categoryModel.find({ isDeleted: false });
    res.render("admin/categoryPage", { title: "Admin Category", data : data , success : req.flash('success'), adminName : req.session.adminName});
  },


  //post category page
  doAddCategoryPage: async (req, res) => {
    const catName = req.body.name.toLowerCase();
    const categoryExists = await categoryModel.findOne({
      categoryName: catName,
    });
    if (categoryExists) {
      if (categoryExists.isDeleted === true) {
        await categoryExists.collection.updateOne(
          { categoryName: catName },
          { $set: { isDeleted: false } }
        );
        res.redirect("/adminCategory");
      } else {
        if (catName === categoryExists.categoryName) {
          req.flash("error", "Category Already Exists");
          fs.unlink(
            `uploadedImages/categoryImg/${req.file.filename}`,
            (error) => {
              if (error) {
                console.log(error);
              } else {
                console.log("deleted");
              }
            }
          );
          res.redirect("/addCategory");
        }
      }
    } else {
      await categoryModel.collection.insertOne({
        categoryName: catName,
        image: req.file.filename,
        isDeleted: false,
      });
      res.redirect("/adminCategory");
    }
  },

  //get add category page.
  getAddCategoryPage: (req, res) => {
    res.render("admin/addCategory", {
      title: "Add Category",
      error: req.flash("error"),
      adminName : req.flash('adminName')
    });
  },

  //get edit category page
  getEditCategoryPage: async (req, res) => {
    try {
      const id = req.params.id;
      // console.log(id);
      const data = await categoryModel.findOne({ _id: id });
      res.render("admin/editCategory", { title: "Edit Category", data: data , error : req.flash('error'), adminName : req.session.adminName});
    } catch (error) {
      console.log(error);
    }
  },

  //edit category
  patchEditCategory: async (req, res) => {
    try {
      const id = req.params.id;
      // console.log(id);
      // console.log(req.body);
      const newName = req.body.name.toLowerCase();
      console.log(newName);
      const exists = await categoryModel.findOne({ categoryName: newName });
      const data = await categoryModel.findOne({ _id: id });
      if (exists && newName !== data.categoryName) {
        if (exists.isDeleted === true) {
          await categoryModel.deleteOne({categoryName : newName});
          await categoryModel.updateOne({_id : id},{$set : {categoryName : newName}});
          fs.unlink(`uploadedImages/categoryImg/${exists.image}`, (error) => {
            if (error) {
              console.log(error);
            } else {
              console.log("fileDeleted");
            }
          });
          res.redirect(`/adminCategory`);
          
        }else {
          req.flash("error", "Category Already Exists");
          res.redirect(`/editCategory/${id}`);
        }
      } else {
       
        const objId = new ObjectId(id);
        console.log(req.body.name);
        if (!req.body.name && req.file) {
          await categoryModel.collection.updateOne(
            { _id: objId },
            { $set: { image: req.file.filename } }
          );
          req.flash('success',true);
          fs.unlink(`uploadedImages/categoryImg/${data.image}`, (error) => {
            if (error) {
              console.log(error);
            } else {
              console.log("fileDeleted");
            }
          });
          res.redirect("/adminCategory");
        } else if (!req.file && req.body.name) {
          await categoryModel.collection.updateOne(
            { _id: objId },
            { $set: { categoryName: req.body.name } }
          );

          req.flash('success',true);

          res.redirect("/adminCategory");
        } else if (req.body.name && req.file) {
          await categoryModel.collection.updateOne(
            { _id: objId },
            { $set: { categoryName: req.body.name, image: req.file.filename } }
          );

          req.flash('success',true);
          
          fs.unlink(`uploadedImages/categoryImg/${data.image}`, (error) => {
            if (error) {
              console.log(error);
            } else {
              console.log("fileDeleted");
            }
          });
          res.redirect("/adminCategory");
        }
      }
    } catch (error) {
      console.log(error);
    }
  },

  //delete category
  deleteCategory: async (req, res) => {
    const id = req.params.id;
    const data = await categoryModel.findOne({ _id: id });
    await categoryModel.updateOne({ _id: id }, { $set: { isDeleted: true } });
    res.redirect("/adminCategory");
  },

// delete the image from the 
patchDeleteCatImg : async(req,res)=>{
  try{
    const id = req.params.id ; 
    const categoryInfo = await categoryModel.findOne({_id : id});
    await categoryModel.updateOne({_id : id},{$unset : { image : " "}});
    console.log(req.body);
    res.redirect(`/editCategory/${id}`);
  }catch(error){
    res.send(error);
  }
},

   //get productpage.
   getProductPage: async (req, res) => {
    
    const productsData = await productModel.find({isDeleted : false});
    res.render("admin/adminproduct", {
      title: "Admin Product",
      products: productsData,
      adminName : req.session.adminName
    });
  },

  //get add product page.
  getAddProductPage: async (req, res) => {
   
    const catData = await categoryModel.find();
    res.render("admin/addProduct", { title: "Add Product", 
    catData: catData, 
    error : req.flash('error'),
    adminName : req.session.adminName
  });
  },

  // get edit product page.
  getEditProductPage: async (req, res) => {
    const catData = await categoryModel.find();
    const paramId = req.params.id;
    const productData = await productModel.findOne({ _id: paramId });
    res.render("admin/editProduct", {
      title: "Edit Product",
      catData: catData,
      data: productData,
      error : req.flash('error'),
      adminName : req.session.adminName
    });
  },

  //post product form(add product)
  doAddProduct: async (req, res) => {
    const data = req.body;
    const color = req.body.color.toLowerCase();
    const images = [];
    for( let image of req.files){
      images.push(image.filename);
    }
    console.log(data);
    try {
      const isExists = await productModel.findOne({productName : data.productName , color : color});
      if(isExists){
        if(isExists.isDeleted === true){
          await productModel.updateOne({productName : data.productName , color : data.color},{$set : {
            isDeleted : false,
            productName: data.productName,
            productPrice: data.productPrice,
            category: data.category,
            userType: data.userType,
            description: data.productDescription,
            color: data.color,
            sizes: data.Sizes,
            quantity: data.Quantity,
            image : images,
          }});
          //deleting the existing image.
          for(let image of isExists.image){
            fs.unlink(`uploadedImages/productImg/${image}`,(error)=>{
              if(error){
                console.log(error);
              }else{
                console.log('file deleted');
              }
            });
          }
          
          res.redirect('/adminProduct');
        }else{
          req.flash('error','Product already exists.');
          res.redirect('/addProduct');
        }
      }else{
        await productModel.collection.insertOne({
          productName: data.productName,
          productPrice: data.productPrice,
          category: data.category,
          userType: data.userType,
          description: data.productDescription,
          color: data.color,
          sizes: data.Sizes,
          quantity: data.Quantity,
          image : images,
          isDeleted : false 
         
        });
        res.redirect("/adminProduct");
      }
      
    } catch (error) {
      console.log(error);
    }
  },

   DeleteProduct : async(req,res)=>{
    try{
      
      const id = req.params.id;
      const productData = await productModel.findOne({_id : id});
      console.log(productData);
      await productModel.updateOne({_id : productData._id},{$set : {isDeleted : true}});
      res.redirect('/adminProduct');

    }catch(error){
      console.log(error);
    }
   },

   doEditProduct : async(req,res)=>{
    try{
      const editData = req.body;
      const id = req.params.id;
      const product = await productModel.findOne({_id : id});
      const productName = req.body.productName.toLowerCase();
      const pColor = req.body.color.toLowerCase();
      const exists = await productModel.findOne({productName : productName , color:pColor});
      if(exists && product.productName !== productName){
        if(exists.isDeleted === true){
          for(let image of exists.image){
            fs.unlink(`uploadedImages/productImg/${image}`,(error)=>{
              if(error){
                console.log(error);
              }else{
                console.log('file deleted');
              }
            });
          }
          const images = [];
          req.files.forEach((element)=>{
            images.push(element.filename);
            });
          await productModel.deleteOne({productName : exists.productName,color:pColor});
          await productModel.updateOne({_id : id},{$set:{
            productName : editData.productName !== ''? editData.productName.toLowerCase() : undefined,
            description : editData.productDescription !== ''? editData.productDescription : undefined,
            category: editData.category !== ''? editData.category : undefined,
            color: editData.color !== ''? editData.color.toLowerCase() : undefined,
            sizes: editData.Sizes !== ''? editData.Sizes : undefined,
            quantity: editData.Quantity !== ''? editData.Quantity : undefined,
            productPrice: editData.Quantity !== ''?editData.productPrice : undefined,
            userType: editData.userType !== ''? editData.userType : undefined,
          },
          $addToSet :
          {image :{ $each : images.length !== 0 ? images : [],}}  
        });
          
        }else{
          req.flash('error','Product already Exists');
          res.redirect(`/editProduct/${id}`);
        }
      }else{
        console.log(id);
        
        const images = [];
        req.files.forEach((element)=>{
          images.push(element.filename);
        });
  
        await productModel.updateOne({_id : id},{$set : {
  
          productName : editData.productName !== ''? editData.productName.toLowerCase() : undefined,
          description : editData.productDescription !== ''? editData.productDescription : undefined,
          category: editData.category !== ''? editData.category : undefined,
          color: editData.color !== ''? editData.color : undefined,
          sizes: editData.Sizes !== ''? editData.Sizes : undefined,
          quantity: editData.Quantity !== ''? editData.Quantity : undefined,
          productPrice: editData.Quantity !== ''?editData.productPrice : undefined,
          userType: editData.userType !== ''?editData.userType : undefined,
        },
          $addToSet :
          {image :{ $each : images.length !== 0 ? images : [],}}  
        });
  
        res.redirect('/adminProduct');
      }
     
      


    }catch(error){
      console.log(error);
    }


   },

   //deleting the images from edit product page
   deleteImageEditProduct : async(req,res) =>{
    try{
      const filename = req.body.filename;
      console.log(filename);
      const id = req.params.id;
      console.log(id);
      const productCollection = await productModel.findOne({_id : id});
      if(productCollection && productCollection.image !== ''){
        await productModel.updateOne({_id : id},{$pull : {image : filename}});
      }else{
        console.log('no data found');
      }
    }catch(error){
      console.log(error);
    }
   },


  getAdminUsersPage: async (req, res) => {
    try {
      const users = await userModel.find();
      res.render("admin/adminUsers", { title: "Admin Users", data: users, adminName : req.session.adminName });
    } catch (error) {
      console.log(error);
    }
  },

  doBlockUsers : async(req,res)=>{
    try{
      const id = req.params.id;
      console.log(req.body);
      const data = await userModel.findOne({_id : id});
      if(data.is_blocked === false){
        await userModel.updateOne({_id : id},{$set : {is_blocked : true}});
          res.json({
          message : 'blocked'
         })
      }else{
        await userModel.updateOne({_id : id},{$set : {is_blocked : false}});
        res.json({
          message : 'unblocked'
       })
      }

    }catch(error){
      console.log(error);
    }
    




  }
};
