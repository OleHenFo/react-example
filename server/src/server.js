// @flow
import express from 'express';
import bodyParser from 'body-parser';

let server = express();

// Serve the React client
server.use(express.static(__dirname + '/../../client'));

// Automatically parse json content
server.use(bodyParser.json());

class Article {
  static nextId = 1;
  id: number;
  title: string;
  abstract: string;
  text: string;
  category: string;
  score: number;
  comments: [];

  constructor(title: string, abstract: string, text: string, category: string, comments: []) {
    this.id = Article.nextId++;
    this.title = title;
    this.abstract = abstract;
    this.text = text;
    this.category = category;
    this.score = 0;
    this.comments = comments;
  }
}

// The data is currently stored in memory
let articles = [new Article('title1', 'abstract1', 'text1', 'tech', ['I like trains','Hello from sweden']),
    new Article('title2', 'abstract2', 'text2', 'news',['My My My What a beautiful article']),
    new Article('title3', 'abstract3', 'text3', 'science',['Science is pretty cool']),
    new Article('title4', 'abstract4', 'text4', 'business',['This is controversial','I agree','Me too','and me','shut up you bums'])];

// Get all articles
server.get('/articles', (request: express$Request, response: express$Response) => {
  response.send(articles);
});

// Get an article given its id
server.get('/articles/:id', (request: express$Request, response: express$Response) => {
  for (let article of articles) {
    if (article.id == Number(request.params.id)) {
      response.send(article);
      return;
    }
  }
  // Respond with not found status code
  response.sendStatus(404);
});

// Get articles given their category
server.get('/articles/category/:c', (request: express$Request, response: express$Response) => {
    let toSend = [];
    for (let article of articles) {
        if (article.category == request.params.c) {
            toSend.push(article);
        }
    }
    response.send(toSend);
    return;
    // Respond with not found status code
    response.sendStatus(404);
});

// Add new article
server.post('/articles', (request: express$Request, response: express$Response) => {
  if (request.body && typeof request.body.title == 'string' && typeof request.body.abstract == 'string' && typeof request.body.text == 'string' && typeof request.body.category == 'string') {
    articles.push(new Article(request.body.title, request.body.abstract, request.body.text, request.body.category));
    response.send(articles[articles.length - 1].id.toString());
    return;
  }
  // Respond with bad request status code
  response.sendStatus(400);
});

// Add new comment to article with id
server.post('/articles/:id', (request: express$Request, response: express$Response) => {
    if (request.body && typeof request.body.comment == 'string') {
        for (let article of articles) {
            if (article.id == request.params.id) {
              if (article.comments) {
                  article.comments.push(request.body.comment);
              } else {
                  article.comments = [request.body.comment]
              }
                response.sendStatus(200);
            }
        }
        return;
    }
    // Respond with bad request status code
    response.sendStatus(400);
});

// Vote on article
server.post('/articles/:id/vote', (request: express$Request, response: express$Response) => {
    if (request.body && typeof request.body.vote == 'string') {
        for (let article of articles) {
            if (article.id == request.params.id) {
                article.score += parseInt(request.body.vote);
                response.send(article.score.toString());
            }
        }
        return;
    }
    // Respond with bad request status code
    response.sendStatus(400);
});

// Start the web server at port 3000
server.listen(3000);
