export default class CustomResponse extends Error {
    public status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = this.constructor.name;
    }
}
