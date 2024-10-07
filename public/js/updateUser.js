import axios from 'axios';
import { showAlert } from './alert'

export const updateUser = async (data, type) => {
    try {
        const url = type === 'password' ? 'http://127.0.0.1:3000/api/v1/users/updatePassword' : 'http://127.0.0.1:3000/api/v1/users/updateMe'
        console.log('you have come to update user')
        const updatedUser = await axios({
            method: 'PATCH',
            url,                //api/v1/users/updateMe
            data
        })
        if (updatedUser) {
            showAlert('success', 'updated password')
        }
        return updatedUser;

    } catch (err) {
        console.log(err)
    }
}
