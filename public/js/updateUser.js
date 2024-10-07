import axios from 'axios';
import { showAlert } from './alert'

export const updateUser = async (data, type) => {
    try {
        const url = type === 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/updateMe'
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
        showAlert('error', err.message)

    }
}
