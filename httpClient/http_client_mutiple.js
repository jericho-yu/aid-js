import axios from 'axios';

class MultipleHttpClient {
    constructor() {
        this.clients = [];
    }

    async add(client) {
        this.clients.push(client);
        return this;
    }

    async setClients(clients) {
        this.clients = clients;
        return this;
    }

    async send() {
        const promises = this.clients.map(client => client.send());
        await Promise.all(promises);
        return this;
    }

    async getClients() {
        return this.clients;
    }
}

// Example usage
(async () => {
    const client1 = new HttpClient('GET', 'https://jsonplaceholder.typicode.com/posts/1');
    const client2 = new HttpClient('GET', 'https://jsonplaceholder.typicode.com/posts/2');

    const multipleHttpClient = new MultipleHttpClient();
    multipleHttpClient.add(client1).add(client2);

    await multipleHttpClient.send();

    multipleHttpClient.getClients().forEach(client => {
        if (client.error) {
            console.error(`Error: ${client.error}`);
        } else {
            console.log(`Response: ${client.response.data}`);
        }
    });
})();