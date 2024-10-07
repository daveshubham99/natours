import { login, logout } from './login'
import '@babel/polyfill'
import { displayMap } from './map'
import { updateUser } from './updateUser.js'
import { bookTour } from './stripe.js'


const loginForm = document.querySelector('.form--login');
const mapBox = document.getElementById('map');
const isLoggedOut = document.querySelector('.nav__el--logout');
const updateUserForm = document.querySelector('.form-submit');
const updatePasswordForm = document.querySelector('.form-updatePassword');
const bookTourForm = document.querySelector('#book-btn');


if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations)
    displayMap(locations)
}


if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password);
    }
    )
}

if (isLoggedOut) {
    isLoggedOut.addEventListener('click', logout)
}
if (updateUserForm) {
    console.log('hey update user')
    updateUserForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        // console.log(getElementById('photo').files[0])
        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0])
        // const email = document.getElementById('email').value;
        //const name = document.getElementById('name').value;

        updateUser(form, '');
    });
}

if (updatePasswordForm) {

    updatePasswordForm.addEventListener('submit', async e => {

        e.preventDefault();
        const password = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const confirmNewPassword = document.getElementById('password-confirm').value;

        try {
            await updateUser({ password, confirmNewPassword, newPassword }, 'password');

        }
        catch (err) {
            console.log(err.message);
        } finally {
            console.log('setting parameters')
            document.getElementById('password-current').value = ' ';
            document.getElementById('password-confirm').value = ' ';
            document.getElementById('password').value = ' ';
        }
    });
}


if (bookTourForm) {
    bookTourForm.addEventListener('click', e => {
        e.target.textContent = 'processing...'
        const { tourId } = e.target.dataset;
        bookTour(tourId)
    })

}
