const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

mongoose.set('strictQuery', false); 

mongoose.connect("mongodb://127.0.0.1:27017/wikiDB", {useNewUrlParser: true}, () => {
    console.log("Connected to WikiDB");
});

const articleSchema = new mongoose.Schema(
    {
        title: String,
        content: String
    }
);
  
const Article = mongoose.model("Article", articleSchema);

app.route("/articles")
    .get(function(req, res){
        Article.find({}, {}, function(err, foundArticles){ //se algum parâmetro ficar em branco, ele pode ser omitido, então eu poderia escrever apenas Article.find(function(err, articles){...}) que ia dar na mesma
            if(err){
                res.send(err);
            } else {
                res.send(foundArticles);
            }
        });
    })
    .post(function(req, res){
        const article = new Article(
            {
                title: req.body.title,
                content: req.body.content
            }
        )
        article.save(function(err){
            if(err){
                console.log(err);
            } else{
                res.send("Article created successfully.");
            }
        });
    })
    .delete(function(req, res){
        Article.deleteMany({}, function(err, results){
            if(err){
                console.log(err);
            } else{
                res.send(results.deletedCount + " articles have been deleted.");
            }      
        });
    });

    app.route("/articles/:article")
        .get(function(req,res){      
            Article.findOne({title: {$eq: req.params.article}}, {}, function(err, foundArticle){ 
            if(err){
                console.log(err);
            } else{
                if(foundArticle){
                    res.send(foundArticle);
                } else{
                    res.send("Article not found.");
                }   
            }
            });
        })
        .put(function(req, res){
            Article.findOne({title: {$eq: req.params.article}}, {}, function(err, foundArticle){ 
                if(err){
                    console.log(err);
                } else{
                    if(foundArticle){
                        const article = new Article(
                            {
                                title: req.body.title,
                                content: req.body.content,
                                _id: foundArticle._id
                            }
                        )
                        Article.replaceOne({title: {$eq: foundArticle.title}}, article, function(err, results){
                            if(err){
                                console.log(err);
                            } else{
                                res.send("Article successfully replaced.");
                            }                
                        })
                    } else{
                        res.send("Article to be replaced has not been found.");
                    }   
                }
            });
        })
        .patch(function(req, res){
            Article.updateOne({title: {$eq: req.params.article}}, {$set: {title:req.body.title, content: req.body.content}}, function(err, results){
                if(err){
                    console.log(err);
                } else{
                    if(results.matchedCount){
                        res.send("Article successfully updated.");
                    } else{
                        res.send("Article to be updated has not been found.");   
                    }
                }
            })
        })
        .delete(function(req, res){
            Article.deleteOne({title: {$eq: req.params.article}}, function(err, results){
                if(err){
                    console.log(err);
                } else{
                    if(results.deletedCount){
                        res.send("The article has been deleted.");
                    } else{
                        res.send("The article to be deleted has not been found.");
                    }
                    
                }      
            });
        });

app.listen(3000, function(){
    console.log("Server running on port 3000.");
});