
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

  module.exports = {
    addCategory,
  };