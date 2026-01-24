import { Client, Account, Databases, Avatars } from 'react-native-appwrite';

const client = new Client()
    .setProject("69676fd2001b570962bd")
    .setEndpoint("https://fra.cloud.appwrite.io/v1");

export { client };
export const account = new Account(client);
export const databases = new Databases(client);
export const avatars = new Avatars(client);
