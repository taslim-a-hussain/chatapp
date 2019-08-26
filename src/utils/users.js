/**
 * List of users array
 * Contains the following keys:
 * id:
 * username:
 * room:
 */
const users = [];



const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        };
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    // Validate name
    if (existingUser) {
        return {
            error: 'Username is in use!'
        };
    }

    // Store user
    const user = { id, username, room };
    users.push(user);
    return {user};

};


// Remove a user by id
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};



// Get user by id
const getUser = (id) => {
   return users.find(user => user.id === id);
};


// Get users in room
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
};



module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};