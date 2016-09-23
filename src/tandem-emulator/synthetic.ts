import { IPatchable, IComparable } from "tandem-common";

export enum SyntheticKind {
  Native = 1,
  Function = Native + 1,
  SymbolTable = Function + 1,
  JSXElement = SymbolTable + 1,
  JSXAttribute = JSXElement + 1,
  Object = JSXAttribute + 1
}

export interface ISynthetic extends IPatchable, IComparable {
  kind: SyntheticKind;
  get(propertyName: string): ISynthetic;
  set(propertyName: string, value: ISynthetic);
  toJSON();
}

export interface IInstantiableSynthetic extends ISynthetic {
  createInstance(args: Array<ISynthetic>): ISynthetic;
}

export interface ISyntheticFunction extends IInstantiableSynthetic {
  apply(context: ISynthetic, args?: Array<ISynthetic>): ISynthetic;
}

export interface ISyntheticValueObject extends ISynthetic {
  value: any;
}

export function mapNativeAsEntity(value: any) {
  if (value && value.kind) return value;
  switch (typeof value) {
    case "function": return new NativeFunction(value);
    case "object":
      if (Array.isArray(value)) return new ArrayEntity(value.map(mapNativeAsEntity));
      const properties = {};
      for (const propertyName in value) {
        properties[propertyName] = mapNativeAsEntity(value[propertyName]);
      }
      return new SyntheticObject(properties);
    default: return new SyntheticValueObject(value);
  }
}

export function mapEntityAsNative(value: ISynthetic) {
  switch (value.kind) {
    case SyntheticKind.Function: return mapFunctionEntityAsNative(<ISyntheticFunction>value);
    default: return (<SyntheticValueObject<any>>value).toJSON();
  }
}

function mapFunctionEntityAsNative(value: ISyntheticFunction) {
  return function(...args: Array<any>) {
    const result = (<ISyntheticFunction>value).apply(mapNativeAsEntity(this), args.map(mapNativeAsEntity));
    return mapEntityAsNative(result);
  };
}

export abstract class BaseSynthetic implements ISynthetic {
  abstract kind: SyntheticKind;
  abstract get(propertyName: string): ISynthetic;
  abstract set(propertyName: string, value: ISynthetic): void;
  abstract patch(source: ISynthetic): void;
  abstract toJSON(): Object;
  compare(value: ISynthetic) {
    return Number(this.constructor === value.constructor);
  }
}

export class SyntheticObject extends BaseSynthetic {

  kind = SyntheticKind.Object;
  constructor(protected __properties: any = {}) {
    super();
  }

  get(propertyName: string) {
    return this.__properties[propertyName];
  }

  set(propertyName: string, value: ISynthetic) {
    this.__properties[propertyName] = value;
  }

  static defineProperty(target: SyntheticObject, propertyName: string, attributes: PropertyDescriptor) {
    Object.defineProperty(target.__properties, propertyName, attributes);
  }

  static assign(target: SyntheticObject, ...from: Array<SyntheticObject>) {
    return Object.assign(target.__properties, ...from.map((object) => object.__properties));
  }

  static create(prototype: SyntheticObject) {
    return new SyntheticObject(Object.create(prototype.__properties));
  }

  patch(source: SyntheticObject) {

    // update / insert
    for (const propertyName in this.__properties) {
      const oldSyntheticValue = this.get(propertyName);
      const newSyntheticValue = source.get(propertyName);
      if (oldSyntheticValue.compare(newSyntheticValue)) {
        oldSyntheticValue.patch(newSyntheticValue);
      } else {
        this.set(propertyName, newSyntheticValue);
      }
    }

    // remove
    for (const propertyName in source.__properties) {
      const newSyntheticValue = source.get(propertyName);
      if (this.__properties[propertyName] == null) {
        this.set(propertyName, newSyntheticValue);
      }
    }
  }

  toJSON() {
    const object = {};
    for (const propertyName in this.__properties) {
      object[propertyName] = this.__properties[propertyName].toJSON();
    }
    return object;
  }
}
export class SyntheticValueObject<T> extends BaseSynthetic implements ISyntheticValueObject {
  kind = SyntheticKind.Native;
  private _vars: any;
  constructor(public value: T) {
    super();
    this._vars = {};
  }

  patch(source: SyntheticValueObject<T>) {
    this.value = source.value;
  }

  get(propertyName: string) {
    return mapNativeAsEntity(this.value[propertyName]);
  }

  set(propertyName: string, value: ISynthetic) {
    this.value[propertyName] = mapEntityAsNative(value);
  }

  // deprecated -- entities need to be serializable
  toJSON() {
    return this.value;
  }
}

export class SyntheticString extends SyntheticValueObject<string> {

}


export class SyntheticNumber extends SyntheticValueObject<number> {

}

export class ArrayEntity<T extends ISynthetic> extends SyntheticValueObject<Array<T>> {
  constructor(value: Array<T>) {
    super(value);
  }

  toJSON() {
    return this.value.map(mapEntityAsNative);
  }
}
export class NativeFunction extends SyntheticValueObject<Function> implements ISyntheticFunction {
  constructor(value: Function) {
    super(value);
  }
  apply(context: ISynthetic, args: Array<ISynthetic> = []) {
    const result = this.value.apply(mapEntityAsNative(context), args.map(mapEntityAsNative));

    // thenable
    if (result && result.then) {
      return new Promise((resolve, reject) => {
        result.then((result) => {
          resolve(mapNativeAsEntity(result));
        }, reject);
      });
    }

    return mapNativeAsEntity(result);
  }
  createInstance(args: Array<ISynthetic>) {
    const instance = new SyntheticValueObject(Object.create(this.value.prototype));
    this.apply(instance, args);
    return instance;
  }
}

export class SymbolTable extends SyntheticObject implements ISynthetic {

  kind = SyntheticKind.SymbolTable;

  constructor(private _parent?: SymbolTable) {
    super();
  }

  get(id: string) {
    return this.__properties[id] != null ? this.__properties[id] : this._parent ? this._parent.get(id) : new SyntheticValueObject(undefined);
  }

  defineVariable(id: string, value?: ISynthetic) {
    this.__properties[id] = value;
  }

  defineConstant(id: string, value: ISynthetic) {
    this.__properties[id] = value;
  }

  set(id: string, value: ISynthetic) {
    const context = this.getOwner(id);
    if (context === this) {
      this.__properties[id] = value;
    } else {
      context.set(id, value);
    }
  }

  getOwner(id: string) {
    return this.__properties.hasOwnProperty(id) ? this : this._parent ? this._parent.getOwner(id) : this;
  }

  createChild() {
    return new SymbolTable(this);
  }

  toJSON() {
    const value = {};
    for (const propertyName in this.__properties) {
      const propertyValue = <ISynthetic>this.__properties[propertyName];
      value[propertyName] = (propertyValue ? propertyValue.toJSON() : undefined);
    }
    return value;
  }
}

export class JSXElement extends SyntheticValueObject<Object> {

  kind = SyntheticKind.JSXElement;

  constructor(name: ISynthetic, attributes: ArrayEntity<ISynthetic>, children: ArrayEntity<ISynthetic>) {
    super({
      name: name,
      attributes: attributes,
      children: children
    });
  }

  toJSON() {
    return {
      name: this.value["name"].toJSON(),
      attributes: this.value["attributes"].toJSON(),
      children: this.value["children"].toJSON()
    };
  }
}

export class JSXAttributeEntity extends SyntheticValueObject<Object> {
  kind = SyntheticKind.JSXAttribute;
  constructor(name: ISynthetic, value: ISynthetic) {
    super({
      name: name,
      value: value
    });
  }

  toJSON() {
    return {
      name: this.value["name"].toJSON(),
      value: this.value["value"].toJSON()
    };
  }
}

export class JSRootSymbolTable extends SymbolTable {
  constructor(parent?: SymbolTable) {
    super(parent);
    this.defineConstant("NaN", new SyntheticValueObject(NaN));
    this.defineConstant("Infinity", new SyntheticValueObject(Infinity));
    this.defineConstant("undefined", new SyntheticValueObject(undefined));
    this.defineConstant("Object", new SyntheticValueObject(Object));
    this.defineConstant("Date", new SyntheticValueObject(Date));
    this.defineConstant("console", new SyntheticValueObject(console));
  }
}