import { DatatableContentManager } from ".";
import { BitBoxGridRules, BitsContainer } from "app/shared/bit-box-grid-rules";

export class DatatableBitBoxContentManager extends DatatableContentManager<any> {
  private _gridRules: BitBoxGridRules<any>;

  constructor(
    readonly restService: any,
    readonly methodName: string,
    readonly MAXBIT: number,
    private readonly _ContainerType
  ) {
    super(restService, methodName, undefined, () => {
      this.paginator.content.forEach((originalBits: any) => {
        let originalBitsContainer: BitsContainer = new this._ContainerType(originalBits);
        
        // update en fonction de ce qu'on a déjà modifié :
        if(this._gridRules.modifiedBits.has(originalBitsContainer.getId())) {
          originalBitsContainer.setBits(this._gridRules.modifiedBits.get(originalBitsContainer.getId()).getBits());
        }

        // Copie :
        if(this._gridRules.originalBits.has(originalBitsContainer.getId())) {
          // garde
          return;
        }
        // on crée une copie des bits
        let copy: any = {};
        Object.keys(originalBits).forEach((k: string) => copy[k] = originalBits[k]);
        // qu'on conserve en tant qu'original
        let copyBitsContainer: BitsContainer = new this._ContainerType(copy);
        this._gridRules.originalBits.set(copyBitsContainer.getId(), copyBitsContainer);
      });
    });
    this._gridRules = new BitBoxGridRules<any>(this._ContainerType, MAXBIT);
  }

  get grid(): BitBoxGridRules<any> {
    return this._gridRules;
  }
}