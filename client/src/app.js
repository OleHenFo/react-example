// @flow
import * as React from 'react';
import {Component} from 'react-simplified';
import ReactDOM from 'react-dom';
import {HashRouter, Route} from 'react-router-dom';
import createHashHistory from 'history/createHashHistory';
const history = createHashHistory();
import {Article, articleService} from './services';
import {Alert, NavigationBar, Card, Table, Form} from './widgets';
import Signal from 'signals';

class Home extends Component {
  render() {
    return <Card title="Example App">Demonstration of React with Flow and server communication</Card>;
  }
}

class ArticleDetails extends Component<{match: {params: {id: number}}}> {
  article: ?Article = null;

  render() {
    if (!this.article) return null;
    return (
      <Card title={'Article: ' + this.article.title}>
        <div>
          <div>
            <strong>{this.article.abstract}</strong>
          </div>
          <div>{this.article.text}</div>
        </div>
      </Card>
    );
  }

  componentDidMount() {
    articleService
      .getArticle(this.props.match.params.id)
      .then(article => (this.article = article))
      .catch((error: Error) =>
        Alert.danger('Error getting article ' + this.props.match.params.id + ': ' + error.message)
      );
  }
}

class NewArticle extends Component {
  form;
  title;
  abstract;
  text;

  onAdd: Signal<> = new Signal();

  render() {
    return (
      <Card title="New Article">
        <Form
          ref={e => (this.form = e)}
          submitLabel="Add Article"
          groups={[
            {label: 'Title', input: <input ref={e => (this.title = e)} type="text" required />},
            {label: 'Abstract', input: <textarea ref={e => (this.abstract = e)} rows="2" required />},
            {label: 'Text', input: <textarea ref={e => (this.text = e)} rows="3" required />},
            {
              checkInputs: [
                {
                  label: 'I have read, understand and accept the terms and ...',
                  input: <input type="checkbox" required />
                }
              ]
            }
          ]}
        />
      </Card>
    );
  }

  componentDidMount() {
    if (this.form) {
      this.form.onSubmit.add(() => {
        if (!this.title || !this.abstract || !this.text) return;
        articleService
          .addArticle(this.title.value, this.abstract.value, this.text.value)
          .then(id => {
            if (this.form) this.form.reset();
            this.onAdd.dispatch();
            history.push('/articles/' + id);
          })
          .catch((error: Error) => Alert.danger('Error adding article: ' + error.message));
      });
    }
  }
}

class Articles extends Component {
  table;
  newArticle;

  render() {
    return (
      <div>
        <Card title="Articles">
          <Table ref={e => (this.table = e)} header={['Title', 'Abstract']} />
        </Card>
        <Route exact path="/articles/:id" component={ArticleDetails} />
        <NewArticle ref={e => (this.newArticle = e)} />
      </div>
    );
  }

  // Helper function to update component
  update() {
    articleService
      .getArticles()
      .then(articles => {
        if (this.table)
          this.table.setRows(articles.map(article => ({id: article.id, cells: [article.title, article.abstract]})));
      })
      .catch((error: Error) => Alert.danger('Error getting articles: ' + error.message));
  }

  componentDidMount() {
    if (this.table) {
      this.table.onRowClick.add(rowId => {
        history.push('/articles/' + rowId);
      });
    }
    if (this.newArticle) {
      this.newArticle.onAdd.add(() => {
        this.update();
      });
    }
    this.update();
  }
}

let root = document.getElementById('root');
if (root) {
  ReactDOM.render(
    <HashRouter>
      <div>
        <Alert />
        <NavigationBar brand="React Example" links={[{to: '/articles', text: 'Articles'}]} />
        <Route exact path="/" component={Home} />
        <Route path="/articles" component={Articles} />
      </div>
    </HashRouter>,
    root
  );
}
