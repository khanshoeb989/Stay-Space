const express = require("express");
const app = express();
const mongoose = require ("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require ("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
// const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const Review = require("./models/reviews.js")


const MONGO_URL ="mongodb://127.0.0.1:27017/wonderlust";

main().then(()=>{
    console.log("connected to database");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);

};



app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


app.get("/",(req,res)=>{
    res.send ("hello");
});

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    
    if(error){
        throw new ExpressError(400,error);
    }else{
        next(); 
    }

}


//Index Route
app.get("/listings",async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});

//New data
app.get("/listings/new",async(req,res)=>{
    res.render("listings/new.ejs"); 
});

 
//show data
app.get("/listings/:id",async(req,res)=>{
    let {id} = req.params
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

//Create Route
app.post("/listings",validateListing, async (req,res,next) => {
    
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  });

  //edit route
  app.get("/listings/:id/edit",async(req,res)=>{
    let {id} = req.params
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing}); 
});

//Update route
app.put("/listings/:id",validateListing, async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  });
  
  //Delete route
  app.delete("/listings/:id",async(req,res)=>{
    let { id } = req.params;
    let deletedList= await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    res.redirect("/listings");

  });

  //Reviews
  //Post Route
  app.post("listings/:id/reviews",async(req,res)=>{
    let Listing = await Listing.findById(req.body.params);
    let newReview = new Review(req.body.review);

    listingSchema.reviews.push(newReview);

    await newReview.save();
    await listingSchema.save();

    console.log("New review saved");
    res.send("New Review saved");
  });


// app.get("/testListing",async(req,res)=>{
//     let sampletesting = new Listing ({
//         title: "My new villa",
//         description:"by the beach",
//         price:7000,
//         location:"Lonavla",
//         country:"India",
//     });
//     await sampletesting.save();
//     console.log("Sample is saved");
//     res.send("Sucessful");
// });
// app.all("*",(req,res,next) =>{
//     next(new ExpressError(404,"Page Not found!"));
// });

// app.use((err,req,res,next)=>{
//     let{statusCode=500,message="Something went wrong!"}=err;
//     res.render("error.ejs",{message});
    
// });


app.listen(8080,()=>{
    console.log ("Server is listning to port 8080");
});
