import * as sift from "sift";
import { kebabCase, camelCase } from "lodash";
import { ISerializable, Action, serializable, diffArray, ITreeWalker } from "@tandem/common";
import { SetKeyValueEditAction, IContentEdit, ApplicableEditAction, ISyntheticObject, generateSyntheticUID, IEditable, BaseContentEdit } from "@tandem/sandbox";

export interface ISerializedSyntheticCSSStyleDeclaration extends SyntheticCSSStyleDeclaration { }

const invalidKeyFilter = sift({ $and: [ { $ne: /^\$/ }, {$ne: "uid" }] });

export class SyntheticCSSStyleDeclarationEdit extends BaseContentEdit<SyntheticCSSStyleDeclaration> {

  static readonly SET_CSS_STYLE_DECLARATION_EDIT = "setCSSStyleDeclarationEdit";

  setDeclaration(name: string, value: string) {
    this.addAction(new SetKeyValueEditAction(SyntheticCSSStyleDeclarationEdit.SET_CSS_STYLE_DECLARATION_EDIT, this.target, name, value));
  }

  addDiff(newStyleDeclaration: SyntheticCSSStyleDeclaration) {

    const oldKeys = Object.keys(this.target).filter(invalidKeyFilter as any);
    const newKeys = Object.keys(newStyleDeclaration).filter(invalidKeyFilter as any);

    diffArray(oldKeys, newKeys, (a, b) => {
      return a === b ? 0 : -1;
    }).accept({
      visitInsert: ({ value }) => {
        this.setDeclaration(value, newStyleDeclaration[value]);
      },
      visitRemove: ({ index }) => {

        // don't apply a move edit if the value doesn't exist.
        if (this.target[oldKeys[index]]) {
          this.setDeclaration(oldKeys[index], undefined);
        }
      },
      visitUpdate: ({ originalOldIndex, newValue }) => {
        if (this.target[newValue] !== newStyleDeclaration[newValue]) {
          this.setDeclaration(newValue, newStyleDeclaration[newValue]);
        }
      }
    });

    return this;
  }
}

@serializable()
export class SyntheticCSSStyleDeclaration implements ISerializable<ISerializedSyntheticCSSStyleDeclaration>, ISyntheticObject, IEditable {

  public $uid: any;
  public $source: any = null;

  public alignContent: string | null;
  public alignItems: string | null;
  public alignSelf: string | null;
  public alignmentBaseline: string | null;
  public animation: string | null;
  public animationDelay: string | null;
  public animationDirection: string | null;
  public animationDuration: string | null;
  public animationFillMode: string | null;
  public animationIterationCount: string | null;
  public animationName: string | null;
  public animationPlayState: string | null;
  public animationTimingFunction: string | null;
  public backfaceVisibility: string | null;
  public background: string | null;
  public backgroundAttachment: string | null;
  public backgroundClip: string | null;
  public backgroundColor: string | null;
  public backgroundImage: string | null;
  public backgroundOrigin: string | null;
  public backgroundPosition: string | null;
  public backgroundPositionX: string | null;
  public backgroundPositionY: string | null;
  public backgroundRepeat: string | null;
  public backgroundSize: string | null;
  public baselineShift: string | null;
  public border: string | null;
  public borderBottom: string | null;
  public borderBottomColor: string | null;
  public borderBottomLeftRadius: string | null;
  public borderBottomRightRadius: string | null;
  public borderBottomStyle: string | null;
  public borderBottomWidth: string | null;
  public borderCollapse: string | null;
  public borderColor: string | null;
  public borderImage: string | null;
  public borderImageOutset: string | null;
  public borderImageRepeat: string | null;
  public borderImageSlice: string | null;
  public borderImageSource: string | null;
  public borderImageWidth: string | null;
  public borderLeft: string | null;
  public borderLeftColor: string | null;
  public borderLeftStyle: string | null;
  public borderLeftWidth: string | null;
  public borderRadius: string | null;
  public borderRight: string | null;
  public borderRightColor: string | null;
  public borderRightStyle: string | null;
  public borderRightWidth: string | null;
  public borderSpacing: string | null;
  public borderStyle: string | null;
  public borderTop: string | null;
  public borderTopColor: string | null;
  public borderTopLeftRadius: string | null;
  public borderTopRightRadius: string | null;
  public borderTopStyle: string | null;
  public borderTopWidth: string | null;
  public borderWidth: string | null;
  public bottom: string | null;
  public boxShadow: string | null;
  public boxSizing: string | null;
  public breakAfter: string | null;
  public breakBefore: string | null;
  public breakInside: string | null;
  public captionSide: string | null;
  public clear: string | null;
  public clip: string | null;
  public clipPath: string | null;
  public clipRule: string | null;
  public color: string | null;
  public colorInterpolationFilters: string | null;
  public columnCount: any;
  public columnFill: string | null;
  public columnGap: any;
  public columnRule: string | null;
  public columnRuleColor: any;
  public columnRuleStyle: string | null;
  public columnRuleWidth: any;
  public columnSpan: string | null;
  public columnWidth: any;
  public columns: string | null;
  public content: string | null;
  public counterIncrement: string | null;
  public counterReset: string | null;
  public cssFloat: string | null;
  public cursor: string | null;
  public direction: string | null;
  public display: string | null;
  public dominantBaseline: string | null;
  public emptyCells: string | null;
  public enableBackground: string | null;
  public fill: string | null;
  public fillOpacity: string | null;
  public fillRule: string | null;
  public filter: string | null;
  public flex: string | null;
  public flexBasis: string | null;
  public flexDirection: string | null;
  public flexFlow: string | null;
  public flexGrow: string | null;
  public flexShrink: string | null;
  public flexWrap: string | null;
  public floodColor: string | null;
  public floodOpacity: string | null;
  public font: string | null;
  public fontFamily: string | null;
  public fontFeatureSettings: string | null;
  public fontSize: string | null;
  public fontSizeAdjust: string | null;
  public fontStretch: string | null;
  public fontStyle: string | null;
  public fontVariant: string | null;
  public fontWeight: string | null;
  public glyphOrientationHorizontal: string | null;
  public glyphOrientationVertical: string | null;
  public height: string | null;
  public imeMode: string | null;
  public justifyContent: string | null;
  public kerning: string | null;
  public left: string | null;
  readonly length: number;
  public letterSpacing: string | null;
  public lightingColor: string | null;
  public lineHeight: string | null;
  public listStyle: string | null;
  public listStyleImage: string | null;
  public listStylePosition: string | null;
  public listStyleType: string | null;
  public margin: string | null;
  public marginBottom: string | null;
  public marginLeft: string | null;
  public marginRight: string | null;
  public marginTop: string | null;
  public marker: string | null;
  public markerEnd: string | null;
  public markerMid: string | null;
  public markerStart: string | null;
  public mask: string | null;
  public maxHeight: string | null;
  public maxWidth: string | null;
  public minHeight: string | null;
  public minWidth: string | null;
  public msContentZoomChaining: string | null;
  public msContentZoomLimit: string | null;
  public msContentZoomLimitMax: any;
  public msContentZoomLimitMin: any;
  public msContentZoomSnap: string | null;
  public msContentZoomSnapPoints: string | null;
  public msContentZoomSnapType: string | null;
  public msContentZooming: string | null;
  public msFlowFrom: string | null;
  public msFlowInto: string | null;
  public msFontFeatureSettings: string | null;
  public msGridColumn: any;
  public msGridColumnAlign: string | null;
  public msGridColumnSpan: any;
  public msGridColumns: string | null;
  public msGridRow: any;
  public msGridRowAlign: string | null;
  public msGridRowSpan: any;
  public msGridRows: string | null;
  public msHighContrastAdjust: string | null;
  public msHyphenateLimitChars: string | null;
  public msHyphenateLimitLines: any;
  public msHyphenateLimitZone: any;
  public msHyphens: string | null;
  public msImeAlign: string | null;
  public msOverflowStyle: string | null;
  public msScrollChaining: string | null;
  public msScrollLimit: string | null;
  public msScrollLimitXMax: any;
  public msScrollLimitXMin: any;
  public msScrollLimitYMax: any;
  public msScrollLimitYMin: any;
  public msScrollRails: string | null;
  public msScrollSnapPointsX: string | null;
  public msScrollSnapPointsY: string | null;
  public msScrollSnapType: string | null;
  public msScrollSnapX: string | null;
  public msScrollSnapY: string | null;
  public msScrollTranslation: string | null;
  public msTextCombineHorizontal: string | null;
  public msTextSizeAdjust: any;
  public msTouchAction: string | null;
  public msTouchSelect: string | null;
  public msUserSelect: string | null;
  public msWrapFlow: string;
  public msWrapMargin: any;
  public msWrapThrough: string;
  public opacity: string | null;
  public order: string | null;
  public orphans: string | null;
  public outline: string | null;
  public outlineColor: string | null;
  public outlineStyle: string | null;
  public outlineWidth: string | null;
  public overflow: string | null;
  public overflowX: string | null;
  public overflowY: string | null;
  public padding: string | null;
  public paddingBottom: string | null;
  public paddingLeft: string | null;
  public paddingRight: string | null;
  public paddingTop: string | null;
  public pageBreakAfter: string | null;
  public pageBreakBefore: string | null;
  public pageBreakInside: string | null;
  public perspective: string | null;
  public perspectiveOrigin: string | null;
  public pointerEvents: string | null;
  public position: string | null;
  public quotes: string | null;
  public right: string | null;
  public rubyAlign: string | null;
  public rubyOverhang: string | null;
  public rubyPosition: string | null;
  public stopColor: string | null;
  public stopOpacity: string | null;
  public stroke: string | null;
  public strokeDasharray: string | null;
  public strokeDashoffset: string | null;
  public strokeLinecap: string | null;
  public strokeLinejoin: string | null;
  public strokeMiterlimit: string | null;
  public strokeOpacity: string | null;
  public strokeWidth: string | null;
  public tableLayout: string | null;
  public textAlign: string | null;
  public textAlignLast: string | null;
  public textAnchor: string | null;
  public textDecoration: string | null;
  public textIndent: string | null;
  public textJustify: string | null;
  public textKashida: string | null;
  public textKashidaSpace: string | null;
  public textOverflow: string | null;
  public textShadow: string | null;
  public textTransform: string | null;
  public textUnderlinePosition: string | null;
  public top: string | null;
  public touchAction: string | null;
  public transform: string | null;
  public transformOrigin: string | null;
  public transformStyle: string | null;
  public transition: string | null;
  public transitionDelay: string | null;
  public transitionDuration: string | null;
  public transitionProperty: string | null;
  public transitionTimingFunction: string | null;
  public unicodeBidi: string | null;
  public verticalAlign: string | null;
  public visibility: string | null;
  public webkitAlignContent: string | null;
  public webkitAlignItems: string | null;
  public webkitAlignSelf: string | null;
  public webkitAnimation: string | null;
  public webkitAnimationDelay: string | null;
  public webkitAnimationDirection: string | null;
  public webkitAnimationDuration: string | null;
  public webkitAnimationFillMode: string | null;
  public webkitAnimationIterationCount: string | null;
  public webkitAnimationName: string | null;
  public webkitAnimationPlayState: string | null;
  public webkitAnimationTimingFunction: string | null;
  public webkitAppearance: string | null;
  public webkitBackfaceVisibility: string | null;
  public webkitBackgroundClip: string | null;
  public webkitBackgroundOrigin: string | null;
  public webkitBackgroundSize: string | null;
  public webkitBorderBottomLeftRadius: string | null;
  public webkitBorderBottomRightRadius: string | null;
  public webkitBorderImage: string | null;
  public webkitBorderRadius: string | null;
  public webkitBorderTopLeftRadius: string | null;
  public webkitBorderTopRightRadius: string | null;
  public webkitBoxAlign: string | null;
  public webkitBoxDirection: string | null;
  public webkitBoxFlex: string | null;
  public webkitBoxOrdinalGroup: string | null;
  public webkitBoxOrient: string | null;
  public webkitBoxPack: string | null;
  public webkitBoxSizing: string | null;
  public webkitColumnBreakAfter: string | null;
  public webkitColumnBreakBefore: string | null;
  public webkitColumnBreakInside: string | null;
  public webkitColumnCount: any;
  public webkitColumnGap: any;
  public webkitColumnRule: string | null;
  public webkitColumnRuleColor: any;
  public webkitColumnRuleStyle: string | null;
  public webkitColumnRuleWidth: any;
  public webkitColumnSpan: string | null;
  public webkitColumnWidth: any;
  public webkitColumns: string | null;
  public webkitFilter: string | null;
  public webkitFlex: string | null;
  public webkitFlexBasis: string | null;
  public webkitFlexDirection: string | null;
  public webkitFlexFlow: string | null;
  public webkitFlexGrow: string | null;
  public webkitFlexShrink: string | null;
  public webkitFlexWrap: string | null;
  public webkitJustifyContent: string | null;
  public webkitOrder: string | null;
  public webkitPerspective: string | null;
  public webkitPerspectiveOrigin: string | null;
  public webkitTapHighlightColor: string | null;
  public webkitTextFillColor: string | null;
  public webkitTextSizeAdjust: any;
  public webkitTransform: string | null;
  public webkitTransformOrigin: string | null;
  public webkitTransformStyle: string | null;
  public webkitTransition: string | null;
  public webkitTransitionDelay: string | null;
  public webkitTransitionDuration: string | null;
  public webkitTransitionProperty: string | null;
  public webkitTransitionTimingFunction: string | null;
  public webkitUserModify: string | null;
  public webkitUserSelect: string | null;
  public webkitWritingMode: string | null;
  public whiteSpace: string | null;
  public widows: string | null;
  public width: string | null;
  public wordBreak: string | null;
  public wordSpacing: string | null;
  public wordWrap: string | null;
  public writingMode: string | null;
  public zIndex: string | null;
  public zoom: string | null;

  constructor() {
    this.$uid = generateSyntheticUID();
  }

  clone() {
    const clone = new SyntheticCSSStyleDeclaration();
    clone.deserialize(this);
    clone.$uid = this.$uid;
    return clone;
  }

  get uid(): any {
    return this.$uid;
  }

  createEdit() {
    return new SyntheticCSSStyleDeclarationEdit(this);
  }

  applyEditAction(action: SetKeyValueEditAction) {
    action.applyTo(this);
  }

  equalTo(declaration: SyntheticCSSStyleDeclaration) {
    function compare(a, b) {
      for (const key in a) {
        if (invalidKeyFilter(key)) continue;
        if (a[key] !== b[key]) {
          return false;
        }
      }
      return true;
    }
    return compare(this, declaration) && compare(declaration, this);
  }

  get cssText() {
    const buffer = [];

    for (const key in this) {
      if (!invalidKeyFilter(key)) continue;
      const value = this[key];
      if (value) {
        buffer.push(kebabCase(key), ":", value, ";");
      }
    }

    return buffer.join("");
  }

  toString() {
    return this.cssText;
  }

  serialize(): ISerializedSyntheticCSSStyleDeclaration {
    return Object.assign({}, this);
  }

  deserialize(value: ISerializedSyntheticCSSStyleDeclaration) {
    Object.assign(this, value);
  }

  clearAll() {
    for (const key in this) {
      this[key] = "";
    }
  }

  static fromString(source: string) {
    const decl = new SyntheticCSSStyleDeclaration();
    const items = source.split(";");
    for (let i = 0, n = items.length; i < n; i++) {
      const expr = items[i];
      const [name, value] = expr.split(":");
      if (!name || !value) continue;
      decl[camelCase(name.trim())] = value.trim();
    }
    return decl;
  }

  static fromObject(declaration: any): SyntheticCSSStyleDeclaration {
    return Object.assign(new SyntheticCSSStyleDeclaration(), declaration);
  }

  visitWalker(walker: ITreeWalker) { }
}
