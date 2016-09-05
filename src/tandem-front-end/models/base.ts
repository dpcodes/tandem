import { File } from "tandem-common/models";
import { inject } from "tandem-common/decorators";
import { IActor } from "tandem-common/actors";
import { IEntity } from "tandem-common/ast/entities";
import { BubbleBus } from "tandem-common/busses";
import { Workspace } from "./workspace";
import { IObservable } from "tandem-common/observable";
import { IDisposable } from "tandem-common/object";
import { IExpression } from "tandem-common/ast";
import { patchTreeNode } from "tandem-common/tree";
import { IEntityDocument } from "tandem-common/ast";
import { IPoint, Transform } from "tandem-common/geom";
import { Action, PropertyChangeAction } from "tandem-common/actions";
import { IInjectable, DEPENDENCIES_NS, DependenciesDependency, Dependencies, EntityDocumentDependency } from "tandem-common/dependencies";

export interface IEditorTool extends IActor, IDisposable {
  readonly editor: IEditor;
  readonly name: string;
  readonly cursor: string;
}

export interface IEditor extends IActor {
  currentTool: IEditorTool;
  transform: Transform;
  readonly type: string;
  readonly cursor: string;
  activeEntity: IEntity;

  readonly workspace: Workspace;
}

export abstract class DocumentFile<T extends IEntity & IObservable> extends File implements IEntityDocument {

  public owner: IEntityDocument;

  private _entity: T;
  private _ast: IExpression;

  public get entity(): T {
    return this._entity;
  }

  onContentChange(newContent: string) {
    if (this._entity) {
      this.load();
    }
  }

  public async load() {

    // do not parse the content if it's the same as the previously parsed ast.
    // This is necessary since parts of the application hold references to entity sources when they're
    // modified. The only case where the ast should be re-parsed is when new content is coming in externally. In that case, the
    // entire ast needs to be replaced.

    const ast = !this._entity || this._entity.source.toString() !== this.content ? await this.parse(this.content) : this._entity.source;
    ast.source = this;

    const entity = this.createEntity(ast, this._dependencies.clone().register(new EntityDocumentDependency(this)));
    if (this._entity && this._entity.constructor === entity.constructor) {
      await entity.load();
      patchTreeNode(this._entity, entity);
    } else {
      const oldEntity = this._entity;
      this._entity    = entity;

      // must load after since the document entities may reference
      // back to this document for the root entity
      await entity.load();
      this._entity.observe(new BubbleBus(this));
      this.notify(new PropertyChangeAction("entity", entity, oldEntity));
    }
  }

  abstract async parse(content: string): Promise<IExpression>;
  protected abstract createEntity(ast: IExpression, dependencies: Dependencies): T;

  async update() {

    // persist change changed from the entity to the source
    this._entity.updateSource();
    this.content = this._entity.source.toString();
    await super.update();
    await this.load();
  }
}

export abstract class BaseEditorTool implements IEditorTool, IInjectable {
  abstract name: string;
  readonly cursor: string = undefined;
  constructor(readonly editor: IEditor) { }

  dispose() { }

  get workspace(): Workspace {
    return this.editor.workspace;
  }

  execute(action: Action) {
    if (this[action.type]) {
      return this[action.type](action);
    }
  }
}

export interface IHistoryItem {
  use(): void;
}