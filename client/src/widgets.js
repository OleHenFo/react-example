// @flow
import * as React from 'react';
import {Component} from 'react-simplified';
import ReactDOM from 'react-dom';
import {NavLink} from 'react-router-dom';
import Signal from 'signals';

/**
 * Renders alert messages using Bootstrap classes.
 */
export class Alert extends Component {
  alerts: {text: React.Node, type: string}[] = [];

  render() {
    return this.alerts.map((alert, i) => (
      <div key={i} className={'alert alert-' + alert.type} role="alert">
        {alert.text}
        <button
          className="close"
          onClick={() => {
            this.alerts.splice(i, 1);
          }}
        >
          &times;
        </button>
      </div>
    ));
  }

  static success(text: React.Node) {
    for (let instance: Alert of Alert.instances()) instance.alerts.push({text: text, type: 'success'});
  }

  static info(text: React.Node) {
    for (let instance: Alert of Alert.instances()) instance.alerts.push({text: text, type: 'info'});
  }

  static warning(text: React.Node) {
    for (let instance: Alert of Alert.instances()) instance.alerts.push({text: text, type: 'warning'});
  }

  static danger(text: React.Node) {
    for (let instance: Alert of Alert.instances()) instance.alerts.push({text: text, type: 'danger'});
  }
}

/**
 * Renders a navigation bar using Bootstrap classes
 */
export class NavigationBar extends Component<{
  brand?: React.Node,
  links: {to: string, text: React.Node, exact?: boolean}[]
}> {
  render() {
    return (
      <nav className="navbar navbar-expand-sm bg-light navbar-light">
        {this.props.brand ? (
          <NavLink className="navbar-brand" activeClassName="active" to="/">
            {this.props.brand}
          </NavLink>
        ) : null}
        <ul className="navbar-nav">
          {this.props.links.map((link, i) => (
            <li key={i}>
              <NavLink className="nav-link" activeClassName="active" exact={link.exact} to={link.to}>
                {link.text}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
}

/**
 * Renders an information card using Bootstrap classes
 */
export class Card extends Component<{title: React.Node, children?: React.Node}> {
  render() {
    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{this.props.title}</h5>
          <div className="card-text">{this.props.children}</div>
        </div>
      </div>
    );
  }
}

/**
 * Renders a table using Bootstrap classes
 */
type TableRow = {id: number, cells: React.Node[]}; // Helper type
export class Table extends Component<{header?: React.Node[]}> {
  rows: TableRow[] = [];
  onRowClick: Signal<number> = new Signal();

  setRows(rows: TableRow[]) {
    this.rows = rows;
  }

  render() {
    return (
      <table className="table table-hover">
        {this.props.header ? (
          <thead>
            <tr>{this.props.header.map((title, i) => <th key={i}>{title}</th>)}</tr>
          </thead>
        ) : null}
        <tbody>
          {this.rows.map(row => (
            <tr
              key={row.id}
              onClick={() => {
                if (this.onRowClick) this.onRowClick.dispatch(row.id);
              }}
            >
              {row.cells.map((cell, i) => <td key={i}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

/**
 * Renders a form using Bootstrap classes.
 */
export class Form extends Component<{
  submitLabel: React.Node,
  cancelLabel?: React.Node,
  groups: {
    label?: React.Node,
    input?: React.Element<'input' | 'select' | 'textarea'>,
    checkInputs?: {label?: React.Node, input: React.Element<'input'>}[]
  }[]
}> {
  form_key: number = 0;

  _form: ?HTMLFormElement;
  submitButton: ?HTMLButtonElement;

  onSubmit: Signal<> = new Signal();
  onCancel: Signal<> = new Signal();

  updateSubmitButton = () => {
    if (this.submitButton) this.submitButton.disabled = this._form && this._form.checkValidity() ? false : true;
  };

  render() {
    return (
      <form key={this.form_key} ref={e => (this._form = e)}>
        {this.props.groups.map((group, i) => {
          let checkInputElements;
          if (group.checkInputs) {
            checkInputElements = group.checkInputs.map((checkInput, i) => (
              <div key={i} className="form-check col-sm-10">
                {React.cloneElement(checkInput.input, {
                  className: 'form-check-input',
                  onChange: this.updateSubmitButton
                })}
                <label className="form-check-label">{checkInput.label}</label>
              </div>
            ));
          }
          return (
            <div key={i} className="form-group row">
              {group.label ? <label className="col-form-label col-sm-2">{group.label}</label> : null}
              {group.input ? (
                <div className="col-sm-10">
                  {React.cloneElement(group.input, {
                    className: 'form-control',
                    onChange: this.updateSubmitButton
                  })}
                  {checkInputElements}
                </div>
              ) : (
                checkInputElements
              )}
            </div>
          );
        })}
        <button
          type="submit"
          ref={e => (this.submitButton = e)}
          className="btn btn-primary"
          onClick={(e: Event) => {
            e.preventDefault();
            this.onSubmit.dispatch();
          }}
        >
          {this.props.submitLabel}
        </button>
        {this.props.cancelLabel ? (
          <button
            className="btn btn-secondary"
            onClick={(e: Event) => {
              e.preventDefault();
              this.onCancel.dispatch();
            }}
          >
            {this.props.cancelLabel}
          </button>
        ) : null}
      </form>
    );
  }

  componentDidMount() {
    this.updateSubmitButton();
  }

  reset() {
    ++this.form_key; // Reset this._form
    this.componentDidMount();
  }
}
