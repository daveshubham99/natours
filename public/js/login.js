import axios from 'axios';
import { showAlert } from './alert'

export const login = async (email, password) => {
    try {
        console.log('redirecting to login')
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        if (res.data.status === 'success') {
            showAlert('success', 'logged in successfully')
            window.setTimeout(() => {
                location.assign('/')
            }, 1500)
        }
        console.log(res)
    }
    catch (err) {
        showAlert('error', err.response.data.message)
        console.log(err.message)
    }

}

export const logout = async () => {
    try {
        console.log('in logout')
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',

        })

        console.log(res.data.message, res)
        if (res.data.message === 'success') {
            showAlert('success', 'logged out successfully')
            location.reload(true)
        }
    }
    catch (err) {
        showAlert('error', err.response.data.message)
        console.log(err.message)
    }
}
