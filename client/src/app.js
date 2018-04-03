// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter, Route} from 'react-router-dom';
import createHashHistory from 'history/createHashHistory';
const history = createHashHistory();
import {Article, articleService} from './services';
import {Alert, NavigationBar, Card, Table, Form} from './widgets';
import Signal from 'signals';

class Home extends React.Component<{}> {
  render() {
    return <Card title="Example App">Demonstration of React with Flow and server communication</Card>;
  }
}

class ArticleDetails extends React.Component<{match: {params: {c: string, id: number}}}, {article: ?Article}> {
  tab;
  input;
  state = {article: null};

  render() {
    if (!this.state.article) return null;
    return (
      <Card title={this.state.article.title + ' - Score: ' + this.state.article.score}>
        <div>
          <div>
            <strong>{this.state.article.abstract}</strong>
          </div>
          <div>{this.state.article.text}</div><br/>
            <div>Vote on this article: <button value={-1} onClick={event => this.vote(event)}>-</button><button value={1} onClick={event => this.vote(event)}>+</button></div>
          <Card>
              <Table ref={e => this.tab = e} header={['Comments']}/>
              <input onKeyPress={event => ((event.key === 'Enter') ? this.postComment(event) : 0)}/>
          </Card>
        </div>
      </Card>
    );
  }

  // Helper function to update component
  update() {
    articleService
      .getArticle(this.props.match.params.id)
      .then(article => {
        this.setState({article: article});
        let ac = [""];
        if (article.comments) ac = article.comments;
        this.tab.setRows(ac.map(comment => ({cells: [comment]})))
      })
      .catch((error: Error) => {
        Alert.danger('Error getting article ' + this.props.match.params.id + ': ' + error.message);
      });
  }

  componentDidMount() {
    this.update();
  }

  vote(event){
      articleService.vote(this.state.article.id,event.target.value);
      this.update()
  }

  postComment(event) {
    let comment = event.target.value;
    if (comment.length>0) {
        articleService.addComment(this.state.article.id, comment);
        event.target.value = "";
        this.update();
    }
  }

  // Called when the this.props-object change while the component is mounted
  // For instance, when navigating from path /articles/1 to /articles/2
  componentWillReceiveProps() {
    setTimeout(() => {
      this.update();
    }, 0); // Enqueue this.update() after props has changed
  }
}

class NewArticle extends React.Component<{}> {
  form;
  title;
  abstract;
  text;
  category;

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
            {label: 'Category', input: <select ref={e => (this.category = e)}>
                    <option value="news">News</option>
                    <option value="science">Science</option>
                    <option value="tech">Tech</option>
                    <option value="business">Business</option>
                </select>},
            {checkInputs: [{label: 'I have read, understand and accept the terms and ...', input: <input type="checkbox" required />}]}
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
          .addArticle(this.title.value, this.abstract.value, this.text.value, this.category.value)
          .then(id => {
            if (this.form) this.form.reset();
            this.onAdd.dispatch();
          })
          .catch((error: Error) => {
            Alert.danger('Error adding article: ' + error.message);
          });
      });
    }
  }
}

class Articles extends React.Component<{match: {params: {cc: string}}},{curcat: ?string, sort: ?string}> {
  state = {curcat: null, sort: null};
  table;
  newArticle;

  render() {
    if (this.state.curcat!==this.props.match.params.cc) {this.update();}
    return (
      <div>
        <Card title={"Articles " + this.props.match.params.cc}>
            <div><button value='latest' onClick={event => this.sort(event)}>Latest</button><button value='popular' onClick={event => this.sort(event)}>Popular</button></div>
          <Table ref={e => (this.table = e)} header={['Title', 'Abstract', 'Score']} />
        </Card>
        <Route exact path='/articles/:cc/:id' component={ArticleDetails} />
        <NewArticle ref={e => (this.newArticle = e)} />
      </div>
    );
  }

  sort(event){
      this.state.sort = event.target.value;
      this.update()
  }

  // Helper function to update component glyphicon glyphicon-chevron-up
  update() {
    articleService
      .getCategory(this.props.match.params.cc)
      .then(articles => {
        this.state.curcat = this.props.match.params.cc;
        if (this.state.sort==='latest'){
            articles.reverse();
        }
        if (this.state.sort==='popular'){
            articles.sort(function(a, b){return b.score-a.score});
        }
        if (this.table) this.table.setRows(articles.map(article => ({id: article.id, cells: [article.title, article.abstract,article.score]})));
      })
      .catch((error: Error) => {
        Alert.danger('Error getting articles: ' + error.message);
        this.update();
      });
  }

  componentDidMount() {
    if (this.table) {
      this.table.onRowClick.add(rowId => {
        history.push('/articles/' + this.state.curcat + '/' + rowId);
      });
    }
    if (this.newArticle) {
      this.newArticle.onAdd.add(() => {
        this.update();
      });
    }
    this.update();
  }

    componentWillReceiveProps() {
        setTimeout(() => {
            this.update();
        }, 0);
    }
}

let root = document.getElementById('root');
if (root) {
  ReactDOM.render(
    <HashRouter>
      <div>
        <Alert />
        <NavigationBar brand="React Example" links={[{to: '/articles/all', text: 'All Articles'},
            {to: '/articles/news', text: 'News'},
            {to: '/articles/science', text: 'Science'},
            {to: '/articles/tech', text: 'Tech'},
            {to: '/articles/business', text: 'Business'}]} />
        <Route exact path="/" component={Home} />
        <Route path="/articles/:cc" component={Articles} />
      </div>
    </HashRouter>,
    root
  );
}
