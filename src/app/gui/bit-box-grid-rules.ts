/***
 * Auteur : Florian
 * License : 
 */

/**
 * Conteneur de bits
 * @interface
 */
export interface BitsContainer {
  getId(): number;
  getBits(): number;
  setBits(bits: number): void;
  getContent(): any;
}

/**
 * - Classe qui permet, pour une liste de données de type T encapsulées dans des BitsContainer, de savoir pour
 *   chaque élément T de la liste quels bits sont à 1 ou 0 selon des "règles".
 * - Permet d'afficher cette liste sous forme de grille de bits à cocher/décocher
 *   (pour gérer des droits ou des rôles, par exemple)
 * - La classe contient des maps de containers : identifiant des données -> conteneur correspondant
 * @param T - type des données dans les conteneurs
 */
export class BitBoxGridRules<T> {
  
  /** Map des conteneurs sélectionnés (dans une datatable par exemple) */
  private _selectedBitsContainer: Map<number, BitsContainer> = new Map<number, BitsContainer>();

  /** Map des conteneurs qui ont été modifiés */
  private _mapModifiedBits: Map<number, BitsContainer> = new Map<number, BitsContainer>();
  
  /** Map des conteneurs à leur état original, quand la grille a été créée */
  private _mapOriginalBits: Map<number, BitsContainer> = new Map<number, BitsContainer>();

  /**
   * Entier dont chaque bit à 1 indique que les bits correspondants dans les conteneurs sélectionnés
   * doivent être mis à 1.
   */
  private _bitsMustBeChecked: number = 0;
  
  /**
   * Entier dont chaque bit à 1 indique que les bits correspondants dans les conteneurs sélectionnés
   * doivent être mis à 0.
   */
  private _bitsMustBeUnchecked: number = 0;

  /**
   * @constructor
   * @param _ContainerType - Classe des containers à utiliser pour encapsuler les données contenants les bits
   * @param {number} _MAXBITS - Entier dont le bit correspondant au bit de poids le plus fort pouvant être affecté
   * dans les containers est mis à 1.
   */
  constructor(private readonly _ContainerType, private readonly _MAXBITS: number) { }

  /**
   * Mets les bits à 1 dans bitsToAdd à 1 dans bits
   * @private
   * @static
   * @param {number} bits - Entier contenant les bits qui vont être affectés
   * @param {number} bitsToAdd - Entier dont les bits à 1 indique les bits à mettre à 1 dans bits
   * @returns {number} - bits, le résultat de l'opération
   */
  private static addBits(bits: number, bitsToAdd: number): number {
    return bits |= bitsToAdd;
  }

  /**
   * Mets les bits à 1 dans bitsToRemove à 0 dans bits
   * @private
   * @static
   * @param {number} bits - Entier contenant les bits qui vont être affectés
   * @param {number} bitsToRemove - Entier dont les bits à 1 indique les bits à mettre à 0 dans bits
   * @returns {number} - bits, le résultat de l'opération
   */
  private static removeBits(bits: number, bitsToRemove: number): number {
    return bits &= (0xffffffff - bitsToRemove);
  }

  /**
   * Mets les bits à 1 dans bitsToSet à 1 ou 0 dans bits en fonction du paramètre add : true => 1, false => 0
   * @private
   * @static
   * @param {number} bits - Entier contenant les bits qui vont être affectés
   * @param {number} bitsToSet - Entier dont les bits à 1 indique les bits à affecter dans bits
   * @param {boolean} add - true => mettre les bits à 1, false => mettre les bits à 0
   * @returns {number} - bits, le résultat de l'opération
   */
  private static setBits(bits: number, bitsToSet: number, add: boolean = true): number {
    return add ? BitBoxGridRules.addBits(bits, bitsToSet) : BitBoxGridRules.removeBits(bits, bitsToSet);
  }

  /**
   * Indique si tous les bits à 1 dans bitsToCheck sont aussi à 1 dans bits
   * @private
   * @static
   * @param {number} bits - Entier contenant les bits dont on veut vérifier l'état
   * @param {number} bitsToCheck - Entier dont les bits à 1 sont les bits qu'on veut vérifier
   * @returns {boolean} - true si les bits à 1 dans bitsToCheck sont à 1 dans bits, sinon false
   */
  private static hasBits(bits: number, bitsToCheck: number): boolean {
    return (bits & bitsToCheck) === bitsToCheck;
  }

  /** @property {Map<number, BitsContainer>} originalBits - Map des conteneurs avec les données originales  */
  get originalBits(): Map<number, BitsContainer> {
    return this._mapOriginalBits;
  }

  /** @property {Map<number, BitsContainer>} modifiedBits - Map des conteneurs ayant subi des modifications */
  get modifiedBits(): Map<number, BitsContainer> {
    return this._mapModifiedBits;
  }

  /** @property {boolean} modified - indique si la grille a été modifiée */
  get modified(): boolean {
    return this._mapModifiedBits.size > 0;
  }

  /**
   * Réinitialisation (vide les maps)
   */
  clear(): void {
    this._mapModifiedBits.clear();
    this._mapOriginalBits.clear();
  }

  /**
   * Remplace les conteneurs sélectionnés en construisant de nouveaux à partir des données passées en paramètre
   * @param {Map<number, T>} selection - Map des données sélectionnées (dans une datatable par exemple)
   */
  updateSelection(selection: Map<number, T>): void {
    this._selectedBitsContainer.clear(); // vide le map des containers sélectionnés
    
    // pour chaque élément de la sélection :
    selection.forEach((bitsContent: T, id: number) => {
      // crée un container pour cet élément et l'ajoute dans le map des containers sélectionnés
      this._selectedBitsContainer.set(id, new this._ContainerType(bitsContent));
    });

    // évalue le nouvel état des bits des containers sélectionnés :
    // (évaluation uniquement pour la sélection : ce qui n'est pas ou plus sélectionné n'est pas modifié)
    this.reEvaluateBits();
  }

  /**
   * Indique si le bitsContainer est identique à son état original ou non
   * @param {BitsContainer} bitsContainer - Le conteneur dont on veut savoir s'il est tjrs à son état original
   * @returns {boolean} true si le container est tjrs à son état original, false sinon
   */
  isSameAsOriginal(bitsContainer: BitsContainer): boolean {
    return this._mapOriginalBits.has(bitsContainer.getId()) &&
      this._mapOriginalBits.get(bitsContainer.getId()).getBits() === bitsContainer.getBits();
  }

  /**
   * Modifie le bit indiqué du container correspondant aux données bitsContent
   * @param {boolean} check - true => le bit doit etre mis à 1, false => le bit doit être mis à 0 
   * @param {T} bitsContent - données dont les bits doivent être modifiés
   * @param {number} bit - Entier dont le ou les bits à 1 indique les bits à modifier 
   * @param {boolean} itemChecked - indique si la donnée est sélectionnée ou pas
   */
  setBit(check: boolean, bitsContent: T, bit: number, itemChecked: boolean): void {   
    // Crée un container qui va contenir les modifications pour cette donnée :
    let bitsContainer: BitsContainer = new this._ContainerType(bitsContent);

    // ajout ou suppression du ou des bits
    bitsContainer.setBits(BitBoxGridRules.setBits(bitsContainer.getBits(), bit, check));

    if (itemChecked && check) { 
      // Ce(s) bit(s) dans les containers sélectionnés ne doit plus forcément être à 0, on vient d'en mettre un à 1
      this._bitsMustBeUnchecked = BitBoxGridRules.removeBits(this._bitsMustBeUnchecked, bit);
    }
    else if (itemChecked && ! check) {
      // Ce(s) bit(s) dans les containers sélectionnés ne doit plus forcément être à 1, on vient d'en mettre un à 0
      this._bitsMustBeChecked = BitBoxGridRules.removeBits(this._bitsMustBeChecked, bit);
    }

    // Mise à jour de la grille en fonction des modifications contenues dans le container qu'on vient de créer
    this.updateBits(bitsContainer);
  }

  /**
   * Mets tous les bits des containers sélectionnés correspondant aux bits à 1 du paramètre bit à 1 ou 0
   * en fonction de check
   * @param {boolean} check - true => mettre les bits à 1, false => mettre les bits à 0 
   * @param {number} bit - Entier dont les bits à 1 indiquent les bits à modifier dans les containers 
   */
  setSelectedColBit(check: boolean, bit: number): void {
    // modifie ce qu'il faut dans les entiers de règle des containers sélectionnés
    this._bitsMustBeChecked = BitBoxGridRules.setBits(this._bitsMustBeChecked, bit, check);
    this._bitsMustBeUnchecked = BitBoxGridRules.setBits(this._bitsMustBeChecked, bit, ! check);

    // réévalue les bits des containers sélectionnés
    this.reEvaluateBits();
  }

  /**
   * Indique si les bits des conteneurs sélectionnés doivent être à 1
   * @param {number} bits - Entier dont les bits à 1 sont les bits à tester
   * @returns {boolean} - true si les bits doivent être à 1, sinon false 
   */
  bitsColMustBeChecked(bits: number): boolean {
    return BitBoxGridRules.hasBits(this._bitsMustBeChecked, bits);
  }

  /**
   * Indique si les bits des conteneurs sélectionnés doivent être à 0
   * @param {number} bits - Entier dont les bits à 1 sont les bits à tester
   * @returns {boolean} - true si les bits doivent être à 0, sinon false 
   */
  bitsColMustBeUnchecked(bits: number): boolean {
    return BitBoxGridRules.hasBits(this._bitsMustBeUnchecked, bits);
  }

  /**
   * Indique si le(s) bit(s) des containers sélectionnés sont obligatoirement à 1 ou à 0
   * @param {number} bit - Entier dont les bits à 1 sont les bits à tester
   * @returns {boolean} true => doivent être à 1, false => doivent être à 0, undefined => pas d'obligation 
   */
  bitColChecked(bit: number): boolean {
    let check: boolean = this.bitsColMustBeChecked(bit);
    let uncheck: boolean = this.bitsColMustBeUnchecked(bit);
    if (! check && ! uncheck) {
      // ne doivent ni être check (1), ni uncheck (0) => undefined 
      return undefined;
    }
    return check;
  }

  /**
   * Indique si le(s) bit(s) des containers sont obligatoirement à 1 ou non
   * @param {number} bit - Entier dont les bits à 1 sont les bits à tester
   * @returns {boolean} - true si obligatoirement à 1, sinon false
   */
  isBitColChecked(bit: number): boolean {
    return (this.bitColChecked(bit) === true);
  }

  /**
   * Met à jour le map des containers modifiés en fonction des modifications contenues dans le bitsContainer
   * @param {BitsContainer} bitsContainer - container modifié
   */
  updateBits(bitsContainer: BitsContainer): void {
    if (! this.isSameAsOriginal(bitsContainer)) {
      // un droit a été modifié : ajouter l'état actuel aux modifiés
      this._mapModifiedBits.set(bitsContainer.getId(), bitsContainer);
    }
    else if (this.isSameAsOriginal(bitsContainer) && this._mapModifiedBits.has(bitsContainer.getId())) {
      // un droit est revenu à son état original : le supprimer de la liste des modifiés
      this._mapModifiedBits.delete(bitsContainer.getId());
    }
  }

  /**
   * Réévalue les bits du container
   * @param {BitsContainer} bitsContainer - le container dont les bits doivent être réévalués 
   * @param bit 
   */
  reEvaluateBit(bitsContainer: BitsContainer, bit: number): void {
    let colChecked: boolean = this.bitColChecked(bit);
    if(colChecked == undefined) {
      // garde : pas besoin de réévaluer si le statut global pour les sélections de ce bit est undefined
      return;
    }
    
    // modifie les bits dans le container
    bitsContainer.setBits(BitBoxGridRules.setBits(bitsContainer.getBits(), bit, colChecked));   
    // Met à jour le map des containers modifiés
    this.updateBits(bitsContainer);
  }

  /**
   * Réévalue les bits des containers sélectionnés
   */
  reEvaluateBits(): void {  
    setTimeout(() => { // Timeout pour retarder le changeDetection (sert juste à éviter un warning)
      this._selectedBitsContainer.forEach((bitsContainer: BitsContainer, id: number) => {
        for (let bit: number = this._MAXBITS; bit >= 1; bit >>= 1) {
          this.reEvaluateBit(bitsContainer, bit);
        }
        this.reEvaluateBit(bitsContainer, this._MAXBITS * 2 - 1);
      });
      
      // On a réévalué ce qu'il fallait, il n'y a donc plus rien à décocher (mettre à 0)
      this._bitsMustBeUnchecked = 0;
    }, 0);
  }

  /**
   * Indique si les données ont tous les bits passés en paramètre à 1 ou non
   * @param {T} bitsContent - donnée dont les bits doivent être testés
   * @param {number} bits - Entier dont les bits à 1 sont les bits à tester
   * @returns {boolean} 
   */
  isBitBoxChecked(bitsContent: T, bits: number): boolean {
    return BitBoxGridRules.hasBits(new this._ContainerType(bitsContent).getBits(), bits);
  }
  
}