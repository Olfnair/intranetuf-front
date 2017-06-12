export class Project {
    public id: number;
    public name: string;
    public active: boolean;

    constructor(name: string) {
        this.name = name;
        this.id = undefined;
        this.active = undefined;
    }
}
