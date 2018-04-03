// @flow

export class Article {
  id: number;
  title: string;
  abstract: string;
  text: string;
  category: string;
  score: number;
  comments = [];
}

class ArticleService {
  getArticles(): Promise<Article[]> {
    return fetch('/articles').then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    });
  }

  getArticle(id: number): Promise<Article> {
    return fetch('/articles/' + id).then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    });
  }

  getCategory(category: string): Promise<Article[]> {
    if (category==="all"||category==="latest"||category==="popular"){
      return this.getArticles();
    } else {
        return fetch('/articles/category/' + category).then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        })
    }
  }

  addArticle(title: string, abstract: string, text: string, category: string): Promise<number> {
    let body = JSON.stringify({title: title, abstract: abstract, text: text, category: category});
    return fetch('/articles', {method: 'POST', headers: new Headers({'Content-Type': 'application/json'}), body: body}).then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    });
  }

  addComment(id: number, text: string){
      let body = JSON.stringify({comment: text});
      return fetch('/articles/'+id, {method: 'POST', headers: new Headers({'Content-Type': 'application/json'}), body: body}).then(response => {
          if (!response.ok) throw new Error(response.statusText);
          return response.json();
      });
  }

    vote(id: number, vote: number): Promise<number> {
        let body = JSON.stringify({vote: vote});
        return fetch('/articles/'+id+'/vote', {method: 'POST', headers: new Headers({'Content-Type': 'application/json'}), body: body}).then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        });
    }
}
export let articleService = new ArticleService();
