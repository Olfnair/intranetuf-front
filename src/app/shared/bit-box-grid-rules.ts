import { MdCheckboxChange } from "@angular/material";

export interface BitsContainer {
  getId(): number;
  getBits(): number;
  setBits(bits: number);
  getContent(): any;
}

export class BitBoxGridRules<T> {
  private _selectedBitsContainer: Map<number, BitsContainer> = new Map<number, BitsContainer>();

  private _mapModifiedBits: Map<number, BitsContainer> = new Map<number, BitsContainer>();
  private _mapOriginalBits: Map<number, BitsContainer> = new Map<number, BitsContainer>();

  private _bitsMustBeChecked: number = 0;
  private _bitsMustBeUnchecked: number = 0;

  constructor(private readonly _ContainerType, private readonly _MAXBITS: number) { }

  private static addBits(bits: number, bitsToAdd: number): number {
    return bits |= bitsToAdd;
  }

  private static removeBits(bits: number, bitsToRemove: number): number {
    return bits &= (0xffffffff - bitsToRemove);
  }

  private static setBits(bits: number, bitsToSet: number, add: boolean = true): number {
    return add ? BitBoxGridRules.addBits(bits, bitsToSet) : BitBoxGridRules.removeBits(bits, bitsToSet);
  }

  private static hasBits(bits: number, bitsToCheck: number): boolean {
    return (bits & bitsToCheck) === bitsToCheck;
  }

  get originalBits(): Map<number, BitsContainer> {
    return this._mapOriginalBits;
  }

  get modifiedBits(): Map<number, BitsContainer> {
    return this._mapModifiedBits;
  }

  get modified(): boolean {
    return this._mapModifiedBits.size > 0;
  }

  clear(): void {
    this._mapModifiedBits.clear();
    this._mapOriginalBits.clear();
  }

  updateSelection(selection: Map<number, T>): void {
    this._selectedBitsContainer.clear();
    selection.forEach((bitsContent: T, id: number) => {
      this._selectedBitsContainer.set(id, new this._ContainerType(bitsContent));
    });
    this.reEvaluateBits();
  }

  isSameAsOriginal(bitsContainer: BitsContainer): boolean {
    return this._mapOriginalBits.has(bitsContainer.getId()) &&
      this._mapOriginalBits.get(bitsContainer.getId()).getBits() === bitsContainer.getBits();
  }

  setBit(event: MdCheckboxChange, bitsContent: T, bit: number, itemChecked: boolean): void {
    let bitsContainer: BitsContainer = new this._ContainerType(bitsContent);
    if (event.checked) { // droit positif
      bitsContainer.setBits(bitsContainer.getBits() | bit)
      if(itemChecked) {
        this._bitsMustBeUnchecked = BitBoxGridRules.removeBits(this._bitsMustBeUnchecked, bit);
      }
    }
    else { // droit negatif
      bitsContainer.setBits(bitsContainer.getBits() & (0xffffffff - bit));
      if(itemChecked) {
        this._bitsMustBeChecked = BitBoxGridRules.removeBits(this._bitsMustBeChecked, bit);
      }
    }
    this.updateBits(bitsContainer);
  }

  setSelectedColBit(event: MdCheckboxChange, right: number): void {
    if(event.checked) {
      this._bitsMustBeChecked = BitBoxGridRules.addBits(this._bitsMustBeChecked, right);
      this._bitsMustBeUnchecked = BitBoxGridRules.removeBits(this._bitsMustBeUnchecked, right);
    }
    else {
      this._bitsMustBeUnchecked = BitBoxGridRules.addBits(this._bitsMustBeUnchecked, right);
      this._bitsMustBeChecked = BitBoxGridRules.removeBits(this._bitsMustBeChecked, right);
    }
    this.reEvaluateBits();
  }

  bitsColMustBeChecked(bits: number): boolean {
    return BitBoxGridRules.hasBits(this._bitsMustBeChecked, bits);
  }

  bitsColMustBeUnchecked(bits: number): boolean {
    return BitBoxGridRules.hasBits(this._bitsMustBeUnchecked, bits);
  }

  // utilisé pour faire les mises à jour
  bitColChecked(right: number): boolean {
    let check: boolean = this.bitsColMustBeChecked(right);
    let uncheck: boolean = this.bitsColMustBeUnchecked(right);
    if(! check && ! uncheck) {
      return undefined;
    }
    return check ? true : false;
  }

  // utlisé pour afficher la case
  isBitColChecked(bit: number): boolean {
    if(this.bitColChecked(bit) === true) {
      return true;
    }
    return false;
  }

  updateBits(bitsContainer: BitsContainer): void {
    // un droit a été modifié : ajouter l'état actuel aux modifiés
    if (! this.isSameAsOriginal(bitsContainer)) {
      this._mapModifiedBits.set(bitsContainer.getId(), bitsContainer);
    }
    // un doit est revenu à son état original : le supprimer de la liste des modifiés
    else if (this.isSameAsOriginal(bitsContainer) && this._mapModifiedBits.has(bitsContainer.getId())) {
      this._mapModifiedBits.delete(bitsContainer.getId());
    }
  }

  reEvaluateBit(bitsContainer: BitsContainer, bit: number): void {
    let colChecked: boolean = this.bitColChecked(bit);
    if (colChecked != undefined) {
      bitsContainer.setBits(BitBoxGridRules.setBits(bitsContainer.getBits(), bit, colChecked ? true : false));
    }
    this.updateBits(bitsContainer);
  }

  reEvaluateBits(): void {
    setTimeout(() => {
      this._selectedBitsContainer.forEach((bitsContainer: BitsContainer, id: number) => {
        for(let bit: number = this._MAXBITS; bit >= 1; bit >>= 1) {
          this.reEvaluateBit(bitsContainer, bit);
        }
        this.reEvaluateBit(bitsContainer, this._MAXBITS * 2 - 1);
      });
      // on a déselectionné ce qu'il fallait et il ne faudra plus déselectionner à l'avenir :
      this._bitsMustBeUnchecked = 0;
    }, 0);
  }

  isBitBoxChecked(bitsContent: T, bits: number): boolean {
    return BitBoxGridRules.hasBits(new this._ContainerType(bitsContent).getBits(), bits);
  }
}