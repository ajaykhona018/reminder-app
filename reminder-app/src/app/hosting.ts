export class Hosting {

    private static HOST_NAME = 'http://localhost:3000';
    static getUrl(append: string): string {
        return this.HOST_NAME + append;
    }
}