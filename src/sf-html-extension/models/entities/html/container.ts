import { inject } from "sf-core/decorators";
import { BubbleBus } from "sf-core/busses";
import { patch, diff } from "sf-core/markup";
import { disposeEntity } from "./utils";
import { PropertyChangeAction } from "sf-core/actions";
import { diffArray, patchArray } from "sf-core/utils/array";
import { IHTMLEntity, IHTMLDocument } from "./base";
import { IHTMLContainerExpression, HTMLExpression } from "sf-html-extension/parsers/html";
import { IEntity, IElementEntity, EntityMetadata } from "sf-core/entities";
import { IMarkupSection, ContainerNode, Node, INode, NodeSection, GroupNodeSection } from "sf-core/markup";
import { IInjectable, DEPENDENCIES_NS, Dependencies, EntityFactoryDependency } from "sf-core/dependencies";

export abstract class HTMLContainerEntity<T extends IHTMLContainerExpression> extends ContainerNode implements IHTMLEntity, IElementEntity, IInjectable {

  readonly type: string = null;
  readonly nodeName: string;
  readonly section: IMarkupSection;
  readonly metadata: EntityMetadata;

  @inject(DEPENDENCIES_NS)
  protected _dependencies: Dependencies;

  private _document: IHTMLDocument;

  constructor(private _source: T) {
    super();
    this.willSourceChange(_source);
    this.nodeName = _source.nodeName.toUpperCase();
    this.section = this.createSection();
    this.metadata = new EntityMetadata(this, this.getInitialMetadata());
    this.metadata.observe(new BubbleBus(this));
  }

  async load() {
    for (const childExpression of await this.mapSourceChildNodes()) {
      const entity = EntityFactoryDependency.createEntityFromSource(childExpression, this._dependencies);
      this.appendChild(entity);
      await entity.load();
    }
  }

  protected mapSourceChildNodes() {
    return this._source.childNodes;
  }

  get source(): T {
    return this._source;
  }

  patch(entity: HTMLContainerEntity<T>) {
    this.willSourceChange(entity.source);
    this._source = entity.source;
    const changes = diffArray(this.childNodes, entity.childNodes, (a, b) => a.constructor === b.constructor && a.nodeName === b.nodeName);
    for (const entity of changes.remove) {
      this.removeChild(entity);
    }
    for (const [currentChild, patchChild] of changes.update) {
      currentChild.patch(patchChild);
      const patchIndex = entity.childNodes.indexOf(patchChild);
      const currentIndex = this.childNodes.indexOf(currentChild);
      if (currentIndex !== patchIndex) {
        const beforeChild = <Node>this.childNodes[patchIndex];
        if (beforeChild) {
          this.insertBefore(currentChild, beforeChild);
        } else {
          this.appendChild(currentChild);
        }
      }
    }

    for (const addition of changes.add) {
      const beforeChild = <Node>this.childNodes[addition.index];
      if (beforeChild) {
        this.insertBefore(addition.value, beforeChild);
      } else {
        this.appendChild(addition.value);
      }
    }
  }

  protected willSourceChange(value: IHTMLContainerExpression) {
    // override me
  }

  protected getInitialMetadata(): Object {

    // TODO - scan additional dependencies for metadata
    return {};
  }

  get document(): IHTMLDocument {
    return this._document;
  }

  find(filter: (entity: IEntity) => boolean): IEntity {
    if (filter(this)) return this;
    for (const child of this.childNodes) {
      const ret = (<IEntity>child).find(filter);
      if (ret) return ret;
    }
    return null;
  }

  set document(value: IHTMLDocument) {
    this.willChangeDocument(value);
    const oldDocument = this._document;
    this._document = value;
    for (const child of this.childNodes) {
      (<IHTMLEntity>child).document = value;
    }
  }

  protected willChangeDocument(newDocument) {
    // OVERRIDE ME
  }

  insertDOMChildBefore(newChild: INode, beforeChild: INode) {
    this.section.targetNode.insertBefore(newChild, beforeChild);
  }

  appendDOMChild(newChild: INode) {
    this.section.appendChild(newChild);
  }

  update() {
    for (const child of this.childNodes) {
      (<IEntity>child).update();
    }
  }

  static mapSourceChildren(source: IHTMLContainerExpression) {
    return source.childNodes;
  }

  protected createSection(): IMarkupSection {
    const element = document.createElement(this.nodeName) as any;
    return new NodeSection(element);
  }

  _unlink(child: IHTMLEntity) {
    super._unlink(child);
    child.document = undefined;
  }

  _link(child: IHTMLEntity) {
    super._link(child);
    child.document = this.document;
    if (child.section) {
      let nextHTMLEntitySibling: IHTMLEntity;
      do {
        nextHTMLEntitySibling = <IHTMLEntity>child.nextSibling;
      } while (nextHTMLEntitySibling && !nextHTMLEntitySibling.section);

      if (nextHTMLEntitySibling) {
        // TODO - this assumes that the next sibling has a section property - it
        // might not. Need to traverse the next sibling for a node that actually has a section
        const ppSection = (<IHTMLEntity>child.nextSibling).section;

        if (nextHTMLEntitySibling.section instanceof NodeSection) {
          this.insertDOMChildBefore(child.section.toFragment(), (<NodeSection>ppSection).targetNode);
        } else {
          this.insertDOMChildBefore(child.section.toFragment(), (<GroupNodeSection>ppSection).startNode);
        }
      } else {
        this.appendDOMChild(child.section.toFragment());
      }
    }
  }

  abstract cloneNode();

  dispose() {
    disposeEntity(this);
  }
}