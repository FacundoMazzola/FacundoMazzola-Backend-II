import { UserModel } from "../dao/models/user.model.js";

export default class UserRepository {

    getByEmail = async (email) => {
        return await UserModel.findOne({ email });
    };

    create = async (userData) => {
        return await UserModel.create(userData);
    };

    getById = async (id) => {
        return await UserModel.findById(id);
    };
}