import { DatatableContentManager } from ".";
import { BitBoxGridRules, BitsContainer } from "app/shared/bit-box-grid-rules";

export class DatatableBitBoxContentManager extends DatatableContentManager<any> {
  private _rightsGridRules: BitBoxGridRules<any>;

  constructor(
    readonly restService: any,
    readonly methodName: string,
    readonly MAXBIT: number,
    private readonly _ContainerType
  ) {
    super(restService, methodName, undefined, () => {
      this.paginator.content.forEach((originalRight: any) => {
        let bitsContainer: BitsContainer = new this._ContainerType(originalRight);
        if(this._rightsGridRules.originalBits.has(new this._ContainerType(originalRight).getId())) {
          // garde
          return;
        }
        // on crée une copie du droit
        let copy: any = {};
        Object.keys(originalRight).forEach((k: string) => copy[k] = originalRight[k]);
        // qu'on conserve en tant qu'original
        let copyBitsContainer: BitsContainer = new this._ContainerType(copy);
        this._rightsGridRules.originalBits.set(copyBitsContainer.getId(), copyBitsContainer);
      });
    });
    this._rightsGridRules = new BitBoxGridRules<any>(this._ContainerType, MAXBIT);
  }

  get grid(): BitBoxGridRules<any> {
    return this._rightsGridRules;
  }
}