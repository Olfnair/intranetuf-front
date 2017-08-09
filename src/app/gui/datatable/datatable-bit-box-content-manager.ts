import { DatatableContentManager } from ".";
import { BitBoxGridRules, BitsContainer } from "../bit-box-grid-rules";

export class DatatableBitBoxContentManager<T, RestService> extends DatatableContentManager<T, RestService> {
  private _gridRules: BitBoxGridRules<T>;

  constructor(
    readonly restService: RestService,
    readonly methodName: string,
    readonly MAXBIT: number,
    private readonly _ContainerType
  ) {
    super(restService, methodName, undefined, () => {
      this.paginator.content.forEach((originalBits: T) => {
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

  get grid(): BitBoxGridRules<T> {
    return this._gridRules;
  }
}