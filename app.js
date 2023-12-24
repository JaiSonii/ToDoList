//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb+srv://admin:admin@cluster0.mi6v9xu.mongodb.net/todolistDB");

const app = express();
const port = process.env.PORT||5000

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy Food"
});

const item2 = new Item({
  name: "Cook Food"
});

const item3 = new Item({
  name: "Eat Food"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = new mongoose.model("List", listSchema);


app.get("/", function (req, res) {

  async function getData() {
    const foundItems = await Item.find({});
    if (foundItems.length === 0) {
      try {
        Item.insertMany(defaultItems);
      } catch (error) {
        console.log(error);
      }
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  }

  getData();

});

app.get("/:customList", (req, res) => {
  const listName = _.capitalize(req.params.customList);


  async function checkList() {
    const foundList = await List.findOne({ name: listName })
    try {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: defaultItems
        })

        list.save();
        res.redirect("/" + listName)
      }
      else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
    catch (error) {
      console.log(error);
    }
  }
  checkList();

})

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listItem = req.body.list;

  const newItem = new Item({
    name: itemName
  })

  async function findList() {
    const found = await List.findOne({ name: listItem });
    found.items.push(newItem);
    found.save();
  }

  if (listItem == "Today") {
    newItem.save();
    res.redirect("/");
  }
  else {
    findList();
    res.redirect("/" + listItem);
  }
});

app.post("/delete", (req, res) => {
  const deleteId = req.body.checkbox;
  const listName = req.body.listName;

  async function deleteInList() {
    try {
      await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: deleteId } } });

    }
    catch (err) {
      console.log(err);
    }
    res.redirect("/" + listName);
  }

  async function deleteById() {
    try {
      await Item.findByIdAndRemove(deleteId);
    } catch (error) {
      console.log(error)
    }
    res.redirect("/");
  }
  if (listName == "Today") {
    deleteById();
  }
  else {
    deleteInList();
  }
})

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(port, function () {
  console.log("Server started on port 3000");
});

