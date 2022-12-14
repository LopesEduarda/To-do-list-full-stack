import { InputUser, UserLogin } from './../types/types';
import { HashManager } from './../services/hashManager';
import { UserDataBase } from './../data/UserDataBase';
import Authenticator from '../services/authenticator';
import { generateId } from '../services/idGenerator';
export class UserBusiness {

    async createUser(user: InputUser) {
        try {
            if (!user.email || !user.password) {
                throw new Error("Please, fill all the fields!")
            }
            // verificando se todos os campos necessários para a criação de um novo usuário foi preenchido.
            if (user.email.indexOf("@") === -1) {
                throw new Error("Invalid Email!")
            }
            // verificando se o email possui o formato correto contendo um @.
            if (user.password.length < 6) {
                throw new Error("Password must have at least 6 characters!")
            }
            // não é possível criar uma senha com menos de 6 caracteres.
            const id = generateId();
            // gerando o id automático para o novo usuário que está sendo criado.
            const newHash = new HashManager()
            const hashPassword = newHash.createHash(user.password)
            // salvando a senha no banco de dados já criptografada.

            const newUserDataBase = new UserDataBase()
            await newUserDataBase.createUser(id, user.email, hashPassword);
            // inserindo o novo usuário no banco de dados.
            const token = new Authenticator().generateToken({
                id: id
            })
            // gerando o token conforme o usuário.
            return token
        } catch (error: any) {
            throw new Error(error.message || "Error creating user. Please check your system administrator.");
        }
    }


    async login(user: UserLogin) {
        try {

            const userData = {
                email: user.email,
                password: user.password
            };

            const loginUser = await new UserDataBase().login(userData.email);
            console.log(loginUser)
            const hashManager: HashManager = new HashManager()

            const compareResult = hashManager.compareHash(
                userData.password,
                loginUser.password
            );
            // comparando a senha do meu banco de dados com a senha que foi enviada no body da requisição pelo usuário.

            if (!compareResult) {
                throw new Error("Invalid credentials!");
            }
            // validação da comparação das senhas: a do banco de dados com a que foi enviada no body da requisição pelo usuário.

            const newAuthenticator = new Authenticator()
            const token = newAuthenticator.generateToken({
                id: loginUser.id
            })

            return token

        } catch (error: any) {
            throw new Error(error.message || "Error to login. Please check your system administrator.");
        }
    }

}