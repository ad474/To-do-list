//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ankita:test123@cluster0-vz5wx.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema={
  name:String
};

const Item= mongoose.model("Item", itemSchema);

const item1=new Item({
  name:"Welcome to your to do list"
});

const item2= new Item({
  name:"Hit the + button to add an item"
});

const item3=new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name: String,
  items: [itemSchema]
};

const List=mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find(function(err,results){
    if(err){
      console.log(err);
    }
    else{
      if(results.length===0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Successfully added default items");
          }
        });
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: results});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item=new Item({
    name: itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err,foundList){
      console.log("Before push");
      console.log(foundList.items);
      foundList.items.push(item);
      foundList.save();
      console.log("After push");
      console.log(foundList.items);
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete", function(req,res){
  const checkID=req.body.check;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkID,function(err){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/");
      }
    });
  }
  else{

    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkID}}},function(err,results){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/:customListName", function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name:customListName}, function(err,foundList){
    if(err){
      console.log(err);
    }
    else{
      if(!foundList){
        //Create a new list
        const list= new List({
          name:customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        //show an existing list
        res.render("list",{listTitle: customListName, newListItems: foundList.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
