import axios from 'axios'
const stripe = Stripe('pk_test_51Q5se9F21g7kIW3rvdVqg598tXsnHHbK7wC5xxaEcL2WS781T7nBMjjstB3Ti7fVO9pKMWykopTdoUlo0IrcT1Ni00uOaPJ0jf')
import { showAlert } from './alert'

export const bookTour = async tourId => {
    try {//1) get session from api
        const session = await axios({
            url: `/api/v1/bookings/checkoutSession/${tourId}`

        })

        //2) create a checkout form + credit card session
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (err) {

        showAlert('error', err)

    }
}