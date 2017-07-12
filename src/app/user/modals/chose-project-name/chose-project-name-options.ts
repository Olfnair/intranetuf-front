export class ChoseProjectNameOptions {
  public title: string = 'Choix du nom du projet';
  public errorText: string = 'Veuillez indiquer le nom du projet';
  public submitText: string = 'Valider';
  public cancelText: string = 'Annuler';

  constructor(options: ChoseProjectNameOptions = undefined) {
    if(options) {
      this.copy(options);
    }
  }

  private copy(options: ChoseProjectNameOptions): void {
    Object.keys(this).forEach((key: string) => {
      if(options[key]) {
        this[key] = options[key];
      }
    });
  }
}