const socket = io()

// Elements
const $messageForm = document.querySelector('form#send-message')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messageSendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

socket.on('location', (location) => {
    const html = Mustache.render($locationTemplate, {
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render($sidebarTemplate, {
        room, 
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute("disabled", "disabled")
    const msg = e.target.elements.message.value

    socket.emit("sendMessage", msg, (error) => {
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return alert(error)
        }
    })
})

$messageSendLocation.addEventListener('click', () => {
    $messageSendLocation.setAttribute("disabled", "disabled")
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported.")
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            if (error) {
                console.log(error)
            }
            $messageSendLocation.removeAttribute("disabled")
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})