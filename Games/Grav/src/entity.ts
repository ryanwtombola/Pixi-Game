export default abstract class Entity {

    abstract Start(): void;
    abstract Update(delta: number, time: number): void;
}