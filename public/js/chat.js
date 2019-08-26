const socket = io();

const $form = document.querySelector('#msg-form');
const $msg = $form.querySelector('input');
const $submitBtn = $form.querySelector('button'); 
const $locationBtn = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


// Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true});


const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};


socket.on('message', (msg) => {
    console.log(msg);
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});



socket.on('locationMessage', (url) => {
    console.log(url);
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        link: url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});



socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $sidebar.innerHTML = html;
});



$form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Disable the form btn
    $submitBtn.setAttribute('disabled', 'disabled');

    const msg = $msg.value;

    socket.emit('msg', msg, (error) => {

        // Enable the form btn
        $submitBtn.removeAttribute('disabled');
        // Clear the input value
        $msg.value = '';
        // Focus on input
        $msg.focus();

        if (error) {
            return console.log(error);
        }

        console.log('Message delevered!');
    });
});



$locationBtn.addEventListener('click', () => {

    if(!navigator.geolocation) {
        return alert('Geolacation is not supperted by your browser!');
    }

    // Disable location btn
    $locationBtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
                console.log('Location shared!');   
                // Enable location btn
                $locationBtn.removeAttribute('disabled');
                // Focus on msg input
                $msg.focus();
        });
    });

});


socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
    }
});