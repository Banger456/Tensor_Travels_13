const Category = require("../models/category.model");


const addCategory = async (req, res) => {
    const categoryName = req.body.name;
  
    if (!categoryName) {
      return res.status(400).send({ message: "Category name is required" });
    }
  
    const newCategory = new Category({
      name: categoryName,
    });
  
    try {
      const savedCategory = await newCategory.save();
      res.send({ message: "Category added successfully!", category: savedCategory });
    } catch (err) {
      res.status(500).send({ message: err });
    }
  };

  const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({message: 'Error getching categories'});
    }
  };

  module.exports = {
    addCategory,
    getAllCategories,
  };