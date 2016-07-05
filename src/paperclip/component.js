import CoreObject from 'common/object';
import observable from 'common/object/mixins/observable';
import CallbackDispatcher from 'common/dispatchers/callback';
import { default as Template } from './template';
import { createVNode } from './vdom/create';
import { default as compileXMLtoJS } from './xml/compile';
import { default as freeze } from './freeze';
import { default as createTemplate } from './create-template';

@observable
export class BaseComponent extends CoreObject {
  constructor(properties) {
    super(properties);
  }

  set attributes(value) {
    this._attributes = Object.assign({}, value);
  }

  get attributes() {
    if (!this._attributes) {
      this._attributes = {};
    }
    return this._attributes;
  }

  get section() {
    return this.view.section;
  }

  setAttribute(key, value) {
    this.attributes[key] = value;
    this.update();
  }

  getAttribute(key) {
    return this.attributes[key];
  }

  update() {
    if (!this._initialized) {
      this._initialized = true;
      this.initialize();
    }
  }

  initialize() {

  }
}

export class TemplateComponent extends BaseComponent {

  static freezeNode(options) {

    var vnode = this.template;

    // template source can be a string. Parse it if this is this case
    if (typeof vnode === 'string') {
      vnode = compileXMLtoJS(vnode)(createVNode);
    }

    return vnode.freezeNode(options);
  }
}
