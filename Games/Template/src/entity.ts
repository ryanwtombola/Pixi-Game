import { stage } from "./app";

export class Entity extends PIXI.Container {

    public name: string;
    public components: Component[] = [];

    constructor(name: string) {
        super();
        this.name = name;
        stage.addChild(this);
    }

    Start(): void {
        this.components.forEach(component => {
            component.Start();
        });
    }

    Update(delta: number, time: number): void {
        this.components.forEach(component => {
            component.Update(delta, time);
        });
    }
}

export abstract class Component {

    public entity: Entity; 

    constructor(entity: Entity) {
        this.entity = entity;
    }

    abstract Start(): void;
    abstract Update(delta: number, time: number): void;
}